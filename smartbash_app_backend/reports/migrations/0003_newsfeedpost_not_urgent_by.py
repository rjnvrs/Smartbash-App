from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reports", "0002_newsfeedpost_comments_shared_by_share_count"),
    ]

    operations = [
        migrations.AddField(
            model_name="newsfeedpost",
            name="not_urgent_by",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
