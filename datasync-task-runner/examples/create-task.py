from datetime import date, timedelta
from os import path

"""
Sample configuration to:
- Create and execute a task which syncs the specified subfolder from the source to the destination 

Prerequisites:
- Source/destination locations
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
            "LocationArn": "arn:aws:datasync:<region>:<account>:location/<location-id>"
        },
        "DestinationLocation": {
            "LocationArn": "arn:aws:datasync:<region>:<account>:location/<location-id>"
        },
        "Includes": [{"FilterType": "SIMPLE_PATTERN", "Value": folder}],
    }
