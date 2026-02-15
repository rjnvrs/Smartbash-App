from django.db import models


class IncidentReport(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
    )
    INCIDENT_CHOICES = (
        ("Fire", "Fire"),
        ("Flood", "Flood"),
    )

    report_id = models.AutoField(primary_key=True)
    resident_email = models.CharField(max_length=255, db_index=True)
    resident_name = models.CharField(max_length=255, blank=True, null=True)
    barangay = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    incident_type = models.CharField(max_length=20, choices=INCIDENT_CHOICES)
    description = models.TextField(blank=True, null=True)
    location_text = models.CharField(max_length=500, blank=True, null=True)
    lat = models.FloatField(blank=True, null=True)
    lng = models.FloatField(blank=True, null=True)
    images = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "incident_reports"
        managed = True


class NewsFeedPost(models.Model):
    POST_TYPE_CHOICES = (
        ("EVENT", "EVENT"),
        ("HELP", "HELP"),
    )
    INCIDENT_CHOICES = (
        ("Fire", "Fire"),
        ("Flood", "Flood"),
    )

    post_id = models.AutoField(primary_key=True)
    author_email = models.CharField(max_length=255, db_index=True)
    author_name = models.CharField(max_length=255, blank=True, null=True)
    barangay = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    post_type = models.CharField(max_length=10, choices=POST_TYPE_CHOICES, default="EVENT")
    incident_type = models.CharField(max_length=20, choices=INCIDENT_CHOICES, default="Fire")
    location_text = models.CharField(max_length=500, blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    image = models.TextField(blank=True, null=True)
    interested_by = models.JSONField(default=list, blank=True)
    saved_by = models.JSONField(default=list, blank=True)
    comments = models.JSONField(default=list, blank=True)
    shared_by = models.JSONField(default=list, blank=True)
    share_count = models.IntegerField(default=0)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "news_feed_posts"
        managed = True
