from datetime import datetime, timedelta
import boto3
from boto3.dynamodb.conditions import Key, Attr


USERS_TABLE = 'Users' # PK = username
RESOURCES_TABLE = 'Resources' # PK = id
BOOKINGS_TABLE = 'Bookings' # PK = resource_id and start


dynamodb = boto3.resource('dynamodb', region_name="eu-west-1")


users_table = dynamodb.Table(USERS_TABLE)
resources_table = dynamodb.Table(RESOURCES_TABLE)
bookings_table = dynamodb.Table(BOOKINGS_TABLE)


def upcoming_user_bookings(username, days=14):
    now = datetime.now().isoformat(" ","auto")
    period_end = (datetime.now() + timedelta(days=days)).isoformat(" ","auto")
    response = bookings_table.query(
        IndexName = 'username-start-index',
        KeyConditionExpression = Key('username').eq(username) & Key('start').between(now, period_end)
    )
    return response['Items']


def resource_bookings(resource_id, start, finish):
    response = bookings_table.query(
        KeyConditionExpression = Key('resource_id').eq(resource_id) & Key('start').lt(finish),
        FilterExpression = Attr('finish').gt(start)
    )
    return response['Items']


def is_resource_available(resource_id, start, finish):
    number_of_bookings = len(resource_bookings(resource_id, start, finish))
    return number_of_bookings == 0


def add_booking(resource_id, username, start, finish):
    response = bookings_table.put_item(
        Item = {
            'resource_id': resource_id,
            'username': username,
            'start': start,
            'finish': finish
        }
    )


def add_user(username, screen_name):
    response = users_table.put_item(
        Item = {
            'username': username,
            'screen_name': screen_name
        }
    )

  
def list_resources(type):
    response = resources_table.query(
        KeyConditionExpression = Key('type').eq(type)
    )
    return response['Items']


def get_resource(type, id):
    response = resources_table.query(
        KeyConditionExpression = Key('type').eq(type) & Key('id').eq(id)
    )
    return response['Items']