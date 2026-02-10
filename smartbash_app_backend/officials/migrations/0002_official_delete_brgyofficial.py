from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('officials', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Official',
            fields=[
                ('official_id', models.AutoField(primary_key=True, serialize=False)),
                ('official_role', models.CharField(blank=True, max_length=50, null=True)),
                ('official_brgy_name', models.CharField(blank=True, max_length=255, null=True)),
                ('official_contact_number', models.CharField(blank=True, max_length=20, null=True)),
                ('email_address', models.CharField(max_length=255, unique=True)),
                ('password', models.CharField(max_length=255)),
                ('is_active', models.BooleanField(default=True)),
                ('last_login_at', models.DateTimeField(blank=True, null=True)),
                ('added_on', models.DateTimeField(auto_now_add=True)),
                ('added_by', models.CharField(blank=True, max_length=255, null=True)),
                ('updated_on', models.DateTimeField(blank=True, null=True)),
                ('updated_by', models.CharField(blank=True, max_length=255, null=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('total_reports', models.IntegerField(default=0)),
                ('fire_reports', models.IntegerField(default=0)),
                ('flood_reports', models.IntegerField(default=0)),
                ('location_address', models.CharField(blank=True, max_length=255, null=True)),
                ('registered_services', models.CharField(blank=True, max_length=255, null=True)),
                ('fire_services', models.IntegerField(default=0)),
                ('flood_rescue_teams', models.IntegerField(default=0)),
            ],
            options={
                'db_table': 'public"."official',
                'managed': False,
            },
        ),
        migrations.DeleteModel(
            name='BrgyOfficial',
        ),
    ]
