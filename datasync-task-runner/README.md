# datasync-task-runner

### Overview
This tool wraps AWS DataSync to provide scriptable task creation and execution.

### Prerequisites
- DataSync Agent
- python 3.6+

### Example Usage (`examples/run-daily-task.py`)

The following example demonstrates syncing a subfolder within a source location to a destination. The subfolder changes on a daily basis and is named using the YYYY-MM-DD convention. 

Create a `config.ini` file with the following contents:

```ini
TaskArn=arn:aws:datasync:<region>:<account>:task/<task-id>
```

Create a `run-daily-task.py` file in the same directory as the `config.ini` file with the following contents:

```python
#!/usr/bin/python3

from datetime import date, timedelta
from configparser import ConfigParser
from boto3 import client

config = ConfigParser()
config.read("config.ini")

if __name__ == "__main__":
    # assuming folder name is YYYY-MM-DD
    yesterday = date.today() - timedelta(days=1)
    folder = yesterday.strftime("%Y-%m-%d")

    result = client("datasync").start_task_execution(
      TaskArn=config.get("TaskArn"),
      Includes=[{"FilterType": "SIMPLE_PATTERN", "Value": folder}]
    ).get("TaskExecutionArn", None)

    print(result)
```

Test execution of the task runner:
```
python3 run-daily-task.py
```

If successful, create a `crontab` entry with the following contents:
```
0 23 * * * python3 run-daily-task.py
```


