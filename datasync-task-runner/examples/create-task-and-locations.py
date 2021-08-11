from datetime import date, timedelta
from os import path

"""
Sample configuration to:
- Create a source nfs location
- Create a destination s3 location
- Create and execute a task which syncs source files to the destination
"""

# assuming folder name is YYYY-MM-DD
yesterday = date.today() - timedelta(days=1)
folder = yesterday.strftime("%Y-%m-%d")


def before_task_execution():
    """Proceed with task execution only if source folder exists"""
    source_path = f"/my-source/path/{folder}"
    return path.exists(source_path)


def configure_task():
    return {
        "CloudWatchLogGroupArn": "arn:aws:logs:<region>:<account>:log-group:<custom-log-group>:*",
        "SourceLocation": {
            "Type": "nfs",
            "Config": {
                {
                    "ServerHostname": "source-server-hostname",
                    "Subdirectory": f"/source/location/{folder}",
                    "OnPremConfig": {
                        "AgentArns": [
                            "arn:aws:datasync:<region>:<account>:agent/<custom-agent-id>"
                        ]
                    },
                }
            },
        },
        "DestinationLocation": {
            "Type": "s3",
            "Config": {
                "S3BucketArn": "arn:aws:s3:::<custom-destination-bucket>",
                "S3Config": {
                    "BucketAccessRoleArn": "arn:aws:iam::<account>:role/<custom-access-role>"
                },
                "Subdirectory": f"/destination/location/{folder}",
            },
        },
    }
