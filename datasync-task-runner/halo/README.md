### Overview
`run-task.py` executes a DataSync task with a scriptable set of filters.

### Prerequisites
- DataSync Agent
- python 3.6+
  - boto3

### Usage

The `run-task.py` script executes a DataSync task where the source subfolder changes on a daily basis and is named using the YYYY-MM-DD convention. 

To get started, create a `config.json` file with the following contents:

```json
{
  "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>"
}
```

Execution the task manually to ensure it runs successfully:
```
python3 run-task.py
```

If successful, create a `crontab` entry with the following contents:
```
0 23 * * * python3 /path/to/run-task.py
```


