from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("auth_app", "0007_merge_0006_alter_proofofauthority_resident_0006_servicedispatchnotification"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserProfileAvatar",
            fields=[
                ("avatar_id", models.AutoField(primary_key=True, serialize=False)),
                ("role", models.CharField(max_length=30)),
                ("email", models.CharField(max_length=255)),
                ("image_path", models.CharField(max_length=500)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "user_profile_avatars",
                "managed": True,
                "unique_together": {("role", "email")},
            },
        ),
    ]
