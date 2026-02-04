from django.db import models

# Existing ENUM types can be represented as choices
GENDER_CHOICES = (
    ('M', 'Male'),
    ('F', 'Female'),
)

class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50)
    role_description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'roles'

class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    admin_role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, db_column='admin_role_id')
    admin_name = models.CharField(max_length=255)
    admin_password = models.CharField(max_length=255)
    admin_contact_no = models.CharField(max_length=20, blank=True, null=True)
    admin_email_address = models.CharField(max_length=255, unique=True)

    class Meta:
        managed = True
        db_table = 'admin'

class Resident(models.Model):
    res_id = models.AutoField(primary_key=True)
    res_role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, db_column='res_role_id')
    res_firstname = models.CharField(max_length=255)
    res_middlename = models.CharField(max_length=255, blank=True, null=True)
    res_lastname = models.CharField(max_length=255)
    res_contact_number = models.CharField(max_length=20, blank=True, null=True)
    res_age = models.IntegerField()
    res_gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    res_email_address = models.CharField(max_length=255, unique=True)
    res_password = models.CharField(max_length=255)
    res_is_active = models.BooleanField(default=True)
    res_last_login_at = models.DateTimeField(blank=True, null=True)
    res_added_on = models.DateTimeField(auto_now_add=True)
    res_updated_on = models.DateTimeField(blank=True, null=True)
    res_updated_by = models.CharField(max_length=255, blank=True, null=True)
    res_is_deleted = models.BooleanField(default=False)
    officials_id = models.IntegerField(blank=True, null=True)
    res_location = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'residents'
