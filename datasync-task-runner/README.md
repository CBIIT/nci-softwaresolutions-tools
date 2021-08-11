# datasync-task-runner

### Overview
This tool wraps AWS DataSync to provide scriptable task creation and execution.

### Prerequisites
- DataSync Agent
- python 3.6+

### Usage
```sh
# Install dependencies (preferably in a virtual environment)
pip3 install -r requirements.txt

# Execute run-task.py with the specified configuration. 
python3 run-task.py --config-file config.py

# If source/destination locations change frequently and the task needs to run on a regular basis,
# create a cron job for run-task.py
0 23 * * * python3 run-task.py --config-file config.py

# Users may also call the task runner as a docker container
docker build -t run-task .
docker run \
  -v $PWD/config.py:/config.py:ro \ # mount configuration file at /config.py
  -v ~/.aws:/root/.aws:ro \ # mount .aws directory if needed
  run-task -c /config.py # execute run-task with the provided configuration
```

### Example Configuration File (`examples/sync-daily.py`)

A task has been created with fixed source and destination locations. When called with the configuration below, the task runner will copy yesterday's files (which are assumed to be in a folder called YYYY-MM-DD) to the destination. If the folder does not exist, it will not be copied to the destination.

```python
from datetime import date, timedelta

yesterday = date.today() - timedelta(days=1)
folder = yesterday.strftime("%Y-%m-%d")

def configure_task():
    return {
        "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>",
        "Includes": [{"FilterType": "SIMPLE_PATTERN", "Value": folder}],
    }
```

### Example Configuration File (`examples/create-task-and-locations.py`)
No task or locations have been created yet. The task runner will:
- Create a source nfs location
- Create a destination s3 location
- Create and execute a task which syncs source files to the destination

```python
from datetime import date, timedelta
from os import path

yesterday = date.today() - timedelta(days=1)
folder = yesterday.strftime("%Y-%m-%d")

def configure_task():
    return {
        "CloudWatchLogGroupArn": "arn:aws:logs:<region>:<account>:log-group:<log-group-name>:*",
        "SourceLocation": {
            "Type": "nfs",
            "Config": {
                {
                    "ServerHostname": "source-server-hostname",
                    "Subdirectory": f"/source/subdirectory",
                    "OnPremConfig": {
                        "AgentArns": [
                            "arn:aws:datasync:<region>:<account>:agent/<agent-id>"
                        ]
                    },
                }
            },
        },
        "DestinationLocation": {
            "Type": "s3",
            "Config": {
                "S3BucketArn": "arn:aws:s3:::<destination-bucket>",
                "S3Config": {
                    "BucketAccessRoleArn": "arn:aws:iam::<account>:role/<access-role-name>"
                },
                "Subdirectory": f"/destination/subdirectory",
            },
        },
        "Includes": [{"FilterType": "SIMPLE_PATTERN", "Value": folder}],
    }
```

### Example Configuration File (`examples/lifecycle-hooks.py`)
The task runner will execute a predefined task and invoke the following user-defined lifecycle hooks:
- Before task configuration
- Before task execution
- During task execution (at regular intervals)
- After task execution

Note: Hooks allow the user to inspect the current task and its execution status (enabling integration with other tools), and to cancel task creation or execution. 

```python
def configure_task():
    return { "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>" }

def before_task_configuration():
    """ Invoked before task configuration """
    return True # False cancels task creation and execution

def before_task_execution(task_status):
    """ Invoked before task execution """
    print(task_status)
    return True # False cancels task execution (eg: if we only wish to create/configure tasks and/or locations, or if execution conditions are not met)

def during_task_execution(task_status, task_execution_status):
    """ Invoked during task execution at regular intervals """
    print(task_status)
    print(task_execution_status)
    return True # False cancels task execution

def after_task_execution(task_status, task_execution_status):
    """ Invoked after task execution has completed. """
    print(task_status)
    print(task_execution_status)
```

### Module Information

The run-task module exposes the following methods for interacting with DataSync.
- create_location - creates a DataSync location
- update_location - updates a DataSync location's metadata
- create_task - creates a DataSync task
- update_task - updates a DataSync task's metadata
- run_task - creates and/or executes a DataSync task given a configuration file
