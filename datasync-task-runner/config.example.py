def configure_task():
    """
    Returns a dict which has the following configuration properties:
    - TaskArn [string] (optional)
        - If specified, does not create a new task and instead updates task metadata before execution
        - Modifiable task properties include:
            - CloudWatchLogGroupArn
            - Name
            - Options
            - Schedule
            - Excludes
        - Source/destination location ARNs can not be modified for an existing task
        - Metadata for existing nfs, smb, and object_storage locations can be updated but this may
          not be appropriate in all cases, as previous task execution records will also refer to the 
          updated location metadata. Instead, consider creating new tasks if location metadata must change.
    - CloudWatchLogGroupArn [string]
    - SourceLocation [dict]
    - DestinationLocation [dict]
    - Name [string] (optional)
    - Options [dict] (optional)
    - Excludes [list] (optional)
        - If specified, sync excludes all files specified by the filters
    - Includes [list] (optional)
        - If specified, sync includes only files specified by the filters
    - Schedule [dict] (optional)
    - Tags [list] (optional)
        - Applied to DataSync task, overrides any existing tags

    Locations have the following properties:
    - LocationArn [string] (optional)
        - If LocationArn is specified and Type and Config are not present, uses the location as-is
        - If LocationArn is specified and Type and Config are present, updates the existing location's metadata if Type is nfs, object_storage, or smb
        - If LocationArn is not specified, a new location using the specified Type and Config will be created.
    - Type [string] (required if LocationArn is not specified)
        - If creating a new location (Arn not specified), options are:
            - efs
            - fsx_windows
            - nfs
            - object_storage
            - s3
            - smb
        - If updating an existing location, options are:
            - nfs
            - object_storage
            - smb
    - Config [dict] (required if LocationArn is not specified)
        - If LocationArn does not exist, conforms to the request syntax for the CreateLocation APIs
            - efs: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationEfs.html
            - fsx_windows: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationFsxWindows.html
            - nfs: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationNfs.html
            - object_storage: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationObjectStorage.html
            - s3: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationS3.html
            - smb: https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateLocationSmb.html
        - If LocationArn exists, conforms to the request syntax for the UpdateLocation APIs
            - nfs: https://docs.aws.amazon.com/datasync/latest/userguide/API_UpdateLocationNfs.html
            - object_storage: https://docs.aws.amazon.com/datasync/latest/userguide/API_UpdateLocationObjectStorage.html
            - smb: https://docs.aws.amazon.com/datasync/latest/userguide/API_UpdateLocationSmb.html

    Include/Exclude lists contain FilterRule items (https://docs.aws.amazon.com/datasync/latest/userguide/API_FilterRule.html):
    - FilterType [string]
        - "SIMPLE_PATTERN"
    - Value [string] 
        - A regular expression which specifies patterns to include or exclude

    Options is a dict with the following properties (https://docs.aws.amazon.com/datasync/latest/userguide/API_Options.html):
    - Atime [string]: NONE | BEST_EFFORT
    - BytesPerSecond [number] 
    - Gid [string]: NONE | INT_VALUE | NAME | BOTH
    - LogLevel [string]: OFF | BASIC | TRANSFER
    - Mtime [string]: NONE | PRESERVE
    - OverwriteMode [string]: ALWAYS | NEVER
    - PosixPermissions [string]: NONE | PRESERVE
    - PreserveDeletedFiles [string]: PRESERVE | REMOVE
    - PreserveDevices [string]: NONE | PRESERVE
    - SecurityDescriptorCopyFlags [string]: NONE | OWNER_DACL | OWNER_DACL_SACL
    - TaskQueueing [string]: ENABLED | DISABLED 
    - TransferMode [string]: CHANGED | ALL
    - Uid [string]: NONE | INT_VALUE | NAME | BOTH
    - VerifyMode [string]: POINT_IN_TIME_CONSISTENT | ONLY_FILES_TRANSFERRED | NONE

    Schedule specifies a ScheduleExpression (https://docs.aws.amazon.com/datasync/latest/userguide/API_TaskSchedule.html)
    - ScheduleExpression [string]
        - A cron expression that specifies when to execute the task
        - Note that task executions can not be customized when using the DataSync scheduler. For more flexibility,
          consider running a cron job on the host which executes run-task.py on a regular basis. 

    Tags contains TagListEntry objects (https://docs.aws.amazon.com/datasync/latest/userguide/API_TagListEntry.html)
    - Key [string]
    - Value [string]

    Returns:
        [dict]: A configuration object
    """

    return {
        "TaskArn": "arn:aws:datasync:<region>:<account>:task/<task-id>"
    }

def before_task_configuration():
    """
    An optional callback invoked before task configuration - used for 
    preprocessing files or verifying locations, for example. 
    If False is returned, the task is not created.

    Args:
        task_status ([dict]): DataSync API response for task status (https://docs.aws.amazon.com/datasync/latest/userguide/API_DescribeTask.html#API_DescribeTask_ResponseSyntax)
        task_execution_status ([dict]): DataSync API response for task execution status (https://docs.aws.amazon.com/datasync/latest/userguide/API_DescribeTaskExecution.html#API_DescribeTaskExecution_ResponseSyntax)

    Returns:
        [bool]: If True, proceeds with task creation. If False, cancels task creation.

    """
    return True

def before_task_execution(task_status):
    """
    An optional callback invoked before task execution. Return False to 
    cancel task execution (eg: if only task creation is desired)

    Args:
        task_status ([dict]): DataSync API response for task status (https://docs.aws.amazon.com/datasync/latest/userguide/API_DescribeTask.html#API_DescribeTask_ResponseSyntax)
        task_execution_status ([dict]): DataSync API response for task execution status (https://docs.aws.amazon.com/datasync/latest/userguide/API_DescribeTaskExecution.html#API_DescribeTaskExecution_ResponseSyntax)

    Returns:
        [bool]: If True, proceeds with task execution. If False, cancels task execution.
    """
    return True

def during_task_execution(task_status, task_execution_status):
    """
    An optional callback invoked at at regular intervals during task execution. 
    If False is returned, task execution is canceled.

    Args:
        task_status ([dict]): DataSync API response for task status (https://docs.aws.amazon.com/datasync/latest/userguide/API_DescribeTask.html#API_DescribeTask_ResponseSyntax)
        task_execution_status ([dict]): DataSync API response for task execution status (https://docs.aws.amazon.com/datasync/latest/userguide/API_DescribeTaskExecution.html#API_DescribeTaskExecution_ResponseSyntax)

    Returns:
        [bool]: If True, continues task execution. If False, cancels task execution.
    """

    print(task_status)
    print(task_execution_status)
    return True

def after_task_execution(task_status, task_execution_status):
    """
    A callback function which is invoked after task completion. 

    Runs after task completion, useful for examining execution status,
    sending execution results to a custom logging service, etc.

    Args:
        task_execution_status ([dict]): DataSync API response for task execution status
    """
    print(task_status)
    print(task_execution_status)
