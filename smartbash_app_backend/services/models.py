from django.db import models

class Service(models.Model):
    svc_id = models.AutoField(primary_key=True)
    svc_name = models.CharField(max_length=255)
    svc_email_address = models.CharField(max_length=255, unique=True)
    svc_contact_number = models.CharField(max_length=20, blank=True, null=True)
    svc_password = models.CharField(max_length=255)
    svc_location = models.CharField(max_length=255, blank=True, null=True)
    svc_description = models.TextField(blank=True, null=True)
    svc_is_active = models.BooleanField(default=True)
    svc_added_on = models.DateTimeField(auto_now_add=True)
    svc_updated_on = models.DateTimeField(blank=True, null=True)
    svc_is_deleted = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = 'services'