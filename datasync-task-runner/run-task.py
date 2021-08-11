#!/usr/bin/python3

import importlib.util
import os.path
import logging
import time
import boto3
from pprint import pformat
from botocore.exceptions import InvalidConfigError
from botocore.utils import InvalidArnException

sns = boto3.resource("sns")
datasync_client = boto3.client("datasync")

logging.basicConfig(filename="run-task.log", encoding="utf-8", level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler())


def load_module(module_name, filepath):
    """
    Loads a python module from a given filepath

    Args:
        module_name (string): The name of the module
        filepath (string): The path to the file containing the module

    Returns:
        [ModuleType]: The loaded module
    """
    spec = importlib.util.spec_from_file_location(module_name, filepath)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def remove_none(dictionary):
    return {k: v for k, v in dictionary.items() if v is not None}


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
    type = options.get("Type")
    config = options.get("Config", {})

    if location_arn is None:
        raise InvalidConfigError("Please specify a location ARN")

    config.update(LocationArn=location_arn)

    if type == "nfs":
        datasync_client.update_location_nfs(**config)

    elif type == "object_storage":
        datasync_client.update_location_object_storage(**config)

    elif config["type"] == "smb":
        datasync_client.update_location_smb(**config)

    else:
        raise InvalidConfigError("Please specify a valid location type")

    return location_arn


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

    type = options.get("Type")
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

    elif config["type"] == "smb":
        return datasync_client.create_location_smb(**config)["LocationArn"]

    else:
        raise InvalidConfigError("Please specify a valid location type")


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


def run_task(config_filepath, task_check_interval=5):
    # check if config file exists
    if not os.path.isfile(config_filepath):
        raise FileNotFoundError(config_filepath)

    # load configuration
    config_module = load_module("config", config_filepath)
    task_config = config_module.configure_task()
    logging.info("loaded configuration")

    # invoke before_task_configuration
    if hasattr(config_module, "before_task_configuration"):
        logging.info(f"invoke before_task_configuration")
        if not config_module.before_task_configuration():
            logging.info(f"cancelled task configuration, aborting job")
            return False

    if task_config.get("TaskArn"):
        task_arn = update_task(task_config)
    else:
        task_arn = create_task(task_config)

    logging.info(f"[{task_arn}] waiting for task to become ready")

    # wait until task has been created
    task_status = {}
    while task_status.get("Status") not in ["AVAILABLE", "UNAVAILABLE", "QUEUED"]:
        task_status = datasync_client.describe_task(TaskArn=task_arn)
        time.sleep(task_check_interval)

    if task_status.get("Status") == "UNAVAILABLE":
        raise InvalidArnException(f"[{task_arn}] task is unavailable ")

    # invoke before_task_execution
    if hasattr(config_module, "before_task_execution"):
        logging.info(f"[{task_arn}] invoke before_task_execution")
        if not config_module.before_task_execution():
            logging.info(f"[{task_arn}] cancelled task execution, aborting job")
            return False

    logging.info(f"[{task_arn}] starting task")

    # start/enqueue task
    task_execution_config = remove_none({"TaskArn": task_arn, "Includes": task_config.get("Includes")})

    task_execution_arn = datasync_client.start_task_execution(
        **task_execution_config
    ).get("TaskExecutionArn", None)

    task_execution_status = {}

    # check task status
    start = time.time()
    while task_execution_status.get("Status") not in ["SUCCESS", "ERROR"]:
        duration = time.time() - start
        task_execution_status = datasync_client.describe_task_execution(
            TaskExecutionArn=task_execution_arn
        )

        logging.info(
            "[{}] [{}s]: {}".format(
                task_execution_arn,
                round(duration), 
                task_execution_status["Status"]
            )
        )

        # invoke during_task_execution
        if hasattr(config_module, "during_task_execution"):
            logging.info(f"[{task_execution_arn}] invoke during_task_execution")
            if not config_module.during_task_execution(task_status, task_execution_status):
                logging.info(f"[{task_execution_arn}] cancelled task execution, aborting job")
                return False

        time.sleep(task_check_interval)

    # invoke after_task_execution
    if hasattr(config_module, "after_task_execution"):
        logging.info(f"[{task_execution_arn}] invoke after_task_execution")
        config_module.after_task_execution(task_status, task_execution_status)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Execute a DataSync task with the given configuration"
    )
    parser.add_argument(
        "-c",
        "--config-file",
        required=True,
        help="A python configuration file for the DataSync task",
    )

    args = parser.parse_args()
    run_task(args.config_file)
