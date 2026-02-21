import re

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from residents.models import Resident
from .models import BrgyOfficial


def _normalize_barangay(value: str | None) -> str:
    text = (value or "").strip().lower()
    text = re.sub(r"\bbarangay\b", "", text)
    text = re.sub(r"\bbrgy\.?\b", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _cleanup_residents_for_barangay(barangay: str | None):
    target = _normalize_barangay(barangay)
    if not target:
        return

    residents = Resident.objects.filter(res_is_deleted=False)
    matched = []
    for resident in residents:
        resident_loc = _normalize_barangay(resident.res_location)
        if not resident_loc:
            continue
        if target in resident_loc or resident_loc in target:
            matched.append(resident)

    if not matched:
        return

    resident_ids = [r.res_id for r in matched]
    emails = [r.res_email_address for r in matched if r.res_email_address]

    with transaction.atomic():
        Resident.objects.filter(res_id__in=resident_ids).delete()
        User.objects.filter(username__in=emails).delete()


@receiver(post_save, sender=BrgyOfficial)
def delete_barangay_residents_on_soft_delete(sender, instance: BrgyOfficial, **kwargs):
    if instance.official_is_deleted:
        _cleanup_residents_for_barangay(instance.official_barangay)


@receiver(pre_delete, sender=BrgyOfficial)
def delete_barangay_residents_on_hard_delete(sender, instance: BrgyOfficial, **kwargs):
    _cleanup_residents_for_barangay(instance.official_barangay)
