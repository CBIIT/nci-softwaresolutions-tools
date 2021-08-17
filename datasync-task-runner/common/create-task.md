# create-task.py

### Overview
This tool creates and updates AWS DataSync tasks and locations given a configuration.

### Prerequisites
- DataSync Agent
- python 3.6+
  - boto3

### Usage
```sh
# Execute create-task.py with the specified configuration. 
python3 create-task.py --config-file config.json

# Output: [created] {task_arn}
```

### Example Configuration File (`config.example.json`)

Creates a task, as well as source and destination locations. The source location is a SMB server file system, and the destination location is a S3 bucket.

```json
{
  "CloudWatchLogGroup": "task-log-group",
  "SourceLocation": {
    "Type": "smb",
    "Config": {
      "AgentArns": [
        "arn:aws:datasync:<region>:<account>:agent/<datasync-agent-id>"
      ],
      "ServerHostname": "string",
      "Domain": "string",
      "User": "string",
      "Password": "string",
      "Subdirectory": "string"
    }
  },
  "DestinationLocation": {
    "Type": "s3",
    "Config": {
      "S3BucketArn": "arn:aws:s3:::<destination-bucket>",
      "S3Config": {
        "BucketAccessRoleArn": "arn:aws:iam::<account>:role/<s3-access-role>"
      },
      "Subdirectory": "/destination/location/"
    }
  },
  "Options": { 
    "LogLevel": "TRANSFER",
    "OverwriteMode": "ALWAYS",
    "PreserveDeletedFiles": "PRESERVE",
    "TaskQueueing": "ENABLED",
    "TransferMode": "CHANGED",
    "VerifyMode": "ONLY_FILES_TRANSFERRED"
 }
}
```
