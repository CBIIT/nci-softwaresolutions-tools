# -*- coding: utf-8 -*-

import json
import logging
import re
import ssl
import sys
import traceback
from argparse import ArgumentParser
from base64 import b64encode
from pprint import pformat
from urllib import urlencode
from urllib2 import Request, urlopen
from ConfigParser import SafeConfigParser
from HTMLParser import HTMLParser

# The following mappings are used between JIRA/IRIS:
#
# IRIS Field             | JIRA Field               | JIRA Field ID (dev)  | JIRA Field ID
# -------------------    |--------------------------|----------------------|-------------------
# protocolId             | Protocol ID              | customfield_10500    | customfield_10221
# principalInvestigator  | Principal Investigator   | customfield_10501    | customfield_10220
# (not applicable)       | GDS answer               | customfield_10502    | customfield_10208
# branch                 | Primary Branch           | customfield_10510    | customfield_10214
# status                 | Study Status             | customfield_10605    | customfield_10216
# zNumber                | Z1A                      | customfield_11700    | customfield_11000
# (not applicable)       | GSR                      | customfield_11701    | customfield_11001


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


def get_issue_types(project_keys):
    """ Retrieves JIRA issue types for a comma-separated list of projects """
    url = jira_host + '/rest/api/latest/issue/createmeta?' + urlencode({
        'projectKeys': project_keys,
        'expand': 'projects.issuetypes.fields'
    })
    logging.debug(url)
    headers = basic_auth_header(jira_username, jira_password)
    return json.load(request(url, headers=headers))


def get_fields_from_issue(issue_key):
    """ Retrieves a JIRA issue's field metadata """
    url = jira_host + '/rest/api/latest/issue/' + issue_key + '/editmeta'
    logging.debug(url)
    headers = basic_auth_header(jira_username, jira_password)
    return json.load(request(url, headers=headers))


def get_fields_from_project(project_key):
    """ Retrieves JIRA fields for a project's first issue type """
    issue_types = get_issue_types(project_key)['projects'][0]['issuetypes']
    return issue_types[0]['fields']


def map_fields_by_name(jira_fields):
    """ Maps a dict of jira_fields by their names, instead of ids """
    field_map = {}
    for id, field in jira_fields.items():
        name = field['name']
        field.update(id=id)
        field_map[name] = field
    return field_map


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
    try:
        url = iris_host + '/api/v1/protocols/' + protocol_id + '.json'
        logging.debug(url)
        headers = basic_auth_header(iris_username, iris_password)
        return json.load(request(url, headers=headers))
    except:
        raise(Exception('Protocol "{}" was not found in IRIS'.format(protocol_id)))


def search_protocols(query={}):
    """ Retrieves protocols from IRIS based on search criteria """
    url = iris_host + '/api/v1/protocols?' + urlencode(query)
    logging.debug(url)
    headers = basic_auth_header(iris_username, iris_password)
    return json.load(request(url, headers=headers))


def parse_int(string):
    return int(re.sub(r'[^\d]', '', string))


def has_required_fields(names):
    has_fields = True
    required_fields = [
        'GDS answer',
        'Protocol ID',
        'Principal Investigator',
        'Primary Branch',
        'Study Status',
        'Z1A',
    ]

    for field in required_fields:
        if field not in names:
            logging.error('Missing ' + field)
            has_fields = False

    return has_fields


def parse_args():
    parser = ArgumentParser(
        prog='sync.py',
        description='A script to import IRIS data into Jira tickets for the CCRGDS project')

    parser.add_argument(
        '-d', '--dry-run',
        action='store_true',
        default=False,
        dest='dry_run',
        help='only show issues which would be updated by this script, instead of actually updating them')

    parser.add_argument(
        '-f', '--force',
        action='store_true',
        default=False,
        dest='force',
        help='run this script without explicitly typing in YES at the prompt')

    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()

    if not args.force:
        answer = raw_input('This script will import IRIS data into JIRA tickets for the CCRGDS project. Please enter YES to proceed: ')
        if not answer == 'YES':
            sys.exit(0)

    logging.info('Started job')

    # retrieve field names and schemas
    logging.info('Retrieving field metadata')
    project_fields = get_fields_from_project('CCRGDS')
    fields = map_fields_by_name(project_fields)
    # logging.debug(json.dumps(fields))

    # exit if required fields were not found
    if not has_required_fields(fields.keys()):
        logging.error('Required fields not found')
        sys.exit(1)

    # find all issues where the 'GDS Answer' field is 'Yes'
    logging.info('Searching for issues where "GDS answer" = "Yes"')
    gds_answer_id = parse_int(fields['GDS answer']['id'])
    response = search_issues({
        'jql': 'cf[{}]=Yes'.format(gds_answer_id),
        'maxResults': 1000
    })

    logging.info('Found %d issue(s)', response['total'])

    h = HTMLParser()

    for issue in response['issues']:
        try:
            # shortcut for getting a jira field by its key
            jira_field = lambda key: issue['fields'][fields[key]['id']]

            logging.info('----------------------------------------------------------------------')
            logging.info('[%s] Issue URL: %s/browse/%s', issue['key'], jira_host, issue['key'])
            protocol_id = jira_field('Protocol ID')
            logging.info('[%s] Syncing issue with protocol "%s"', issue['key'], protocol_id)

            # check if protocol exists in iris (throws exception if not found)
            logging.info('[%s] Checking if IRIS contains protocol "%s"', issue['key'], protocol_id)
            protocol = get_protocol(protocol_id)
            logging.info('[%s] Success: IRIS contains protocol "%s"', issue['key'], protocol_id)

            # retrieve values for fields we are syncing
            jira_data = {
                'principal_investigator': jira_field('Principal Investigator'),
                'primary_branch': jira_field('Primary Branch')['value'],
                'study_status': jira_field('Study Status')['value'],
                'z': jira_field('Z1A'),
            }


            unescape = lambda x: h.unescape(x) if x else None
            iris_data = {
                'principal_investigator': unescape(protocol['principalInvestigator']),
                'primary_branch': unescape(protocol['branch']),
                'study_status': unescape(protocol['status']),
                'z': unescape(protocol['zNumber']),
            }

            logging.info('[%s] JIRA data: \n%s', issue['key'], pformat(jira_data))
            logging.info('[%s] IRIS data: \n%s', issue['key'], pformat(iris_data))

            # skip updating if records match
            if jira_data == iris_data:
                logging.info('[%s] JIRA issue is already up to date', issue['key'])
                continue

            # otherwise, update the JIRA issue with data from IRIS
            logging.info('[%s] JIRA data will be updated', issue['key'])
            updated_fields = {
                fields['Principal Investigator']['id']: iris_data['principal_investigator'],
                fields['Primary Branch']['id']: {'value': iris_data['primary_branch']},
                fields['Study Status']['id']: {'value': iris_data['study_status']},
                fields['Z1A']['id']: iris_data['z'],
            }

            if args.dry_run:
                logging.info('[%s] Dry run: skipping update', issue['key'])
                continue

            logging.info('[%s] Updating JIRA: \n%s', issue['key'], pformat(updated_fields))
            update_issue(issue['key'], {'fields': updated_fields})
            logging.info('[%s] Success: JIRA issue has been updated', issue['key'])

        except Exception as e:
            logging.error('[%s] Failed: %s', issue['key'], e)
            logging.debug('[%s] Stack: %s', issue['key'], traceback.format_exc(1))

    logging.debug('Finished job')
