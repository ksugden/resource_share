from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Key


USERS_TABLE = 'Users'
RESOURCES_TABLE = 'Resources'
BOOKINGS_TABLE = 'Bookings'


TIMESLOT_HOUR_GRANULARITY = 1
ADVANCE_BOOK_WEEKS_LIMIT = 1


dynamodb_client = boto3.client('dynamodb', region_name="eu-west-1")
dynamodb = boto3.resource('dynamodb', region_name="eu_west-1")


users_table = dynamodb.Table(USERS_TABLE)
resources_table = dynamodb.Table(RESOURCES_TABLE)
bookings_table = dynamodb.Table(BOOKINGS_TABLE)


def get_upcoming_bookings(user_id, days):
  now = datetime.now()
  period_end = now + datetime.timedelta(days=days)
  response = bookings_table.query(
    KeyConditionExpression=Key('user_id').eq(user_id) & Key('start').between(now, period_end)
  )
  return response['Items']


def resource_bookings(resource_id, start, finish):
  response = bookings_table.query(
    KeyConditionExpression=Key('resource_id').eq(resource_id) & Key('start').lte(finish) & Key('finish').gte(start)
  )
  return response['Items']


def is_resource_available(resource_id, start, finish):
  number_of_bookings = resource_bookings(resource_id, start, finish).count
  return number_of_bookings == 0


def add_booking(user_id, resource_id, start, finish):
  pass
