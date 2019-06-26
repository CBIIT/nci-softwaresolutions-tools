# -*- coding: utf-8 -*-

import json
import logging
import ssl
from base64 import b64encode
from pprint import pformat
from urllib import urlencode
from urllib2 import Request, urlopen
from ConfigParser import SafeConfigParser

# The following mappings are used between JIRA/IRIS:
#
# IRIS Field             | JIRA Field               | JIRA Field ID
# -------------------    |--------------------------|-------------------
# protocolId             | Protocol ID              | customfield_10500
# principalInvestigator  | Principal Investigator   | customfield_10501
# (not applicable)       | GDS Answer               | customfield_10502
# branch                 | Primary Branch           | customfield_10510
# status                 | Study Status             | customfield_10605
# zNumber                | Z1A                      | customfield_11700
# (not applicable)       | GSR/Study Sensitivity    | customfield_11701


# Load configuration
config = SafeConfigParser()
config.read('config.ini')

jira_host = config.get('jira', 'host')
jira_username = config.get('jira', 'username')
jira_password = config.get('jira', 'password')

iris_host = config.get('iris', 'host')
iris_username = config.get('iris', 'username')
iris_password = config.get('iris', 'password')

# Configure logging
logging.basicConfig(
    filename=config.get('logging', 'filename'),
    level=getattr(logging, config.get('logging', 'level'))
)


def request(url, method='GET', headers={}, data=None):
    """ Sends a http request to the specified url """
    req = Request(url, headers=headers, data=data)
    req.get_method = lambda: method
    return urlopen(req, context=ssl._create_unverified_context())


def basic_auth_header(username, password):
    """ Generates a basic authorization header from a username/password """
    return {'Authorization': 'Basic ' + b64encode(username + ':' + password)}


def get_issue(issue_key):
    """ Retrieves a single JIRA issue given an issue key (eg: 'CCRGDS-205') """
    url = jira_host + '/rest/api/latest/issue/' + issue_key
    logging.debug(url)
    headers = basic_auth_header(jira_username, jira_password)
    return json.load(request(url, headers=headers))


def get_issue_fields(issue_key):
    """ Retrieves a JIRA issue's field metadata """
    url = jira_host + '/rest/api/latest/issue/' + issue_key + '/editmeta'
    logging.debug(url)
    headers = basic_auth_header(jira_username, jira_password)
    return json.load(request(url, headers=headers))


def get_issue_types(project_keys):
    """ Retrieves JIRA issue types for a comma-separated list of projects """
    url = jira_host + '/rest/api/latest/issue/createmeta?' + urlencode({
        'projectKeys': project_keys,
        'expand': 'projects.issuetypes.fields'
    })
    logging.debug(url)
    headers = basic_auth_header(jira_username, jira_password)
    return json.load(request(url, headers=headers))


def search_issues(params):
    """ Searches for JIRA issues using jql """
    url = jira_host + '/rest/api/latest/search?' + urlencode(params)
    logging.debug(url)
    headers = basic_auth_header(jira_username, jira_password)
    return json.load(request(url, headers=headers))


def update_issue(issue_key, data):
    """ Updates a JIRA issue """
    url = jira_host + '/rest/api/latest/issue/' + issue_key
    logging.debug(url)
    headers = {'Content-Type': 'application/json'}
    headers.update(basic_auth_header(jira_username, jira_password))
    request(url, method='PUT', headers=headers, data=json.dumps(data))


def get_protocol(protocol_id):
    """ Retrieves a single protocol from IRIS given a protocol id """
    url = iris_host + '/api/v1/protocols/' + protocol_id + '.json'
    logging.debug(url)
    headers = basic_auth_header(iris_username, iris_password)
    return json.load(request(url, headers=headers))


def search_protocols(query={}):
    """ Retrieves protocols from IRIS based on search criteria """
    url = iris_host + '/api/v1/protocols?' + urlencode(query)
    logging.debug(url)
    headers = basic_auth_header(iris_username, iris_password)
    return json.load(request(url, headers=headers))

# example: find all issues where the description contains the word 'metastatic'
# results = search_issues({'jql': 'cf[10502] = Yes'})
# logging.info(pformat(results))

if __name__ == '__main__':

    logging.info('Started job')
#    logging.info(pformat(get_issue('CCRGDS-435')))

    jira_fields = {
        'protocol_id': 'customfield_10500',
        'principal_investigator': 'customfield_10501',
        'gds_answer': 'customfield_10502',
        'primary_branch': 'customfield_10510',
        'study_status': 'customfield_10605',
        'Z1A': 'customfield_11700',
        'GSR': 'customfield_11701',
    }

    mapped_fields = {
        jira_fields['protocol_id']: 'protocolId',
        jira_fields['principal_investigator']: 'principalInvestigator',
        jira_fields['primary_branch']: 'branch',
        jira_fields['study_status']: 'status',
        jira_fields['Z1A']: 'zNumber',
    }

    # custom_field_10502 corresponds to the 'GDS Answer' field
    response = search_issues({'jql': 'cf[10502] = Yes', 'maxResults': 1000})

    for issue in response['issues'][20:21]:
        try:
            # attempt to fetch the protocol from the IRIS api
            protocol_id = issue['fields'][jira_fields['protocol_id']]
            protocol = get_protocol(protocol_id)

            # retrieve fields of interest
            updated_fields = {}
            for key, iris_field in mapped_fields.items():
                updated_fields[key] = protocol[iris_field]

            logging.info(issue['key'])
            logging.info(pformat(updated_fields))

            update_issue(issue['key'], {
                'fields': updated_fields
            })

        except:
            logging.error('Failed to sync issue: ' + issue['key'])
            logging.error('Reason: protocol not found: ' + protocol_id)

    logging.debug('Finished job')
