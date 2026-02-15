from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reports", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="newsfeedpost",
            name="comments",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="newsfeedpost",
            name="share_count",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="newsfeedpost",
            name="shared_by",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
