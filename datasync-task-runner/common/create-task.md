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

### Example Configuration File (`config.json`)

Creates a task, as well as source and destination locations. The source location is a NFS mount, and the destination location is an S3 bucket.

```json
{
  "CloudWatchLogGroupArn": "arn:aws:logs:<region>:<account>:log-group:<task-log-group>:*",
  "SourceLocation": {
    "Type": "nfs",
    "Config": {
      "ServerHostname": "source-server-hostname",
      "Subdirectory": "/source/location/",
      "OnPremConfig": {
        "AgentArns": [
          "arn:aws:datasync:<region>:<account>:agent/<datasync-agent-id>"
        ]
      }
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
  }
}
```
