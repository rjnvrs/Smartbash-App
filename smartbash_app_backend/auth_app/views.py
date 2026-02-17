from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from residents.models import Resident, Admin, Role
from django.db.utils import ProgrammingError
from django.db import transaction
from django.db.models import Count
from django.db.models import Q
from django.core.files.storage import default_storage
from django.utils import timezone
from .models import AdminNotification, ProofOfAuthority, ServiceDispatchNotification, UserProfileAvatar
from reports.models import IncidentReport, NewsFeedPost
import os
import json
import urllib.request
import urllib.error
import urllib.parse
import re
import base64
from pathlib import Path


@api_view(['POST'])
@permission_classes([AllowAny])
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
                raw_service_type = (data.get('serviceType') or data.get('type') or data.get('description') or '').strip()
                normalized_service_type = 'Fire' if raw_service_type.lower() == 'fire' else 'Rescue'
                if not raw_service_type:
                    inferred_name = (data.get('name') or data.get('firstName') or '').lower()
                    if "bfp" in inferred_name or "fire" in inferred_name:
                        normalized_service_type = "Fire"
                service = Service.objects.create(
                    svc_name=data.get('name') or data.get('firstName') or '',
                    svc_email_address=email,
                    svc_contact_number=data.get('contact') or data.get('contactNo'),
                    svc_password=user.password,
                    svc_location=data.get('location') or '',
                    svc_description=normalized_service_type,
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


def _resolve_role_for_email(email: str) -> tuple[str, bool]:
    role = "Resident"
    is_active = True

    # Admin takes priority
    try:
        if email.lower() == "admin@smartbash.com":
            return "Admin", True
    except Exception:
        pass

    try:
        admin = Admin.objects.get(admin_email_address=email)
        if admin:
            return "Admin", True
    except (Admin.DoesNotExist, ProgrammingError):
        pass

    try:
        resident = Resident.objects.get(res_email_address=email)
        role = "Resident"
        is_active = resident.res_is_active and not resident.res_is_deleted
        return role, is_active
    except (Resident.DoesNotExist, ProgrammingError):
        pass

    try:
        from officials.models import BrgyOfficial

        official = BrgyOfficial.objects.get(official_email_address=email)
        role = "BrgyOfficials"
        is_active = official.official_is_active and not official.official_is_deleted
        return role, is_active
    except Exception:
        pass

    try:
        from services.models import Service

        service = Service.objects.get(svc_email_address=email)
        role = "Services"
        is_active = service.svc_is_active and not service.svc_is_deleted
        return role, is_active
    except Exception:
        pass

    return role, is_active


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


def _service_notification_payload(item: ServiceDispatchNotification) -> dict:
    lat = None
    lng = None
    description = ""
    location = item.location_text or ""
    try:
        report = IncidentReport.objects.filter(report_id=item.report_id).first()
        if report:
            lat = report.lat
            lng = report.lng
            description = report.description or ""
            location = report.location_text or location
    except Exception:
        pass
    return {
        "id": item.dispatch_id,
        "reportId": item.report_id,
        "incidentType": item.incident_type,
        "barangay": item.barangay or "",
        "location": location,
        "description": description,
        "lat": lat,
        "lng": lng,
        "status": item.status,
        "smsSent": item.sms_sent,
        "smsError": item.sms_error or "",
        "createdAt": item.created_at.isoformat() if item.created_at else "",
    }


def _get_resident_for_request(request):
    if not request.user or not request.user.is_authenticated:
        return None
    email = request.user.email or request.user.username
    if not email:
        return None
    try:
        return Resident.objects.get(res_email_address=email)
    except Exception:
        return None


def _parse_lat_lng(value: str | None):
    if not value:
        return None, None
    try:
        cleaned = value.replace("Lat:", "").replace("Lng:", "")
        parts = [p.strip() for p in cleaned.split(",")]
        if len(parts) >= 2:
            return float(parts[0]), float(parts[1])
    except Exception:
        return None, None
    return None, None


def _absolute_url(request, url: str | None) -> str | None:
    if not url:
        return None
    try:
        return request.build_absolute_uri(url)
    except Exception:
        return url


def _avatar_key(role: str, email: str | None) -> tuple[str, str]:
    return role.strip(), (email or "").strip().lower()


def _get_avatar_url(request, role: str, email: str | None) -> str | None:
    role_key, email_key = _avatar_key(role, email)
    if not role_key or not email_key:
        return None
    try:
        avatar = UserProfileAvatar.objects.filter(role=role_key, email=email_key).first()
        if not avatar:
            return None
        return _absolute_url(request, default_storage.url(avatar.image_path))
    except Exception:
        return None


def _save_avatar_file(role: str, email: str, image_file) -> tuple[bool, str | None, str | None]:
    role_key, email_key = _avatar_key(role, email)
    if not role_key or not email_key:
        return False, None, "Invalid role or email"
    if not image_file:
        return False, None, "Image file is required"

    ext = os.path.splitext(image_file.name or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    safe_email = re.sub(r"[^a-z0-9]+", "_", email_key)
    filename = f"{role_key.lower()}_{safe_email}_{int(timezone.now().timestamp())}{ext}"
    file_path = default_storage.save(os.path.join("uploads", "avatars", filename), image_file)

    avatar, created = UserProfileAvatar.objects.get_or_create(
        role=role_key,
        email=email_key,
        defaults={"image_path": file_path},
    )
    if not created:
        old_path = avatar.image_path
        avatar.image_path = file_path
        avatar.save(update_fields=["image_path", "updated_at"])
        if old_path and old_path != file_path:
            try:
                default_storage.delete(old_path)
            except Exception:
                pass
    return True, file_path, None


def _normalize_incident_type(value: str | None) -> str:
    if (value or "").lower() == "flood":
        return "Flood"
    return "Fire"


def _resident_full_name(resident: Resident) -> str:
    return " ".join(
        part
        for part in [resident.res_firstname, resident.res_middlename, resident.res_lastname]
        if part
    ).strip()


def _normalize_barangay(value: str | None) -> str:
    return " ".join((value or "").lower().split())


def _normalize_location_key(value: str | None) -> str:
    text = (value or "").strip().lower()
    # Normalize punctuation/spacing so same place text groups together reliably.
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return " ".join(text.split())


def _canonical_barangay(value: str | None) -> str:
    normalized = _normalize_barangay(value)
    if "pahina" in normalized and "san nicolas" in normalized:
        return "pahina san nicolas"
    if "duljo" in normalized and "fatima" in normalized:
        return "duljo fatima"
    if "cogon" in normalized and "pardo" in normalized:
        return "cogon pardo"
    if "bulacao" in normalized and "pardo" in normalized:
        return "bulacao pardo"
    return normalized


def _barangay_key(value: str | None) -> str:
    normalized = _normalize_barangay(value)
    normalized = normalized.replace("barangay ", "", 1)
    normalized = normalized.replace("brgy. ", "", 1).replace("brgy ", "", 1)
    return " ".join(normalized.split())


def _matches_official_barangay(official_barangay: str | None, resident_location: str | None) -> bool:
    official_key = _barangay_key(official_barangay)
    if not official_key:
        return True

    resident_key = _barangay_key(resident_location)
    if not resident_key:
        return False

    official_canonical = _canonical_barangay(official_key)
    resident_canonical = _canonical_barangay(resident_key)

    if official_key in resident_key or resident_key in official_key:
        return True

    if official_canonical == resident_canonical:
        return True

    if official_canonical and official_canonical in resident_canonical:
        return True

    if resident_canonical and resident_canonical in official_canonical:
        return True

    return False


def _normalize_phone_number(raw_phone: str | None) -> str:
    phone = re.sub(r"[^0-9+]", "", (raw_phone or "").strip())
    if not phone:
        return ""
    # PH local -> E.164
    if phone.startswith("09") and len(phone) == 11:
        return f"+63{phone[1:]}"
    if phone.startswith("9") and len(phone) == 10:
        return f"+63{phone}"
    if phone.startswith("63") and len(phone) == 12:
        return f"+{phone}"
    if phone.startswith("+"):
        return phone
    return phone


def _normalize_phone_for_semaphore(raw_phone: str | None) -> str:
    phone = _normalize_phone_number(raw_phone)
    digits = re.sub(r"[^0-9]", "", phone)
    if not digits:
        return ""
    # Semaphore accepts local PH mobile format. Convert to 09XXXXXXXXX.
    if digits.startswith("63") and len(digits) == 12:
        return f"0{digits[2:]}"
    if digits.startswith("9") and len(digits) == 10:
        return f"0{digits}"
    if digits.startswith("09") and len(digits) == 11:
        return digits
    return phone


def _read_env_file_value(key: str) -> str:
    try:
        env_path = Path(__file__).resolve().parents[1] / ".env"
        if not env_path.exists():
            return ""
        for line in env_path.read_text(encoding="utf-8").splitlines():
            raw = line.strip()
            if not raw or raw.startswith("#") or "=" not in raw:
                continue
            k, v = raw.split("=", 1)
            if k.strip() != key:
                continue
            value = v.strip().strip('"').strip("'")
            return value
    except Exception:
        return ""
    return ""


def _get_env_value(*keys: str) -> str:
    for key in keys:
        value = (os.environ.get(key) or "").strip()
        if value:
            return value
    for key in keys:
        value = _read_env_file_value(key).strip()
        if value:
            return value
    return ""


def _send_dispatch_sms(service, message_text: str) -> tuple[bool, str | None]:
    provider = (_get_env_value("SMS_PROVIDER") or "SEMAPHORE").strip().upper()

    if provider == "SEMAPHORE":
        semaphore_api_key = _get_env_value("SEMAPHORE_API_KEY", "SMS_API_KEY")
        semaphore_api_url = _get_env_value("SEMAPHORE_API_URL", "SMS_API_URL") or "https://api.semaphore.co/api/v4/messages"
        semaphore_sender_name = _get_env_value("SEMAPHORE_SENDER_NAME")
        phone = _normalize_phone_for_semaphore(service.svc_contact_number)

        if not semaphore_api_key:
            return False, "SMS provider not configured: missing SEMAPHORE_API_KEY"
        if not semaphore_api_url:
            return False, "SMS provider not configured: missing SEMAPHORE_API_URL"
        if not phone:
            return False, "Service contact number missing"

        def _post_semaphore(form_data: dict) -> tuple[bool, str | None]:
            payload = urllib.parse.urlencode(form_data).encode("utf-8")
            request = urllib.request.Request(
                semaphore_api_url,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(request, timeout=12) as response:
                    body = response.read().decode("utf-8", errors="ignore")
                    if 200 <= response.status < 300:
                        return True, None
                    return False, f"Semaphore HTTP {response.status}: {body[:200]}"
            except urllib.error.HTTPError as exc:
                try:
                    err_body = exc.read().decode("utf-8", errors="ignore")
                except Exception:
                    err_body = ""
                return False, f"Semaphore HTTP {exc.code}: {err_body[:200]}"
            except urllib.error.URLError as exc:
                return False, f"Semaphore URL error: {str(exc)}"

        form_data = {
            "apikey": semaphore_api_key,
            "number": phone,
            "message": message_text,
        }
        if semaphore_sender_name:
            form_data["sendername"] = semaphore_sender_name

        ok, err = _post_semaphore(form_data)
        if ok:
            return True, None
        # If configured sender name is not active yet, retry once without sendername.
        if semaphore_sender_name and err and "No active sender name found" in err:
            fallback_data = {
                "apikey": semaphore_api_key,
                "number": phone,
                "message": message_text,
            }
            ok2, err2 = _post_semaphore(fallback_data)
            if ok2:
                return True, None
            return False, err2
        return False, err

    if provider == "TWILIO":
        twilio_sid = _get_env_value("TWILIO_ACCOUNT_SID")
        twilio_token = _get_env_value("TWILIO_AUTH_TOKEN")
        twilio_from = _get_env_value("TWILIO_FROM_NUMBER")
        twilio_messaging_service_sid = _get_env_value("TWILIO_MESSAGING_SERVICE_SID")
        phone = _normalize_phone_number(service.svc_contact_number)

        if not twilio_sid or not twilio_token:
            return False, "SMS provider not configured: missing TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN"
        if not twilio_from and not twilio_messaging_service_sid:
            return False, "SMS provider not configured: missing TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID"
        if not phone:
            return False, "Service contact number missing"

        twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
        form_data = {
            "To": phone,
            "Body": message_text,
        }
        if twilio_messaging_service_sid:
            form_data["MessagingServiceSid"] = twilio_messaging_service_sid
        else:
            form_data["From"] = twilio_from

        payload = urllib.parse.urlencode(form_data).encode("utf-8")
        auth_token = base64.b64encode(f"{twilio_sid}:{twilio_token}".encode("utf-8")).decode("ascii")
        request = urllib.request.Request(
            twilio_url,
            data=payload,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Basic {auth_token}",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=12) as response:
                body = response.read().decode("utf-8", errors="ignore")
                if 200 <= response.status < 300:
                    return True, None
                return False, f"Twilio HTTP {response.status}: {body[:200]}"
        except urllib.error.HTTPError as exc:
            try:
                err_body = exc.read().decode("utf-8", errors="ignore")
            except Exception:
                err_body = ""
            return False, f"Twilio HTTP {exc.code}: {err_body[:200]}"
        except urllib.error.URLError as exc:
            return False, f"Twilio URL error: {str(exc)}"

    sms_api_url = _get_env_value("SMS_API_URL")
    sms_api_key = _get_env_value("SMS_API_KEY")
    phone = _normalize_phone_number(service.svc_contact_number)
    if not sms_api_url or not sms_api_key:
        return False, "SMS provider not configured"
    if not phone:
        return False, "Service contact number missing"
    payload = json.dumps({"to": phone, "message": message_text}).encode("utf-8")
    request = urllib.request.Request(
        sms_api_url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {sms_api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            if 200 <= response.status < 300:
                return True, None
            return False, f"SMS HTTP {response.status}"
    except urllib.error.URLError as exc:
        return False, str(exc)


def _matching_report_count(report: IncidentReport) -> int:
    location_text = (report.location_text or "").strip()
    if location_text:
        return IncidentReport.objects.filter(
            incident_type=report.incident_type,
            location_text__iexact=location_text,
        ).count()
    barangay = (report.barangay or "").strip()
    if barangay:
        return IncidentReport.objects.filter(
            incident_type=report.incident_type,
            barangay__iexact=barangay,
        ).count()
    return 1


def _notify_services_for_report(report: IncidentReport, report_count: int | None = None) -> dict:
    from services.models import Service

    incident_type = (report.incident_type or "").strip()
    services = Service.objects.filter(svc_is_active=True, svc_is_deleted=False)
    typed_services = services
    if incident_type == "Fire":
        typed_services = services.filter(
            Q(svc_description__iexact="Fire")
            | Q(svc_description__icontains="fire")
            | Q(svc_description__icontains="bfp")
        )
    else:
        typed_services = services.filter(
            Q(svc_description__iexact="Rescue")
            | Q(svc_description__icontains="rescue")
            | Q(svc_description__icontains="flood")
            | Q(svc_description__icontains="ambulance")
            | Q(svc_description__icontains="evac")
        )
    if typed_services.exists():
        services = typed_services

    barangay = (report.barangay or "").strip()
    if barangay:
        localized = services.filter(svc_location__icontains=barangay)
        if localized.exists():
            services = localized

    reports_in_cluster = report_count or _matching_report_count(report)
    services_login_url = os.environ.get("SERVICES_PORTAL_LOGIN_URL", "").strip()
    location_link = ""
    if report.lat is not None and report.lng is not None:
        location_link = f"https://www.openstreetmap.org/?mlat={report.lat}&mlon={report.lng}#map=18/{report.lat}/{report.lng}"

    message = (
        f"Smartbash Dispatch Alert\n"
        f"Service: {{service_name}}\n"
        f"Incident: {incident_type} ({reports_in_cluster} reports)\n"
        f"Barangay: {barangay or 'N/A'}\n"
        f"Location: {(report.location_text or '')[:120]}"
    )
    if location_link:
        message += f"\nLocation Link: {location_link}"
    if services_login_url:
        message += f"\nLogin: {services_login_url}"

    matched_services = services.count()
    notifications_created = 0
    sms_sent_count = 0
    sms_failed_count = 0
    errors: list[str] = []
    for service in services:
        sms_message = message.replace("{service_name}", service.svc_name or "Service Team")
        sms_sent, sms_error = _send_dispatch_sms(service, sms_message)
        ServiceDispatchNotification.objects.create(
            service=service,
            report_id=report.report_id,
            incident_type=incident_type,
            barangay=barangay,
            location_text=report.location_text or "",
            status="Dispatched",
            sms_sent=sms_sent,
            sms_error=sms_error,
        )
        notifications_created += 1
        if sms_sent:
            sms_sent_count += 1
        else:
            sms_failed_count += 1
            if sms_error:
                errors.append(f"{service.svc_name}: {sms_error}")

    return {
        "servicesMatched": matched_services,
        "notificationsCreated": notifications_created,
        "smsSent": sms_sent_count,
        "smsFailed": sms_failed_count,
        "errors": errors[:10],
    }


def _incident_row_to_dict(row: IncidentReport) -> dict:
    return {
        "id": row.report_id,
        "category": row.incident_type,
        "description": row.description or "",
        "location": row.location_text or row.barangay or "",
        "date": row.created_at.isoformat() if row.created_at else "",
        "status": row.status,
        "images": row.images or [],
        "residentName": row.resident_name or "",
        "residentEmail": row.resident_email or "",
    }


def _incident_urgency_from_count(report_count: int) -> str:
    if report_count <= 1:
        return "Low"
    if report_count <= 4:
        return "Moderate"
    if report_count <= 6:
        return "High"
    return "Critical"


def _official_incident_queryset(official):
    qs = IncidentReport.objects.all().order_by("-created_at")
    official_barangay_raw = (official.official_barangay or "").strip()
    official_barangay = _normalize_barangay(official_barangay_raw)
    official_core = official_barangay.replace("barangay ", "", 1).strip() if official_barangay else ""

    matching_terms = []
    if official_barangay_raw:
        matching_terms.append(official_barangay_raw)
    if official_core:
        matching_terms.append(official_core)
        matching_terms.append(f"Barangay {official_core}")

    resident_qs = Resident.objects.filter(res_is_deleted=False)
    resident_emails = set(
        resident_qs.filter(
            officials_id=official.official_id,
        ).values_list("res_email_address", flat=True)
    )
    if matching_terms:
        resident_emails.update(
            resident_qs.filter(
                Q(res_location__icontains=matching_terms[0])
                | Q(res_location__icontains=matching_terms[1] if len(matching_terms) > 1 else matching_terms[0])
                | Q(res_location__icontains=matching_terms[2] if len(matching_terms) > 2 else matching_terms[0])
            ).values_list("res_email_address", flat=True)
        )

    if not matching_terms and not resident_emails:
        return qs

    query = Q()
    if resident_emails:
        query |= Q(resident_email__in=list(resident_emails))
    for term in matching_terms:
        query |= Q(barangay__icontains=term)
        query |= Q(location_text__icontains=term)

    return qs.filter(
        query
    )


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
            url = _absolute_url(request, default_storage.url(proof.file_path))
            name = os.path.basename(proof.file_path)
            return url, name
        except Exception:
            return None, None

    try:
        for svc in Service.objects.all():
            proof_url, proof_name = get_proof(svc.svc_email_address, "Services")
            action_date = svc.svc_updated_on or svc.svc_added_on
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
                    "actionDate": action_date.isoformat() if action_date else None,
                }
            )
    except ProgrammingError:
        pass

    try:
        for official in BrgyOfficial.objects.all():
            proof_url, proof_name = get_proof(official.official_email_address, "BrgyOfficials")
            action_date = official.official_updated_on or official.official_added_on
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
                    "actionDate": action_date.isoformat() if action_date else None,
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
        return Response({"message": "Unauthorized"}, status=401)
    if not isinstance(admin, Admin):
        return Response({"message": "Unauthorized"}, status=401)

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
        qs = [res for res in qs if _matches_official_barangay(barangay, res.res_location)]

    for res in qs:
        full_name = " ".join(
            part
            for part in [res.res_firstname, res.res_middlename, res.res_lastname]
            if part
        ).strip()
        proof_url = None
        proof_name = None
        try:
            proof = ProofOfAuthority.objects.filter(resident=res).order_by("-uploaded_at").first()
            if proof:
                proof_url = _absolute_url(request, default_storage.url(proof.file_path))
                proof_name = os.path.basename(proof.file_path or "")
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
                "details": proof_name or "Proof of Authority",
                "status": _status_from_flags(res.res_is_active, res.res_is_deleted),
                "actionDate": res.res_updated_on.isoformat() if res.res_updated_on else None,
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
    if not _matches_official_barangay(official.official_barangay, res.res_location):
        return Response({"message": "Forbidden for this barangay"}, status=403)

    res.res_is_active = True
    res.res_is_deleted = False
    res.officials_id = official.official_id
    res.res_updated_on = timezone.now()
    res.res_updated_by = official.official_email_address
    res.save(update_fields=["res_is_active", "res_is_deleted", "officials_id", "res_updated_on", "res_updated_by"])

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
    if not _matches_official_barangay(official.official_barangay, res.res_location):
        return Response({"message": "Forbidden for this barangay"}, status=403)

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


def _service_type_from_description(description: str | None, name: str | None = None) -> str:
    name_text = (name or "").strip().lower()
    # Strong override: BFP/fire-named services should be Fire even if old data has Rescue.
    if "bfp" in name_text or "fire" in name_text:
        return "Fire"
    if "rescue" in name_text or "flood" in name_text:
        return "Rescue"

    desc = (description or "").strip().lower()
    if desc == "fire":
        return "Fire"
    if desc in ("rescue", "flood", "flood/rescue"):
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
    qs = Service.objects.filter(svc_is_deleted=False)
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
                "type": _service_type_from_description(svc.svc_description, svc.svc_name),
                "status": _service_status_from_flags(svc.svc_is_active, svc.svc_is_deleted),
            }
        )

    return Response({"services": services}, status=200)


@api_view(['GET'])
def officials_services_registered(request):
    official = _get_official_for_request(request)
    admin = _get_admin_for_request(request)
    service_user = _get_service_for_request(request)
    if not admin and not service_user and (not official or not official.official_is_active or official.official_is_deleted):
        return Response({"message": "Unauthorized"}, status=401)

    from services.models import Service

    # Only services that came from registration flow and were approved by Admin.
    qs = Service.objects.filter(svc_is_deleted=False, svc_is_active=True)

    items = []
    for svc in qs:
        if not User.objects.filter(username=svc.svc_email_address).exists():
            continue
        items.append(
            {
                "id": svc.svc_id,
                "title": svc.svc_name,
                "phone": svc.svc_contact_number or "",
                "email": svc.svc_email_address,
                "address": svc.svc_location or "",
                "type": _service_type_from_description(svc.svc_description, svc.svc_name),
                "status": _service_status_from_flags(svc.svc_is_active, svc.svc_is_deleted),
            }
        )

    return Response({"services": items}, status=200)


@api_view(['POST'])
def officials_services_create(request):
    official = _get_official_for_request(request)
    admin = _get_admin_for_request(request)
    service_user = _get_service_for_request(request)
    if not admin and not service_user and (not official or not official.official_is_active or official.official_is_deleted):
        return Response({"message": "Unauthorized"}, status=401)

    mode = (request.data.get("mode") or "manual").strip().lower()
    title = request.data.get("title") or ""
    phone = request.data.get("phone") or ""
    email = request.data.get("email") or ""
    address = request.data.get("address") or ""
    service_type = request.data.get("type") or "Rescue"
    status_value = request.data.get("status") or "Pending"

    from services.models import Service

    if mode == "automatic":
        service_id = request.data.get("service_id")
        if not service_id:
            return Response({"message": "Missing service_id for automatic mode"}, status=400)
        try:
            svc = Service.objects.get(svc_id=service_id, svc_is_deleted=False)
        except Service.DoesNotExist:
            return Response({"message": "Registered service not found"}, status=404)
        if not User.objects.filter(username=svc.svc_email_address).exists():
            return Response({"message": "Selected service is not from registered services"}, status=400)
        if official and not admin:
            svc.svc_location = (official.official_barangay or svc.svc_location or "").strip()
        svc.svc_is_active = True
        svc.svc_is_deleted = False
        svc.save(update_fields=["svc_location", "svc_is_active", "svc_is_deleted"])
        return Response({"message": "Registered service activated", "id": svc.svc_id}, status=200)

    if not title or not email:
        return Response({"message": "Title and email required"}, status=400)

    normalized_title = (title or "").strip().lower()
    normalized_phone = _normalize_phone_number(phone)
    normalized_email = (email or "").strip().lower()
    normalized_address = (address or "").strip().lower()
    normalized_type = (service_type or "").strip().lower()

    registered_qs = Service.objects.filter(
        svc_is_deleted=False,
        svc_email_address__in=User.objects.values_list("username", flat=True),
    )
    matched_registered = None
    for candidate in registered_qs:
        candidate_phone = _normalize_phone_number(candidate.svc_contact_number or "")
        candidate_type = (
            _service_type_from_description(candidate.svc_description, candidate.svc_name) or ""
        ).strip().lower()
        if (
            (candidate.svc_name or "").strip().lower() == normalized_title
            and (candidate.svc_email_address or "").strip().lower() == normalized_email
            and candidate_phone == normalized_phone
            and (candidate.svc_location or "").strip().lower() == normalized_address
            and candidate_type == normalized_type
        ):
            matched_registered = candidate
            break

    # Manual add rule:
    # Active only if details exactly match an already-registered service account.
    manual_is_active = matched_registered is not None
    is_active = manual_is_active
    is_deleted = False
    if official and not admin:
        address = (official.official_barangay or address).strip()

    existing_email = Service.objects.filter(svc_email_address=email).first()
    if existing_email:
        svc = existing_email
        svc.svc_name = title
        svc.svc_contact_number = phone
        svc.svc_location = address
        svc.svc_description = service_type
        svc.svc_is_active = is_active
        svc.svc_is_deleted = is_deleted
        svc.save(update_fields=[
            "svc_name",
            "svc_contact_number",
            "svc_location",
            "svc_description",
            "svc_is_active",
            "svc_is_deleted",
        ])
    else:
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
    service_type = request.data.get("type") or _service_type_from_description(svc.svc_description, svc.svc_name)
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


@api_view(['POST'])
def residents_incidents_create(request):
    resident = _get_resident_for_request(request)
    if not resident or not resident.res_is_active or resident.res_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    incident_type = _normalize_incident_type(request.data.get("type"))
    description = request.data.get("description") or ""
    location_text = request.data.get("location") or ""
    images = request.data.get("images") or []
    if not isinstance(images, list):
        images = []
    lat = request.data.get("lat")
    lng = request.data.get("lng")
    try:
        lat = float(lat) if lat is not None else None
        lng = float(lng) if lng is not None else None
    except (TypeError, ValueError):
        lat, lng = None, None
    if lat is None or lng is None:
        lat, lng = _parse_lat_lng(location_text)
    barangay_value = (resident.res_location or "").strip() or location_text

    report = IncidentReport.objects.create(
        resident_email=resident.res_email_address,
        resident_name=_resident_full_name(resident) or resident.res_email_address,
        barangay=barangay_value,
        incident_type=incident_type,
        description=description,
        location_text=location_text,
        lat=lat,
        lng=lng,
        images=images,
        status="Pending",
    )

    return Response(
        {
            "message": "Report submitted",
            "report": {
                "id": report.report_id,
                "status": report.status,
                "created_at": report.created_at.isoformat(),
            },
        },
        status=201,
    )


@api_view(['GET'])
def residents_incidents_my(request):
    resident = _get_resident_for_request(request)
    if not resident:
        return Response({"message": "Unauthorized"}, status=401)

    rows = IncidentReport.objects.filter(
        resident_email=resident.res_email_address
    ).order_by("-created_at")

    reports = [
        {
            "id": r.report_id,
            "type": r.incident_type.lower(),
            "status": "completed" if r.status == "Completed" else "inprogress" if r.status == "In Progress" else "waiting",
            "description": r.description or "",
            "location": r.location_text or "",
            "images": r.images or [],
            "createdAt": int(r.created_at.timestamp() * 1000) if r.created_at else 0,
        }
        for r in rows
    ]
    return Response({"reports": reports}, status=200)


@api_view(['POST'])
def residents_newsfeed_create(request):
    resident = _get_resident_for_request(request)
    if not resident:
        return Response({"message": "Unauthorized"}, status=401)

    post_type = request.data.get("postType") or "EVENT"
    incident_type = _normalize_incident_type(request.data.get("incidentType"))
    content = request.data.get("content") or ""
    location_text = request.data.get("location") or ""
    image = request.data.get("image")

    post = NewsFeedPost.objects.create(
        author_email=resident.res_email_address,
        author_name=_resident_full_name(resident) or resident.res_email_address,
        barangay=resident.res_location or "",
        post_type=post_type if post_type in ("EVENT", "HELP") else "EVENT",
        incident_type=incident_type,
        location_text=location_text,
        content=content,
        image=image,
    )
    return Response({"message": "Post created", "id": post.post_id}, status=201)


@api_view(['GET'])
def residents_newsfeed_list(request):
    resident = _get_resident_for_request(request)
    if not resident:
        return Response({"message": "Unauthorized"}, status=401)

    email = resident.res_email_address
    # Facebook-like feed: residents can see posts across barangays in the system.
    rows = NewsFeedPost.objects.filter(is_deleted=False).order_by("-created_at")[:100]
    author_emails = {
        (p.author_email or "").strip().lower()
        for p in rows
        if (p.author_email or "").strip()
    }
    avatar_by_email = {}
    if author_emails:
        try:
            avatars = UserProfileAvatar.objects.filter(role="Resident", email__in=list(author_emails))
            avatar_by_email = {
                a.email: _absolute_url(request, default_storage.url(a.image_path))
                for a in avatars
            }
        except Exception:
            avatar_by_email = {}
    posts = [
        {
            "id": p.post_id,
            "author": p.author_name or p.author_email,
            "authorEmail": p.author_email or "",
            "authorAvatarUrl": avatar_by_email.get((p.author_email or "").strip().lower()),
            "time": p.created_at.isoformat() if p.created_at else "",
            "postType": p.post_type,
            "incidentType": p.incident_type,
            "location": p.location_text or "",
            "content": p.content or "",
            "image": p.image,
            "interested": email in (p.interested_by or []),
            "saved": email in (p.saved_by or []),
            "comments": p.comments or [],
            "commentCount": len(p.comments or []),
            "shareCount": int(p.share_count or 0),
            "canDelete": (p.author_email or "") == email,
        }
        for p in rows
    ]
    return Response({"posts": posts}, status=200)


@api_view(['POST'])
def residents_newsfeed_interest(request):
    resident = _get_resident_for_request(request)
    if not resident:
        return Response({"message": "Unauthorized"}, status=401)
    post_id = request.data.get("id")
    try:
        post = NewsFeedPost.objects.get(post_id=post_id, is_deleted=False)
    except NewsFeedPost.DoesNotExist:
        return Response({"message": "Post not found"}, status=404)
    email = resident.res_email_address
    users = post.interested_by or []
    if email in users:
        users.remove(email)
    else:
        users.append(email)
    post.interested_by = users
    post.save(update_fields=["interested_by", "updated_at"])
    return Response({"message": "OK", "interested": email in users}, status=200)


@api_view(['POST'])
def residents_newsfeed_save(request):
    resident = _get_resident_for_request(request)
    if not resident:
        return Response({"message": "Unauthorized"}, status=401)
    post_id = request.data.get("id")
    try:
        post = NewsFeedPost.objects.get(post_id=post_id, is_deleted=False)
    except NewsFeedPost.DoesNotExist:
        return Response({"message": "Post not found"}, status=404)
    email = resident.res_email_address
    users = post.saved_by or []
    if email in users:
        users.remove(email)
    else:
        users.append(email)
    post.saved_by = users
    post.save(update_fields=["saved_by", "updated_at"])
    return Response({"message": "OK", "saved": email in users}, status=200)


@api_view(['POST'])
def residents_newsfeed_delete(request):
    resident = _get_resident_for_request(request)
    if not resident:
        return Response({"message": "Unauthorized"}, status=401)
    post_id = request.data.get("id")
    try:
        post = NewsFeedPost.objects.get(post_id=post_id, is_deleted=False)
    except NewsFeedPost.DoesNotExist:
        return Response({"message": "Post not found"}, status=404)
    if post.author_email != resident.res_email_address:
        return Response({"message": "Forbidden"}, status=403)
    post.is_deleted = True
    post.save(update_fields=["is_deleted", "updated_at"])
    return Response({"message": "Deleted"}, status=200)


@api_view(['POST'])
def residents_newsfeed_comment(request):
    resident = _get_resident_for_request(request)
    if not resident:
        return Response({"message": "Unauthorized"}, status=401)

    post_id = request.data.get("id")
    content = (request.data.get("content") or "").strip()
    if not post_id or not content:
        return Response({"message": "Missing id/content"}, status=400)

    try:
        post = NewsFeedPost.objects.get(post_id=post_id, is_deleted=False)
    except NewsFeedPost.DoesNotExist:
        return Response({"message": "Post not found"}, status=404)

    comments = post.comments or []
    comments.append(
        {
            "id": int(timezone.now().timestamp() * 1000),
            "author": _resident_full_name(resident) or resident.res_email_address,
            "authorEmail": resident.res_email_address,
            "content": content,
            "createdAt": timezone.now().isoformat(),
        }
    )
    post.comments = comments
    post.save(update_fields=["comments", "updated_at"])
    return Response({"message": "Comment added", "commentCount": len(comments)}, status=200)


@api_view(['POST'])
def residents_newsfeed_share(request):
    resident = _get_resident_for_request(request)
    if not resident:
        return Response({"message": "Unauthorized"}, status=401)

    post_id = request.data.get("id")
    if not post_id:
        return Response({"message": "Missing id"}, status=400)

    try:
        post = NewsFeedPost.objects.get(post_id=post_id, is_deleted=False)
    except NewsFeedPost.DoesNotExist:
        return Response({"message": "Post not found"}, status=404)

    email = resident.res_email_address
    shared_by = post.shared_by or []
    if email not in shared_by:
        shared_by.append(email)
        post.shared_by = shared_by
        post.share_count = len(shared_by)
        post.save(update_fields=["shared_by", "share_count", "updated_at"])

    return Response({"message": "Shared", "shareCount": int(post.share_count or 0)}, status=200)


@api_view(['GET'])
def officials_dashboard(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    rows = _official_incident_queryset(official)
    summary = {
        "totalReports": rows.count(),
        "fireReports": rows.filter(incident_type="Fire").count(),
        "floodReports": rows.filter(incident_type="Flood").count(),
        "pendingReports": rows.filter(status="Pending").count(),
        "inProgressReports": rows.filter(status="In Progress").count(),
        "resolvedReports": rows.filter(status="Completed").count(),
    }
    return Response(summary, status=200)


@api_view(['GET'])
def officials_reports_recent(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    rows = _official_incident_queryset(official)[:12]
    reports = [_incident_row_to_dict(row) for row in rows]
    return Response({"reports": reports}, status=200)


@api_view(['GET'])
def officials_reports_all(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    rows = _official_incident_queryset(official)
    reports = [_incident_row_to_dict(row) for row in rows]
    return Response({"reports": reports}, status=200)


@api_view(['GET'])
def officials_incidents_map(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    rows = _official_incident_queryset(official).exclude(status="Completed")

    grouped: dict[tuple[str, str], dict] = {}
    for row in rows:
        location_value = (row.location_text or row.barangay or "").strip()
        normalized_location = _normalize_location_key(location_value)
        if not normalized_location:
            if row.lat is not None and row.lng is not None:
                normalized_location = f"{round(float(row.lat), 4)}:{round(float(row.lng), 4)}"
            else:
                normalized_location = f"report-{row.report_id}"
        key = ((row.incident_type or "Fire"), normalized_location)

        entry = grouped.get(key)
        if not entry:
            grouped[key] = {
                "id": row.report_id,
                "type": row.incident_type.lower(),
                "reports": 1,
                "lat": float(row.lat) if row.lat is not None else None,
                "lon": float(row.lng) if row.lng is not None else None,
                "location": location_value,
                "reportIds": [row.report_id],
            }
        else:
            entry["reports"] += 1
            entry["reportIds"].append(row.report_id)
            if entry["lat"] is None and row.lat is not None:
                entry["lat"] = float(row.lat)
            if entry["lon"] is None and row.lng is not None:
                entry["lon"] = float(row.lng)

    incidents = []
    for entry in grouped.values():
        entry["urgency"] = _incident_urgency_from_count(entry["reports"])
        incidents.append(entry)

    return Response({"incidents": incidents}, status=200)


@api_view(['POST'])
def officials_reports_dispatch(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    report_id = request.data.get("id")
    if not report_id:
        return Response({"message": "Missing id"}, status=400)

    qs = _official_incident_queryset(official)
    report = qs.filter(report_id=report_id).first()
    if not report:
        return Response({"message": "Report not found"}, status=404)

    report_count = _matching_report_count(report)
    report.status = "In Progress"
    report.save(update_fields=["status", "updated_at"])
    notify_summary = _notify_services_for_report(report, report_count=report_count)
    return Response(
        {
            "message": "Dispatched",
            "id": report.report_id,
            "status": report.status,
            "reportCountAtLocation": report_count,
            **notify_summary,
        },
        status=200,
    )


@api_view(['POST'])
def officials_reports_dispatch_all(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    qs = _official_incident_queryset(official).filter(status="Pending")
    updated = 0
    total_matched = 0
    total_created = 0
    total_sms_sent = 0
    total_sms_failed = 0
    for report in qs:
        report_count = _matching_report_count(report)
        report.status = "In Progress"
        report.save(update_fields=["status", "updated_at"])
        notify_summary = _notify_services_for_report(report, report_count=report_count)
        total_matched += notify_summary["servicesMatched"]
        total_created += notify_summary["notificationsCreated"]
        total_sms_sent += notify_summary["smsSent"]
        total_sms_failed += notify_summary["smsFailed"]
        updated += 1
    return Response(
        {
            "message": "Dispatch complete",
            "updated": updated,
            "servicesMatched": total_matched,
            "notificationsCreated": total_created,
            "smsSent": total_sms_sent,
            "smsFailed": total_sms_failed,
        },
        status=200,
    )


@api_view(['GET'])
def services_dispatch_notifications(request):
    service_user = _get_service_for_request(request)
    if not service_user or service_user.svc_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    rows = ServiceDispatchNotification.objects.filter(service=service_user).order_by("-created_at")[:100]
    return Response({"dispatches": [_service_notification_payload(item) for item in rows]}, status=200)


@api_view(['POST'])
def services_dispatch_complete(request):
    service_user = _get_service_for_request(request)
    if not service_user or service_user.svc_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    dispatch_id = request.data.get("dispatchId")
    if not dispatch_id:
        return Response({"message": "Missing dispatchId"}, status=400)

    row = ServiceDispatchNotification.objects.filter(
        dispatch_id=dispatch_id,
        service=service_user,
    ).first()
    if not row:
        return Response({"message": "Dispatch not found"}, status=404)

    row.status = "Completed"
    row.save(update_fields=["status"])

    IncidentReport.objects.filter(report_id=row.report_id).update(status="Completed", updated_at=timezone.now())
    return Response({"message": "Completed"}, status=200)


@api_view(['GET'])
def officials_notifications(request):
    official = _get_official_for_request(request)
    if not official or not official.official_is_active or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    rows = _official_incident_queryset(official)
    notifications = []
    for row in rows[:20]:
        notifications.append(
            {
                "id": row.report_id,
                "title": f"{row.incident_type} report",
                "message": f"{row.incident_type} at {(row.location_text or row.barangay or 'Unknown location')}",
                "status": row.status,
                "createdAt": row.created_at.isoformat() if row.created_at else "",
            }
        )

    unread_count = rows.filter(status="Pending").count()
    return Response({"unreadCount": unread_count, "notifications": notifications}, status=200)


@api_view(['POST'])
def ai_chat(request):
    official = _get_official_for_request(request)
    admin = _get_admin_for_request(request)
    if not official and not admin:
        return Response({"message": "Unauthorized"}, status=401)
    prompt = request.data.get("message") or request.data.get("prompt") or ""
    return Response({"reply": "AI service not configured", "echo": prompt}, status=200)


@api_view(['POST'])
def logout(request):
    response = Response({"message": "Logged out"}, status=200)
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("user_role", path="/")
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)

    if not user:
        return Response({"message": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    role, is_active = _resolve_role_for_email(email)
    if user.is_superuser or user.is_staff:
        role, is_active = "Admin", True

    if role != "Admin" and not is_active:
        return Response({"message": "Account pending approval"}, status=403)

    refresh["role"] = role

    response = Response({
        "message": "Login successful",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "role": role,
        "user": {
            "id": user.id,
            "email": user.email
        }
    }, status=status.HTTP_200_OK)
    response.set_cookie(
        key="access_token",
        value=str(refresh.access_token),
        max_age=60 * 60 * 24,
        httponly=False,
        samesite="Lax",
        secure=False,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        max_age=60 * 60 * 24 * 7,
        httponly=False,
        samesite="Lax",
        secure=False,
        path="/",
    )
    response.set_cookie(
        key="user_role",
        value=role,
        max_age=60 * 60 * 24,
        httponly=False,
        samesite="Lax",
        secure=False,
        path="/",
    )
    return response


@api_view(['GET'])
def officials_profile(request):
    official = _get_official_for_request(request)
    if not official or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    return Response(
        {
            "profile": {
                "name": official.official_name or "",
                "barangay": official.official_barangay or "",
                "location": official.official_barangay or "",
                "email": official.official_email_address or "",
                "contact": official.official_contact_number or "",
                "position": official.official_position or "",
                "avatarUrl": _get_avatar_url(request, "BrgyOfficials", official.official_email_address),
            }
        },
        status=200,
    )


@api_view(['POST'])
def officials_profile_update(request):
    official = _get_official_for_request(request)
    if not official or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    official.official_name = (request.data.get("name") or official.official_name or "").strip()
    official.official_barangay = (request.data.get("barangay") or request.data.get("location") or official.official_barangay or "").strip()
    official.official_contact_number = (request.data.get("contact") or official.official_contact_number or "").strip()
    official.official_updated_on = timezone.now()
    official.save(update_fields=["official_name", "official_barangay", "official_contact_number", "official_updated_on"])

    return Response({"message": "Profile updated"}, status=200)


@api_view(['POST'])
def officials_profile_avatar_update(request):
    official = _get_official_for_request(request)
    if not official or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    image_file = request.FILES.get("avatar") if hasattr(request, "FILES") else None
    ok, _, error = _save_avatar_file("BrgyOfficials", official.official_email_address, image_file)
    if not ok:
        return Response({"message": error or "Failed to save avatar"}, status=400)

    return Response(
        {
            "message": "Avatar updated",
            "avatarUrl": _get_avatar_url(request, "BrgyOfficials", official.official_email_address),
        },
        status=200,
    )


@api_view(['POST'])
def officials_password_update(request):
    official = _get_official_for_request(request)
    if not official or official.official_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    current_password = (request.data.get("currentPassword") or "").strip()
    new_password = (request.data.get("newPassword") or "").strip()
    if not current_password or not new_password:
        return Response({"message": "Current and new password are required"}, status=400)

    user = authenticate(username=official.official_email_address, password=current_password)
    if not user:
        return Response({"message": "Current password is incorrect"}, status=400)

    user.set_password(new_password)
    user.save(update_fields=["password"])
    official.official_password = user.password
    official.official_updated_on = timezone.now()
    official.save(update_fields=["official_password", "official_updated_on"])

    return Response({"message": "Password updated"}, status=200)


@api_view(['GET'])
def residents_profile(request):
    resident = _get_resident_for_request(request)
    if not resident or resident.res_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    return Response(
        {
            "profile": {
                "firstName": resident.res_firstname or "",
                "middleName": resident.res_middlename or "",
                "lastName": resident.res_lastname or "",
                "location": resident.res_location or "",
                "age": resident.res_age,
                "gender": resident.res_gender or "",
                "email": resident.res_email_address or "",
                "contact": resident.res_contact_number or "",
                "avatarUrl": _get_avatar_url(request, "Resident", resident.res_email_address),
            }
        },
        status=200,
    )


@api_view(['POST'])
def residents_profile_update(request):
    resident = _get_resident_for_request(request)
    if not resident or resident.res_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    resident.res_firstname = (request.data.get("firstName") or resident.res_firstname or "").strip()
    resident.res_middlename = (request.data.get("middleName") or resident.res_middlename or "").strip()
    resident.res_lastname = (request.data.get("lastName") or resident.res_lastname or "").strip()
    resident.res_location = (request.data.get("location") or resident.res_location or "").strip()

    age_value = request.data.get("age")
    if age_value not in (None, ""):
        try:
            resident.res_age = int(age_value)
        except (TypeError, ValueError):
            return Response({"message": "Invalid age"}, status=400)

    gender_value = (request.data.get("gender") or resident.res_gender or "").strip().upper()
    if gender_value in ("M", "F"):
        resident.res_gender = gender_value

    resident.res_contact_number = (request.data.get("contact") or resident.res_contact_number or "").strip()
    resident.res_updated_on = timezone.now()
    resident.save(update_fields=[
        "res_firstname",
        "res_middlename",
        "res_lastname",
        "res_location",
        "res_age",
        "res_gender",
        "res_contact_number",
        "res_updated_on",
    ])

    return Response({"message": "Profile updated"}, status=200)


@api_view(['POST'])
def residents_profile_avatar_update(request):
    resident = _get_resident_for_request(request)
    if not resident or resident.res_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    image_file = request.FILES.get("avatar") if hasattr(request, "FILES") else None
    ok, _, error = _save_avatar_file("Resident", resident.res_email_address, image_file)
    if not ok:
        return Response({"message": error or "Failed to save avatar"}, status=400)

    return Response(
        {
            "message": "Avatar updated",
            "avatarUrl": _get_avatar_url(request, "Resident", resident.res_email_address),
        },
        status=200,
    )


@api_view(['POST'])
def residents_password_update(request):
    resident = _get_resident_for_request(request)
    if not resident or resident.res_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    current_password = (request.data.get("currentPassword") or "").strip()
    new_password = (request.data.get("newPassword") or "").strip()
    if not current_password or not new_password:
        return Response({"message": "Current and new password are required"}, status=400)

    user = authenticate(username=resident.res_email_address, password=current_password)
    if not user:
        return Response({"message": "Current password is incorrect"}, status=400)

    user.set_password(new_password)
    user.save(update_fields=["password"])
    resident.res_password = user.password
    resident.res_updated_on = timezone.now()
    resident.save(update_fields=["res_password", "res_updated_on"])

    return Response({"message": "Password updated"}, status=200)


@api_view(['GET'])
def services_profile(request):
    service = _get_service_for_request(request)
    if not service or service.svc_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    return Response(
        {
            "profile": {
                "teamName": service.svc_name or "",
                "location": service.svc_location or "",
                "email": service.svc_email_address or "",
                "contact": service.svc_contact_number or "",
                "avatarUrl": _get_avatar_url(request, "Services", service.svc_email_address),
            }
        },
        status=200,
    )


@api_view(['POST'])
def services_profile_update(request):
    service = _get_service_for_request(request)
    if not service or service.svc_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    service.svc_name = (request.data.get("teamName") or service.svc_name or "").strip()
    service.svc_location = (request.data.get("location") or service.svc_location or "").strip()
    service.svc_contact_number = (request.data.get("contact") or service.svc_contact_number or "").strip()
    service.svc_updated_on = timezone.now()
    service.save(update_fields=["svc_name", "svc_location", "svc_contact_number", "svc_updated_on"])

    return Response({"message": "Profile updated"}, status=200)


@api_view(['POST'])
def services_profile_avatar_update(request):
    service = _get_service_for_request(request)
    if not service or service.svc_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    image_file = request.FILES.get("avatar") if hasattr(request, "FILES") else None
    ok, _, error = _save_avatar_file("Services", service.svc_email_address, image_file)
    if not ok:
        return Response({"message": error or "Failed to save avatar"}, status=400)

    return Response(
        {
            "message": "Avatar updated",
            "avatarUrl": _get_avatar_url(request, "Services", service.svc_email_address),
        },
        status=200,
    )


@api_view(['POST'])
def services_password_update(request):
    service = _get_service_for_request(request)
    if not service or service.svc_is_deleted:
        return Response({"message": "Unauthorized"}, status=401)

    current_password = (request.data.get("currentPassword") or "").strip()
    new_password = (request.data.get("newPassword") or "").strip()
    if not current_password or not new_password:
        return Response({"message": "Current and new password are required"}, status=400)

    user = authenticate(username=service.svc_email_address, password=current_password)
    if not user:
        return Response({"message": "Current password is incorrect"}, status=400)

    user.set_password(new_password)
    user.save(update_fields=["password"])
    service.svc_password = user.password
    service.svc_updated_on = timezone.now()
    service.save(update_fields=["svc_password", "svc_updated_on"])

    return Response({"message": "Password updated"}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    refresh = request.data.get('refresh')
    if not refresh:
        return Response({"message": "Refresh token required"}, status=400)
    
    try:
        refresh_token = RefreshToken(refresh)
        role = refresh_token.payload.get("role")
        if not role:
            user_id = refresh_token.payload.get("user_id")
            if user_id:
                user = User.objects.filter(id=user_id).first()
                if user:
                    role, _ = _resolve_role_for_email(user.email or user.username or "")
        if role:
            refresh_token["role"] = role
        access = refresh_token.access_token
        if role:
            access["role"] = role
        return Response(
            {
                "access": str(access),
                "role": role,
            },
            status=200,
        )
    except Exception as e:
        return Response(
            {"message": "Invalid or expired refresh token"},
            status=401
        )


