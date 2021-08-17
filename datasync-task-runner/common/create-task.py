#!/usr/bin/python3

import logging
import boto3
import json
from botocore.exceptions import InvalidConfigError

datasync_client = boto3.client("datasync")
logs_client = boto3.client("logs")


def create_location(options):
    """
    Creates a DataSync location

    Args:
        options (dict): [description]
        - Type [string]
            - efs
            - fsx_windows
            - nfs
            - object_storage
            - s3
            - smb
        - Config [dict]
            - Conforms to the request syntax for the CreateLocation APIs
            - efs: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationEfs.html
            - fsx_windows: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationFsxWindows.html
            - nfs: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationNfs.html
            - object_storage: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationObjectStorage.html
            - s3: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationS3.html
            - smb: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationSmb.html

    Raises:
        InvalidConfigError: If an invalid Type or Config is specified

    Returns:
        [string]: The new location's ARN
    """

    type = options.get("Type", "").lower()
    config = options.get("Config", {})

    if type == "efs":
        return datasync_client.create_location_efs(**config)["LocationArn"]

    elif type == "fsx_windows":
        return datasync_client.create_location_fsx_windows(**config)["LocationArn"]

    elif type == "nfs":
        return datasync_client.create_location_nfs(**config)["LocationArn"]

    elif type == "object_storage":
        return datasync_client.create_location_object_storage(**config)["LocationArn"]

    elif type == "s3":
        return datasync_client.create_location_s3(**config)["LocationArn"]

    elif "type" == "smb":
        return datasync_client.create_location_smb(**config)["LocationArn"]

    else:
        raise InvalidConfigError("Please specify a valid location type")


def update_location(options: dict):
    """
    Updates a DataSync location's metadata

    Args:
        options (dict): A dictionary containing LocationArn, Type, and Config properties
        - LocationArn [string]
        - Type [string]
            - nfs
            - object_storage
            - smb
        - Config [dict]
            - Conforms to the request syntax for the UpdateLocation APIs
            - nfs: https://docs.aws.amazon.com/datasync/latest/userguide/API_UpdateLocationNfs.html
            - object_storage: https://docs.aws.amazon.com/datasync/latest/userguide/API_UpdateLocationObjectStorage.html
            - smb: https://docs.aws.amazon.com/datasync/latest/userguide/API_UpdateLocationSmb.html

    Raises:
        InvalidConfigError: If LocationArn is not specified, or an invalid Type is specified

    Returns:
        [string]: The updated location's ARN
    """

    location_arn = options.get("LocationArn")
    type = options.get("Type", "").lower()
    config = options.get("Config", {})

    if location_arn is None:
        raise InvalidConfigError("Please specify a location ARN")

    config.update(LocationArn=location_arn)

    if type == "nfs":
        datasync_client.update_location_nfs(**config)

    elif type == "object_storage":
        datasync_client.update_location_object_storage(**config)

    elif type == "smb":
        datasync_client.update_location_smb(**config)

    else:
        raise InvalidConfigError("Please specify a valid location type")

    return location_arn


def create_task(config: dict):
    task_config = {
        key: config[key]
        for key in config.keys()
        & {
            "CloudWatchLogGroupArn",
            "Name",
            "Options",
            "Excludes",
            "Schedule",
            "Tags",
        }
    }

    # if a location arn is provided, update the location
    # otherwise, create the location
    get_location = (
        lambda config: update_location(config)
        if config.get("LocationArn")
        else create_location(config)
    )

    task_config.update(
        SourceLocationArn=get_location(config["SourceLocation"]),
        DestinationLocationArn=get_location(config["DestinationLocation"]),
    )

    return datasync_client.create_task(**task_config).get("TaskArn")


def update_task(config: dict):
    task_config = {
        key: config[key]
        for key in config.keys()
        & {
            "TaskArn",
            "CloudWatchLogGroupArn",
            "Name",
            "Options",
            "Excludes",
            "Schedule",
        }
    }

    for location in [config.get("SourceLocation"), config.get("DestinationLocation")]:
        if location is not None:
            update_location(location)

    datasync_client.update_task(**task_config)
    return task_config.get("TaskArn")


def get_cloudwatch_log_group(name: str):
    response = logs_client.describe_log_groups(logGroupNamePrefix=name)

    for item in response['logGroups']:
        if item['logGroupName'] == name:
            return item
    
    return None


def create_cloudwatch_log_group(name: str):
    log_group = get_cloudwatch_log_group(name)

    if log_group:
      return log_group
    
    else:
        logs_client.create_log_group(logGroupName=name)
        return get_cloudwatch_log_group(name)


def main(task_config):
    # ensure log group exists
    if "CloudWatchLogGroup" in task_config:
        cloudwatch_log_group = create_cloudwatch_log_group(task_config.get("CloudWatchLogGroup"))
        task_config.update("CloudWatchLogGroupArn", cloudwatch_log_group["arn"])

    if "CloudWatchLogGroupArn" not in task_config:
        raise InvalidConfigError("Please specify a CloudWatchLogGroup or CloudWatchLogGroupArn")

    if task_config.get("TaskArn"):
        task_arn = update_task(task_config)
        logging.info(f"[created] {task_arn}")
    else:
        task_arn = create_task(task_config)
        logging.info(f"[updated] {task_arn}")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Create or update a DataSync task with the given configuration"
    )
    parser.add_argument(
        "-c",
        "--config-file",
        required=True,
        help="A json configuration file for the DataSync task",
    )

    args = parser.parse_args()

    with open(args.config_file) as cf:
        task_config = json.load(cf)
        main(task_config)
