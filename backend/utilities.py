from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Key, Attr


USERS_TABLE = 'Users' # PK = user_id
RESOURCES_TABLE = 'Resources' # PK = resource_id
BOOKINGS_TABLE = 'Bookings' # PK = resource_id and start


TIMESLOT_HOUR_GRANULARITY = 1
ADVANCE_BOOK_WEEKS_LIMIT = 1


dynamodb = boto3.resource('dynamodb', region_name="eu_west-1")


users_table = dynamodb.Table(USERS_TABLE)
resources_table = dynamodb.Table(RESOURCES_TABLE)
bookings_table = dynamodb.Table(BOOKINGS_TABLE)


def get_upcoming_bookings(user_id, days):
    now = datetime.now()
    period_end = now + datetime.timedelta(days=days)
    response = bookings_table.query(
        FilterExpression = Attr('user_id').eq(user_id) & Attr('start').between(now, period_end)
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


def add_booking(user_id, resource_id, start, finish):
    pass
