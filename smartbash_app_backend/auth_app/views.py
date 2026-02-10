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
from django.utils import timezone
from .models import AdminNotification, ProofOfAuthority
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

    created_id = None
    created_role = role
    resident = None

    try:
        with transaction.atomic():
            user = User.objects.create_user(username=email, email=email, password=password)

            if role == "Resident":
                role_obj, _ = Role.objects.get_or_create(
                    role_name="Resident",
                    defaults={"role_description": "Regular resident"}
                )
                resident = Resident.objects.create(
                    res_firstname=data.get('firstName'),
                    res_middlename=data.get('middleName'),
                    res_lastname=data.get('lastName'),
                    res_contact_number=data.get('contactNo'),
                    res_age=int(data.get('age', 0)) if data.get('age') else 0,
                    res_gender=data.get('gender'),
                    res_email_address=email,
                    res_password=user.password,
                    res_role=role_obj,
                    res_location=data.get('location', ''),
                    res_is_active=False,
                    res_is_deleted=False,
                )
                created_id = resident.pk

            elif role == "Services":
                from services.models import Service
                service = Service.objects.create(
                    svc_name=data.get('name') or data.get('firstName') or '',
                    svc_email_address=email,
                    svc_contact_number=data.get('contact') or data.get('contactNo'),
                    svc_password=user.password,
                    svc_location=data.get('location') or '',
                    svc_description=data.get('description') or '',
                    svc_is_active=False,
                    svc_is_deleted=False,
                )
                created_id = service.pk
                admin = _get_default_admin()
                if admin:
                    try:
                        AdminNotification.objects.update_or_create(
                            admin=admin,
                            subject_type="Services",
                            subject_id=int(created_id),
                            defaults={
                                "status": "Pending",
                                "title": "New Services registration",
                                "description": f"{service.svc_name} pending approval",
                                "is_read": False,
                                "updated_at": timezone.now(),
                            },
                        )
                    except ProgrammingError:
                        pass

            elif role == "BrgyOfficials":
                from officials.models import BrgyOfficial
                official_name = data.get('name') or data.get('barangayName') or f"{data.get('firstName','')} {data.get('lastName','')}".strip() or email
                official = BrgyOfficial.objects.create(
                    official_name=official_name,
                    official_email_address=email,
                    official_contact_number=data.get('contact') or data.get('contactNo'),
                    official_password=user.password,
                    official_position=data.get('position') or '',
                    official_barangay=data.get('barangayName') or data.get('location') or '',
                    official_is_active=False,
                    official_is_deleted=False,
                )
                created_id = official.pk
                admin = _get_default_admin()
                if admin:
                    try:
                        AdminNotification.objects.update_or_create(
                            admin=admin,
                            subject_type="Brgy. Officials",
                            subject_id=int(created_id),
                            defaults={
                                "status": "Pending",
                                "title": "New Official registration",
                                "description": f"{official.official_name} pending approval",
                                "is_read": False,
                                "updated_at": timezone.now(),
                            },
                        )
                    except ProgrammingError:
                        pass
            else:
                created_role = "Resident"

            # Save proof file to uploads/ if provided (file not linked to models due to schema)
            if proof_file:
                upload_dir = "uploads/proofs"
                filename = default_storage.save(os.path.join(upload_dir, proof_file.name), proof_file)
                try:
                    ProofOfAuthority.objects.create(
                        file_path=filename,
                        resident=resident,
                        subject_role=role,
                        subject_email=email,
                    )
                except ProgrammingError:
                    pass

    except Exception as e:
        try:
            user.delete()
        except Exception:
            pass
        return Response({"message": f"Registration failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {
            "message": "Registration successful",
            "role": created_role,
            "created_id": created_id,
        },
        status=status.HTTP_201_CREATED,
    )


def _status_from_flags(is_active: bool, is_deleted: bool) -> str:
    if is_deleted:
        return "Removed"
    if is_active:
        return "Approved"
    return "Pending"


def _flags_from_status(status_value: str) -> tuple[bool, bool]:
    if status_value == "Approved":
        return True, False
    if status_value == "Removed":
        return False, True
    return False, False


class _VirtualAdmin:
    def __init__(self, name: str, email: str):
        self.admin_name = name
        self.admin_email_address = email


def _get_admin_for_request(request):
    if not request.user or not request.user.is_authenticated:
        return None
    email = request.user.email or request.user.username
    if not email:
        return None
    if request.user.is_superuser or request.user.is_staff or email.lower() == "admin@smartbash.com":
        name = request.user.get_full_name() or "Admin"
        try:
            role_obj, _ = Role.objects.get_or_create(
                role_name="Admin",
                defaults={"role_description": "System administrator"},
            )
            admin, _ = Admin.objects.get_or_create(
                admin_email_address=email,
                defaults={
                    "admin_name": name,
                    "admin_password": request.user.password,
                    "admin_contact_no": "",
                    "admin_role": role_obj,
                },
            )
            return admin
        except (ProgrammingError, Exception):
            return _VirtualAdmin(name, email)
    try:
        return Admin.objects.get(admin_email_address=email)
    except (Admin.DoesNotExist, ProgrammingError):
        return None


def _get_default_admin():
    try:
        return Admin.objects.order_by("admin_id").first()
    except (ProgrammingError, Exception):
        return None


def _get_official_for_request(request):
    if not request.user or not request.user.is_authenticated:
        return None
    email = request.user.email or request.user.username
    if not email:
        return None
    try:
        from officials.models import BrgyOfficial
        return BrgyOfficial.objects.get(official_email_address=email)
    except Exception:
        return None


def _get_service_for_request(request):
    if not request.user or not request.user.is_authenticated:
        return None
    email = request.user.email or request.user.username
    if not email:
        return None
    try:
        from services.models import Service
        return Service.objects.get(svc_email_address=email)
    except Exception:
        return None


@api_view(['GET'])
def admin_me(request):
    admin = _get_admin_for_request(request)
    if not admin:
        return Response({"message": "Unauthorized"}, status=401)
    return Response(
        {
            "name": admin.admin_name,
            "email": admin.admin_email_address,
        },
        status=200,
    )


@api_view(['GET'])
def admin_approvals(request):
    admin = _get_admin_for_request(request)
    if not admin:
        return Response({"message": "Unauthorized"}, status=401)

    users = []

    from services.models import Service
    from officials.models import BrgyOfficial

    def get_proof(email_value: str, role_value: str):
        try:
            proof = ProofOfAuthority.objects.filter(
                subject_email=email_value, subject_role=role_value
            ).order_by("-uploaded_at").first()
            if not proof:
                return None, None
            url = default_storage.url(proof.file_path)
            name = os.path.basename(proof.file_path)
            return url, name
        except Exception:
            return None, None

    try:
        for svc in Service.objects.all():
            proof_url, proof_name = get_proof(svc.svc_email_address, "Services")
            users.append(
                {
                    "id": svc.svc_id,
                    "fullName": svc.svc_name,
                    "email": svc.svc_email_address,
                    "contact": svc.svc_contact_number or "",
                    "details": proof_name or "Proof of Authority",
                    "status": _status_from_flags(svc.svc_is_active, svc.svc_is_deleted),
                    "role": "Services",
                    "proofUrl": proof_url,
                }
            )
    except ProgrammingError:
        pass

    try:
        for official in BrgyOfficial.objects.all():
            proof_url, proof_name = get_proof(official.official_email_address, "BrgyOfficials")
            users.append(
                {
                    "id": official.official_id,
                    "fullName": official.official_name or official.official_barangay or official.official_email_address,
                    "email": official.official_email_address,
                    "contact": official.official_contact_number or "",
                    "details": proof_name or "Proof of Authority",
                    "status": _status_from_flags(
                        official.official_is_active, official.official_is_deleted
                    ),
                    "role": "Brgy. Officials",
                    "proofUrl": proof_url,
                }
            )
    except ProgrammingError:
        # Table missing or DB not migrated; return what we have
        pass

    return Response({"users": users}, status=200)


@api_view(['POST'])
def admin_approvals_update(request):
    admin = _get_admin_for_request(request)
    if not admin:
        return Response({"message": "Unauthorized"}, status=401)

    role = request.data.get("role")
    target_id = request.data.get("id")
    new_status = request.data.get("status")

    if not role or not target_id or not new_status:
        return Response({"message": "Missing required fields"}, status=400)

    is_active, is_deleted = _flags_from_status(new_status)

    if role == "Services":
        from services.models import Service
        try:
            svc = Service.objects.get(svc_id=target_id)
        except Service.DoesNotExist:
            return Response({"message": "Service not found"}, status=404)
        except ProgrammingError:
            return Response({"message": "Services table missing"}, status=503)
        svc.svc_is_active = is_active
        svc.svc_is_deleted = is_deleted
        svc.save(update_fields=["svc_is_active", "svc_is_deleted"])
        subject_type = "Services"
        subject_name = svc.svc_name
    elif role == "Brgy. Officials":
        from officials.models import BrgyOfficial
        try:
            official = BrgyOfficial.objects.get(official_id=target_id)
        except BrgyOfficial.DoesNotExist:
            return Response({"message": "Official not found"}, status=404)
        except ProgrammingError:
            return Response({"message": "Officials table missing"}, status=503)
        official.official_is_active = is_active
        official.official_is_deleted = is_deleted
        official.save(update_fields=["official_is_active", "official_is_deleted"])
        subject_type = "Brgy. Officials"
        subject_name = official.official_name
    else:
        return Response({"message": "Invalid role"}, status=400)

    if isinstance(admin, Admin):
        try:
            AdminNotification.objects.update_or_create(
                admin=admin,
                subject_type=subject_type,
                subject_id=int(target_id),
                defaults={
                    "status": new_status,
                    "title": f"{subject_type} status updated",
                    "description": f"{subject_name} set to {new_status}",
                    "is_read": False,
                    "updated_at": timezone.now(),
                },
            )
        except ProgrammingError:
            pass

    return Response({"message": "Update successful"}, status=200)


@api_view(['GET'])
def admin_notifications(request):
    admin = _get_admin_for_request(request)
    if not admin:
        return Response({"notifications": []}, status=200)
    if not isinstance(admin, Admin):
        return Response({"notifications": []}, status=200)

    try:
        items = AdminNotification.objects.filter(admin=admin).order_by("-created_at")[:50]
    except ProgrammingError:
        items = []
    notifications = [
        {
            "id": str(n.notification_id),
            "title": n.title,
            "description": n.description or "",
            "time": n.updated_at.isoformat() if n.updated_at else None,
            "type": "pending" if n.status == "Pending" else "approved" if n.status == "Approved" else "removed",
            "unread": not n.is_read,
        }
        for n in items
    ]
    return Response({"notifications": notifications}, status=200)


@api_view(['POST'])
def admin_notifications_read(request):
    admin = _get_admin_for_request(request)
    if not admin:
        return Response({"message": "Unauthorized"}, status=401)

    notification_id = request.data.get("id")
    if not notification_id:
        return Response({"message": "Missing id"}, status=400)

    AdminNotification.objects.filter(
        admin=admin, notification_id=notification_id
    ).update(is_read=True, updated_at=timezone.now())
    return Response({"message": "OK"}, status=200)


@api_view(['POST'])
def admin_notifications_read_all(request):
    admin = _get_admin_for_request(request)
    if not admin:
        return Response({"message": "Unauthorized"}, status=401)

    AdminNotification.objects.filter(admin=admin, is_read=False).update(
        is_read=True, updated_at=timezone.now()
    )
    return Response({"message": "OK"}, status=200)


@api_view(['GET'])
def officials_residents_pending(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    barangay = (official.official_barangay or "").strip()
    residents = []
    qs = Resident.objects.all()
    if barangay:
        qs = qs.filter(res_location__icontains=barangay)

    for res in qs:
        full_name = " ".join(
            part
            for part in [res.res_firstname, res.res_middlename, res.res_lastname]
            if part
        ).strip()
        proof_url = None
        try:
            proof = ProofOfAuthority.objects.filter(resident=res).order_by("-uploaded_at").first()
            if proof:
                proof_url = default_storage.url(proof.file_path)
        except Exception:
            pass
        residents.append(
            {
                "id": res.res_id,
                "name": full_name or res.res_email_address,
                "email": res.res_email_address,
                "contact": res.res_contact_number or "",
                "gender": res.res_gender,
                "age": res.res_age,
                "details": "Proof of Authority",
                "status": _status_from_flags(res.res_is_active, res.res_is_deleted),
                "proofUrl": proof_url,
            }
        )

    return Response({"residents": residents}, status=200)


@api_view(['POST'])
def officials_residents_approve(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    res_id = request.data.get("res_id")
    if not res_id:
        return Response({"message": "Missing res_id"}, status=400)
    try:
        res = Resident.objects.get(res_id=res_id)
    except Resident.DoesNotExist:
        return Response({"message": "Resident not found"}, status=404)

    res.res_is_active = True
    res.res_is_deleted = False
    res.res_updated_on = timezone.now()
    res.res_updated_by = official.official_email_address
    res.save(update_fields=["res_is_active", "res_is_deleted", "res_updated_on", "res_updated_by"])

    return Response({"message": "Approved"}, status=200)


@api_view(['POST'])
def officials_residents_remove(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    res_id = request.data.get("res_id")
    if not res_id:
        return Response({"message": "Missing res_id"}, status=400)
    try:
        res = Resident.objects.get(res_id=res_id)
    except Resident.DoesNotExist:
        return Response({"message": "Resident not found"}, status=404)

    res.res_is_active = False
    res.res_is_deleted = True
    res.res_updated_on = timezone.now()
    res.res_updated_by = official.official_email_address
    res.save(update_fields=["res_is_active", "res_is_deleted", "res_updated_on", "res_updated_by"])

    return Response({"message": "Removed"}, status=200)


def _service_status_from_flags(is_active: bool, is_deleted: bool) -> str:
    if is_deleted:
        return "Inactive"
    if is_active:
        return "Active"
    return "Pending"


def _service_flags_from_status(status_value: str) -> tuple[bool, bool]:
    if status_value in ("Active", "Busy"):
        return True, False
    if status_value == "Inactive":
        return False, False
    return False, False


def _service_type_from_description(description: str | None) -> str:
    if not description:
        return "Rescue"
    if description.strip().lower() == "fire":
        return "Fire"
    if description.strip().lower() == "rescue":
        return "Rescue"
    return "Rescue"


@api_view(['GET'])
def officials_services_list(request):
    official = _get_official_for_request(request)
    admin = _get_admin_for_request(request)
    service_user = _get_service_for_request(request)
    if not admin and not service_user and (not official or not official.official_is_active or official.official_is_deleted):
        return Response({"message": "Unauthorized"}, status=401)

    from services.models import Service

    services = []
    qs = Service.objects.all()
    if official and not admin:
        barangay = (official.official_barangay or "").strip()
        if barangay:
            qs = qs.filter(svc_location__icontains=barangay)

    for svc in qs:
        services.append(
            {
                "id": svc.svc_id,
                "title": svc.svc_name,
                "chief": "",
                "phone": svc.svc_contact_number or "",
                "email": svc.svc_email_address,
                "address": svc.svc_location or "",
                "type": _service_type_from_description(svc.svc_description),
                "status": _service_status_from_flags(svc.svc_is_active, svc.svc_is_deleted),
            }
        )

    return Response({"services": services}, status=200)


@api_view(['POST'])
def officials_services_create(request):
    official = _get_official_for_request(request)
    admin = _get_admin_for_request(request)
    service_user = _get_service_for_request(request)
    if not admin and not service_user and (not official or not official.official_is_active or official.official_is_deleted):
        return Response({"message": "Unauthorized"}, status=401)

    title = request.data.get("title") or ""
    phone = request.data.get("phone") or ""
    email = request.data.get("email") or ""
    address = request.data.get("address") or ""
    service_type = request.data.get("type") or "Rescue"
    status_value = request.data.get("status") or "Pending"

    if not title or not email:
        return Response({"message": "Title and email required"}, status=400)

    is_active, is_deleted = _service_flags_from_status(status_value)
    if official and not admin:
        address = (official.official_barangay or address).strip()

    from services.models import Service
    svc = Service.objects.create(
        svc_name=title,
        svc_email_address=email,
        svc_contact_number=phone,
        svc_password="",
        svc_location=address,
        svc_description=service_type,
        svc_is_active=is_active,
        svc_is_deleted=is_deleted,
    )

    return Response({"message": "Created", "id": svc.svc_id}, status=201)


@api_view(['POST'])
def officials_services_update(request):
    official = _get_official_for_request(request)
    admin = _get_admin_for_request(request)
    service_user = _get_service_for_request(request)
    if not admin and not service_user and (not official or not official.official_is_active or official.official_is_deleted):
        return Response({"message": "Unauthorized"}, status=401)

    svc_id = request.data.get("id")
    if not svc_id:
        return Response({"message": "Missing id"}, status=400)

    from services.models import Service
    try:
        svc = Service.objects.get(svc_id=svc_id)
    except Service.DoesNotExist:
        return Response({"message": "Service not found"}, status=404)

    title = request.data.get("title") or svc.svc_name
    phone = request.data.get("phone") or svc.svc_contact_number
    email = request.data.get("email") or svc.svc_email_address
    address = request.data.get("address") or svc.svc_location
    service_type = request.data.get("type") or _service_type_from_description(svc.svc_description)
    status_value = request.data.get("status") or _service_status_from_flags(svc.svc_is_active, svc.svc_is_deleted)

    is_active, is_deleted = _service_flags_from_status(status_value)

    svc.svc_name = title
    svc.svc_contact_number = phone
    svc.svc_email_address = email
    if official and not admin:
        address = (official.official_barangay or address).strip()
    svc.svc_location = address
    svc.svc_description = service_type
    svc.svc_is_active = is_active
    svc.svc_is_deleted = is_deleted
    svc.save(update_fields=[
        "svc_name",
        "svc_contact_number",
        "svc_email_address",
        "svc_location",
        "svc_description",
        "svc_is_active",
        "svc_is_deleted",
    ])

    return Response({"message": "Updated"}, status=200)


@api_view(['POST'])
def officials_services_delete(request):
    official = _get_official_for_request(request)
    admin = _get_admin_for_request(request)
    service_user = _get_service_for_request(request)
    if not admin and not service_user and (not official or not official.official_is_active or official.official_is_deleted):
        return Response({"message": "Unauthorized"}, status=401)

    svc_id = request.data.get("id")
    if not svc_id:
        return Response({"message": "Missing id"}, status=400)

    from services.models import Service
    try:
        svc = Service.objects.get(svc_id=svc_id)
    except Service.DoesNotExist:
        return Response({"message": "Service not found"}, status=404)

    svc.svc_is_active = False
    svc.svc_is_deleted = True
    svc.save(update_fields=["svc_is_active", "svc_is_deleted"])

    return Response({"message": "Deleted"}, status=200)


@api_view(['GET'])
def officials_dashboard(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    summary = {
        "totalReports": 0,
        "fireReports": 0,
        "floodReports": 0,
        "pendingReports": 0,
        "inProgressReports": 0,
        "resolvedReports": 0,
    }
    return Response(summary, status=200)


@api_view(['GET'])
def officials_reports_recent(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    return Response({"reports": []}, status=200)


@api_view(['GET'])
def officials_reports_all(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    return Response({"reports": []}, status=200)


@api_view(['GET'])
def officials_incidents_map(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    return Response({"incidents": []}, status=200)


@api_view(['POST'])
def ai_chat(request):
    prompt = request.data.get("message") or request.data.get("prompt") or ""
    return Response({"reply": "AI service not configured", "echo": prompt}, status=200)


@api_view(['POST'])
def logout(request):
    return Response({"message": "Logged out"}, status=200)


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)

    if not user:
        return Response({"message": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    role = "Resident"
    is_active = True

    # Admin takes priority
    if user.is_superuser or user.is_staff or email.lower() == "admin@smartbash.com":
        role = "Admin"
        is_active = True
    else:
        try:
            admin = Admin.objects.get(admin_email_address=email)
            role = "Admin"
            is_active = True
        except (Admin.DoesNotExist, ProgrammingError):
            pass
    
    if role != "Admin":
        try:
            resident = Resident.objects.get(res_email_address=email)
            role = "Resident"
            is_active = resident.res_is_active and not resident.res_is_deleted
        except (Resident.DoesNotExist, ProgrammingError):
            pass

    if role != "Admin":
        try:
            from officials.models import BrgyOfficial
            official = BrgyOfficial.objects.get(official_email_address=email)
            role = "BrgyOfficials"
            is_active = official.official_is_active and not official.official_is_deleted
        except Exception:
            pass

    if role != "Admin":
        try:
            from services.models import Service
            service = Service.objects.get(svc_email_address=email)
            role = "Services"
            is_active = service.svc_is_active and not service.svc_is_deleted
        except Exception:
            pass

    if role != "Admin" and not is_active:
        return Response({"message": "Account pending approval"}, status=403)

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
