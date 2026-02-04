from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from residents.models import Resident, Admin, Role
from django.db.utils import ProgrammingError
from django.db import transaction
from django.core.files.storage import default_storage
import os


@api_view(['POST'])
def signup(request):
    data = request.POST if request.content_type.startswith("multipart/") else request.data
    role = data.get('role')
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response({"message": "Email and password required"}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({"message": "User already exists"}, status=400)

    proof_file = None
    if hasattr(request, "FILES") and request.FILES.get("proofofAuthority"):
        proof_file = request.FILES.get("proofofAuthority")

    try:
        with transaction.atomic():
            user = User.objects.create_user(username=email, email=email, password=password)

            if role == "Resident":
                role_obj, _ = Role.objects.get_or_create(
                    role_name="Resident",
                    defaults={"role_description": "Regular resident"}
                )
                Resident.objects.create(
                    res_firstname=data.get('firstName'),
                    res_middlename=data.get('middleName'),
                    res_lastname=data.get('lastName'),
                    res_contact_number=data.get('contactNo'),
                    res_age=int(data.get('age', 0)) if data.get('age') else 0,
                    res_gender=data.get('gender'),
                    res_email_address=email,
                    res_password=user.password,
                    res_role=role_obj,
                    res_location=data.get('location', '')
                )

            elif role == "Services":
                from services.models import Service
                Service.objects.create(
                    svc_name=data.get('name') or data.get('firstName') or '',
                    svc_email_address=email,
                    svc_contact_number=data.get('contact') or data.get('contactNo'),
                    svc_password=user.password,
                    svc_location=data.get('location') or '',
                    svc_description=data.get('description') or ''
                )

            elif role == "BrgyOfficials":
                from officials.models import BrgyOfficial
                BrgyOfficial.objects.create(
                    official_name=data.get('name') or f"{data.get('firstName','')} {data.get('lastName','')}".strip(),
                    official_email_address=email,
                    official_contact_number=data.get('contact') or data.get('contactNo'),
                    official_password=user.password,
                    official_position=data.get('position') or '',
                    official_barangay=data.get('barangayName') or data.get('location') or ''
                )

            # Save proof file to uploads/ if provided (file not linked to models due to schema)
            if proof_file:
                upload_dir = "uploads/proofs"
                filename = default_storage.save(os.path.join(upload_dir, proof_file.name), proof_file)

    except Exception as e:
        try:
            user.delete()
        except Exception:
            pass
        return Response({"message": f"Registration failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)

    if not user:
        return Response({"message": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    role = "Resident"
    
    try:
        resident = Resident.objects.get(res_email_address=email)
        role = "Resident"
    except (Resident.DoesNotExist, ProgrammingError):
        pass

    try:
        admin = Admin.objects.get(admin_email_address=email)
        role = "Admin"
    except (Admin.DoesNotExist, ProgrammingError):
        pass

    return Response({
        "message": "Login successful",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "role": role,
        "user": {
            "id": user.id,
            "email": user.email
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def token_refresh(request):
    refresh = request.data.get('refresh')
    if not refresh:
        return Response({"message": "Refresh token required"}, status=400)
    
    try:
        refresh_token = RefreshToken(refresh)
        return Response({
            "access": str(refresh_token.access_token)
        }, status=200)
    except Exception as e:
        return Response(
            {"message": "Invalid or expired refresh token"},
            status=401
        )