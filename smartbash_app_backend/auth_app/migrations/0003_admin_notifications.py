from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("auth_app", "0002_add_proof_subject_fields"),
        ("residents", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="AdminNotification",
            fields=[
                ("notification_id", models.AutoField(primary_key=True, serialize=False)),
                ("subject_type", models.CharField(max_length=50)),
                ("subject_id", models.IntegerField()),
                ("status", models.CharField(max_length=20)),
                ("title", models.CharField(max_length=255)),
                ("description", models.CharField(blank=True, max_length=500, null=True)),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "admin",
                    models.ForeignKey(
                        db_column="admin_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to="residents.admin",
                    ),
                ),
            ],
            options={
                "managed": True,
                "db_table": "admin_notifications",
                "unique_together": {("admin", "subject_type", "subject_id")},
            },
        ),
    ]
