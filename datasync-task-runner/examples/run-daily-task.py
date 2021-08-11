#!/usr/bin/python3

from datetime import date, timedelta
from configparser import ConfigParser
from boto3 import client

"""
Sample config.ini
TaskArn=arn:aws:datasync:<region>:<account>:task/<task-id>
"""
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