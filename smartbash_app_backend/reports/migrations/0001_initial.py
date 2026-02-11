from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="IncidentReport",
            fields=[
                ("report_id", models.AutoField(primary_key=True, serialize=False)),
                ("resident_email", models.CharField(db_index=True, max_length=255)),
                ("resident_name", models.CharField(blank=True, max_length=255, null=True)),
                ("barangay", models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                ("incident_type", models.CharField(choices=[("Fire", "Fire"), ("Flood", "Flood")], max_length=20)),
                ("description", models.TextField(blank=True, null=True)),
                ("location_text", models.CharField(blank=True, max_length=500, null=True)),
                ("lat", models.FloatField(blank=True, null=True)),
                ("lng", models.FloatField(blank=True, null=True)),
                ("images", models.JSONField(blank=True, default=list)),
                (
                    "status",
                    models.CharField(
                        choices=[("Pending", "Pending"), ("In Progress", "In Progress"), ("Completed", "Completed")],
                        default="Pending",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "incident_reports", "managed": True},
        ),
        migrations.CreateModel(
            name="NewsFeedPost",
            fields=[
                ("post_id", models.AutoField(primary_key=True, serialize=False)),
                ("author_email", models.CharField(db_index=True, max_length=255)),
                ("author_name", models.CharField(blank=True, max_length=255, null=True)),
                ("barangay", models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                ("post_type", models.CharField(choices=[("EVENT", "EVENT"), ("HELP", "HELP")], default="EVENT", max_length=10)),
                ("incident_type", models.CharField(choices=[("Fire", "Fire"), ("Flood", "Flood")], default="Fire", max_length=20)),
                ("location_text", models.CharField(blank=True, max_length=500, null=True)),
                ("content", models.TextField(blank=True, null=True)),
                ("image", models.TextField(blank=True, null=True)),
                ("interested_by", models.JSONField(blank=True, default=list)),
                ("saved_by", models.JSONField(blank=True, default=list)),
                ("is_deleted", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "news_feed_posts", "managed": True},
        ),
    ]
