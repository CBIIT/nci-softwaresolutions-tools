#!/usr/bin/python3

import json
from datetime import date, timedelta
from boto3 import client

def run_task(config):
    # assume folder name is YYYY-MM-DD
    yesterday = date.today() - timedelta(days=1)
    folder = yesterday.strftime("%Y-%m-%d")

    # execute task and return ARN
    return client("datasync").start_task_execution(
      TaskArn=config.get("TaskArn"),
      Includes=[{"FilterType": "SIMPLE_PATTERN", "Value": folder}]
    )

if __name__ == "__main__":
    # load configuration file
    with open("config.json") as cf:
      config = json.load(cf)

    result = run_task(config)
    print(result)