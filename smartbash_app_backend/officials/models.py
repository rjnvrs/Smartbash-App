from django.db import models

class BrgyOfficial(models.Model):
    official_id = models.AutoField(primary_key=True)
    official_name = models.CharField(max_length=255)
    official_email_address = models.CharField(max_length=255, unique=True)
    official_contact_number = models.CharField(max_length=20, blank=True, null=True)
    official_password = models.CharField(max_length=255)
    official_position = models.CharField(max_length=255, blank=True, null=True)
    official_barangay = models.CharField(max_length=255, blank=True, null=True)
    official_is_active = models.BooleanField(default=True)
    official_added_on = models.DateTimeField(auto_now_add=True)
    official_updated_on = models.DateTimeField(blank=True, null=True)
    official_is_deleted = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = 'brgy_officials'