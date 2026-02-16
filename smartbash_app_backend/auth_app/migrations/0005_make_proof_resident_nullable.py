from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("auth_app", "0004_proofofauthority_subject_email_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE resident_proofs
                    ALTER COLUMN res_id DROP NOT NULL;
            """,
            reverse_sql="""
                ALTER TABLE resident_proofs
                    ALTER COLUMN res_id SET NOT NULL;
            """,
        )
    ]
