from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import connection
from residents.models import Resident, Admin
from services.models import Service
from officials.models import BrgyOfficial


@api_view(['POST'])
def signup(request):
    data = request.data

    role = data.get('role')
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response({"message": "Email and password required"}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({"message": "User already exists"}, status=400)

    # Create AUTH user
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password
    )

    try:
        # Insert into appropriate table based on role
        if role == "Resident":
            Resident.objects.create(
                res_firstname=data.get('firstName'),
                res_middlename=data.get('middleName'),
                res_lastname=data.get('lastName'),
                res_contact_number=data.get('contactNo'),
                res_age=int(data.get('age', 0)),
                res_gender=data.get('gender'),
                res_email_address=email,
                res_password=user.password,  # hashed password
                res_location=data.get('location', '')
            )

        elif role == "Services":
            Service.objects.create(
                svc_name=data.get('name', ''),
                svc_email_address=email,
                svc_contact_number=data.get('contact', ''),
                svc_password=user.password,  # hashed password
                svc_location=data.get('location', ''),
                svc_description=data.get('description', '')
            )

        elif role == "BrgyOfficials":
            BrgyOfficial.objects.create(
                official_name=data.get('name', ''),
                official_email_address=email,
                official_contact_number=data.get('contact', ''),
                official_password=user.password,  # hashed password
                official_position=data.get('position', ''),
                official_barangay=data.get('barangayName', '')
            )

        else:
            return Response({"message": "Invalid role"}, status=400)

        return Response(
            {"message": "Registration successful"},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        # Delete the created user if something goes wrong
        user.delete()
        return Response({"message": str(e)}, status=400)


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    # Authenticate using email (username is email)
    user = authenticate(username=email, password=password)

    if not user:
        return Response({"message": "Invalid credentials"}, status=401)

    # Generate JWT tokens
    refresh = RefreshToken.from_user(user)

    # Determine user role by checking which table the email exists in
    role = None
    
    try:
        Resident.objects.get(res_email_address=email)
        role = "Resident"
    except Resident.DoesNotExist:
        pass
    
    try:
        Service.objects.get(svc_email_address=email)
        role = "Services"
    except Service.DoesNotExist:
        pass
    
    try:
        BrgyOfficial.objects.get(official_email_address=email)
        role = "BrgyOfficials"
    except BrgyOfficial.DoesNotExist:
        pass
    
    try:
        Admin.objects.get(admin_email_address=email)
        role = "Admin"
    except Admin.DoesNotExist:
        pass

    if not role:
        return Response({"message": "User role not found"}, status=401)

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