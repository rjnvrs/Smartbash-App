from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='BrgyOfficial',
            fields=[
                ('official_id', models.AutoField(primary_key=True, serialize=False)),
                ('official_name', models.CharField(max_length=255)),
                ('official_email_address', models.CharField(max_length=255, unique=True)),
                ('official_contact_number', models.CharField(blank=True, max_length=20, null=True)),
                ('official_password', models.CharField(max_length=255)),
                ('official_position', models.CharField(blank=True, max_length=255, null=True)),
                ('official_barangay', models.CharField(blank=True, max_length=255, null=True)),
                ('official_is_active', models.BooleanField(default=True)),
                ('official_added_on', models.DateTimeField(auto_now_add=True)),
                ('official_updated_on', models.DateTimeField(blank=True, null=True)),
                ('official_is_deleted', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'brgy_officials',
                'managed': True,
            },
        ),
    ]
