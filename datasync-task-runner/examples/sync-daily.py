from datetime import date, timedelta

"""
Sample configuration to sync a subfolder between a fixed source/destination location
on a daily basis

Prerequisites:
- A DataSync Task configured with the appropriate source/destination locations
- A cron job which executes the run-task.py script daily with the configuration below
"""

def configure_task():
    """
    Sync the specified folder to the destination location.
    If the folder does not exist on the source, no files will be synced.
    """

    # assuming folder name is YYYY-MM-DD
    yesterday = date.today() - timedelta(days=1)
    folder = yesterday.strftime("%Y-%m-%d")

    return {
        "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>",
        "Includes": [{"FilterType": "SIMPLE_PATTERN", "Value": folder}],
    }
