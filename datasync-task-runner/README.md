# datasync-task-runner

### Overview
This tool wraps AWS DataSync to provide customizable task creation and execution.

### Prerequisites
- DataSync Agent
- python 3.6+
  - boto3


### Getting Started

1. Create a DataSync Agent. Ensure the DataSync agent host has at least 4 cores, 32GB ram, and 80 GB of disk space.
2. Create a trust policy which allows DataSync to assume an IAM role. Also, create any IAM roles which the DataSync Agent may use to access location resources (eg: read/write access to s3 buckets). https://docs.aws.amazon.com/datasync/latest/userguide/using-identity-based-policies.html
3. Create a policy which allows the DataSync Agent to write logs to Cloudwatch (eg: PutLogEvents and CreateLogStream). https://docs.aws.amazon.com/datasync/latest/userguide/monitor-datasync.html#cloudwatchlogs
4. Create an IAM role which allows access to all DataSync resources (eg: using the AWSDataSyncFullAccess policy)
5. Ensure that the host which will execute the DataSync task runner has been assigned the IAM role created in the previous step.
6. Ensure python 3 and boto3 are installed on the host.

### Create Task

#### Usage
```sh
# Execute create-task.py with the specified configuration. 
python3 common/create-task.py --config-file config.json

# Output: [created] {task_arn}
```

#### Example Configuration File (`config.json`)

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

### Run Task (Example)

Executes a task given an task ARN.

##### config.json
```json
{
  "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>"
}
```

##### run-task.py
```py
import json
from boto3 import client

def run_task(config):
    # execute task and return ARN
    return client("datasync").start_task_execution(
      TaskArn=config.get("TaskArn"),
    )

if __name__ == "__main__":
    # load configuration file
    with open("config.json") as cf:
        config = json.load(cf)

    result = run_task(config)
    print(result)
```

Test execution:
```
python3 run-task.py
```

If successful, create a `crontab` entry with the following contents:
```
0 23 * * * python3 /path/to/run-task.py
```


