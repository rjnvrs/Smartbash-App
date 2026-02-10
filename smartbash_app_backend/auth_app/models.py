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
