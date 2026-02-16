from django.db import models


class ProofOfAuthority(models.Model):
    proof_id = models.AutoField(primary_key=True)
    file_path = models.CharField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="proofs",
        db_column="res_id",
        null=True,
        blank=True,
    )
    subject_role = models.CharField(max_length=50, blank=True, null=True)
    subject_email = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = True
        db_table = "resident_proofs"


class AdminNotification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    admin = models.ForeignKey(
        "residents.Admin",
        on_delete=models.CASCADE,
        related_name="notifications",
        db_column="admin_id",
    )
    subject_type = models.CharField(max_length=50)
    subject_id = models.IntegerField()
    status = models.CharField(max_length=20)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = "admin_notifications"
        unique_together = ("admin", "subject_type", "subject_id")


class ServiceDispatchNotification(models.Model):
    dispatch_id = models.AutoField(primary_key=True)
    service = models.ForeignKey(
        "services.Service",
        on_delete=models.CASCADE,
        related_name="dispatch_notifications",
        db_column="svc_id",
    )
    report_id = models.IntegerField()
    incident_type = models.CharField(max_length=20)
    barangay = models.CharField(max_length=255, blank=True, null=True)
    location_text = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=20, default="Dispatched")
    sms_sent = models.BooleanField(default=False)
    sms_error = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = "service_dispatch_notifications"


class UserProfileAvatar(models.Model):
    avatar_id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=30)
    email = models.CharField(max_length=255)
    image_path = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = "user_profile_avatars"
        unique_together = ("role", "email")
