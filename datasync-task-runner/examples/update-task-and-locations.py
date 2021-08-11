from datetime import date, timedelta
from os import path

"""
Sample configuration to:
- Update metadata for existing locations
- Update an existing task's metadata
- Execute a task which syncs the source files to the destination
"""


def configure_task():
    """Updates configuration metadata for existing task and locations"""
    return {
        "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>",
        "SourceLocation": {
            "LocationArn": "arn:aws:datasync:<region>:<account>:location/<location-id>",
            "Type": "nfs",
            "Config": {"Subdirectory": "/new/source/subdirectory/"},
        },
         "DestinationLocation": {
            "LocationArn": "arn:aws:datasync:<region>:<account>:location/<location-id>",
            "Type": "smb",
            "Config": {"Subdirectory": "/new/destination/subdirectory/"},
        },
        "Options": {"PreserveDeletedFiles": "REMOVE"},
    }
