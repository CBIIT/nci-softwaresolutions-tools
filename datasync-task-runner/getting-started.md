# SOP for DataSync Task Runner

## General Setup

1. Create a DataSync Agent. Ensure the DataSync agent host has at least 4 cores, 32GB ram, and 80 GB of disk space.
2. Create a trust policy which allows DataSync to assume an IAM role. Also, create any IAM roles which the DataSync Agent may use to access location resources (eg: read/write access to s3 buckets). https://docs.aws.amazon.com/datasync/latest/userguide/using-identity-based-policies.html
3. Create a policy which allows the DataSync Agent to write logs to Cloudwatch (eg: PutLogEvents and CreateLogStream). https://docs.aws.amazon.com/datasync/latest/userguide/monitor-datasync.html#cloudwatchlogs
4. Create an IAM role which allows access to all DataSync resources (eg: using the AWSDataSyncFullAccess policy)
5. Ensure that the host which will execute the DataSync task runner has been assigned the IAM role created in the previous step.
6. Ensure python 3 and boto3 are installed on the host.

## Task-specific Setup

### For each task:

1. Create a CloudWatch log group.
2. Create source/destination locations.
3. Create the task using the source/destination locations. Ensure the task is configured to log all transferred objects and files to the log group created in step 1. 
4. To validate execution of this task, select the created task and **start with overriding options**. Ensure that data is verified at the destination location, and that the transfer configuration specifies patterns for specific files/folders to include (if needed). Then, start the task and monitor until completion.

If execution completed successfully, we may now proceed with configuring the DataSync task runner to execute this task on a regular basis with dynamic filters. 

1. Download the DataSync task runner. 
```sh
wget https://raw.githubusercontent.com/park-brian/datasync-task-runner/main/run-task.py

chmod +x run-task.py
```
2. Create a config.py file with the following contents:

```python
def configure_task():
    return {
        "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>"
    }
```

As an example, we can create the following configuration which has custom requirements:

```python
from datetime import date, timedelta

# Sync a subfolder with the YYYY-MM-DD naming convention
yesterday = date.today() - timedelta(days=1)
folder = yesterday.strftime("%Y-%m-%d")

def configure_task():
    return {
        "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>",
        "Includes": [{"FilterType": "SIMPLE_PATTERN", "Value": folder}],
    }
```
3. Execute the task runner with the specified configuration. 
```sh
python3 run-task.py -c config.py
```
4. Once task execution has been verified, we may now proceed with creating a cron job to run this task on a regular basis. For example, to run the task daily, add the following crontab entry.
```sh
0 23 * * * python3 /path/to/run-task.py --config-file /path/to/config.py
```