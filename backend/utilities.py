import json
from datetime import datetime, timedelta, timezone
from calendar import day_name
from typing import Dict, List
from dateutil import parser
import config



def parse_bookings_response(bookings_response: List[Dict[str,str]]) -> List[Dict[str, datetime]]:
    '''
    >>> test_json = [
    ... {"username": "benmp", "finish": "2022-07-31 12:00:00.000000", 
    ... "resource_id": "1", "start": "2022-07-31 10:00:00.000000"}, 
    ... {"username": "ksugden", "finish": "2022-08-04", 
    ... "resource_id": "1", "start": "2022-08-03"},
    ... {"username": "ksugden", "finish": "2022-08-07 11:00:00.000000",
    ... "resource_id": "1", "start": "2022-08-07 10:00:00.000000"},
    ... {"username": "benmp", "finish": "2022-08-07 12:00:00.000000",
    ... "resource_id": "1", "start": "2022-08-07 11:00:00.000000"}]
    >>> test_tzjson = [
    ... {"username": "benmp", "finish": "2022-07-31T12:00:00.000Z", 
    ... "resource_id": "1", "start": "2022-07-31T10:00:00.000Z"}]
    >>> parse_bookings_response(test_json)
    [{'start': datetime.datetime(2022, 7, 31, 10, 0), 'finish': datetime.datetime(2022, 7, 31, 12, 0)}, {'start': datetime.datetime(2022, 8, 3, 0, 0), 'finish': datetime.datetime(2022, 8, 4, 0, 0)}, {'start': datetime.datetime(2022, 8, 7, 10, 0), 'finish': datetime.datetime(2022, 8, 7, 11, 0)}, {'start': datetime.datetime(2022, 8, 7, 11, 0), 'finish': datetime.datetime(2022, 8, 7, 12, 0)}]
    >>> parse_bookings_response(test_tzjson)
    [{'start': datetime.datetime(2022, 7, 31, 10, 0, tzinfo=tzutc()), 'finish': datetime.datetime(2022, 7, 31, 12, 0, tzinfo=tzutc())}]
    '''
    return [{'start': parser.parse(b['start']), 'finish': parser.parse(b['finish'])} for b in bookings_response]


def available_intervals(bookings, start=None, finish=None) -> List[Dict[str, datetime]]:
    '''
    >>> booking_1 = {"start": datetime(2022,7,20,10,0,0), "finish": datetime(2022,7,20,11,0,0)}
    >>> booking_2 = {"start": datetime(2022,7,20,12,0,0), "finish": datetime(2022,7,20,14,0,0)}
    >>> booking_3 = {"start": datetime(2022,7,20,18,0,0), "finish": datetime(2022,7,20,19,0,0)}
    >>> booking_4 = {"start": datetime(2022,7,21,10,0,0), "finish": datetime(2022,7,21,12,0,0)}
    >>> my_bookings = [booking_1, booking_2, booking_3, booking_4]
    >>> tzbooking_1 = {"start": datetime(2022,7,20,10,0,0,tzinfo=timezone.utc), "finish": datetime(2022,7,20,11,0,0,tzinfo=timezone.utc)}
    >>> tzbooking_2 = {"start": datetime(2022,7,20,12,0,0, tzinfo=timezone.utc), "finish": datetime(2022,7,20,14,0,0, tzinfo=timezone.utc)}
    >>> tzbooking_3 = {"start": datetime(2022,7,20,18,0,0, tzinfo=timezone.utc), "finish": datetime(2022,7,20,19,0,0, tzinfo=timezone.utc)}
    >>> tzbooking_4 = {"start": datetime(2022,7,21,10,0,0, tzinfo=timezone.utc), "finish": datetime(2022,7,21,12,0,0, tzinfo=timezone.utc)}
    >>> my_tzbookings = [tzbooking_1, tzbooking_2, tzbooking_3, tzbooking_4]
    >>> available_intervals(my_bookings, datetime(2022,7,20,9,0,0), datetime(2022,7,20,17,0,0))
    [{'start': datetime.datetime(2022, 7, 20, 9, 0), 'finish': datetime.datetime(2022, 7, 20, 10, 0)}, {'start': datetime.datetime(2022, 7, 20, 11, 0), 'finish': datetime.datetime(2022, 7, 20, 12, 0)}, {'start': datetime.datetime(2022, 7, 20, 14, 0), 'finish': datetime.datetime(2022, 7, 20, 17, 0)}]
    >>> available_intervals(my_bookings, datetime(2022,7,20,10,30,0), datetime(2022,7,20,15,0,0))
    [{'start': datetime.datetime(2022, 7, 20, 11, 0), 'finish': datetime.datetime(2022, 7, 20, 12, 0)}, {'start': datetime.datetime(2022, 7, 20, 14, 0), 'finish': datetime.datetime(2022, 7, 20, 15, 0)}]
    >>> available_intervals(my_bookings, datetime(2022,7,20,18,0,0), datetime(2022,7,20,22,0,0))
    [{'start': datetime.datetime(2022, 7, 20, 19, 0), 'finish': datetime.datetime(2022, 7, 20, 22, 0)}]
    >>> available_intervals(my_tzbookings, datetime(2022,7,20,18,0,0, tzinfo=timezone.utc), datetime(2022,7,20,22,0,0, tzinfo=timezone.utc))
    [{'start': datetime.datetime(2022, 7, 20, 19, 0, tzinfo=datetime.timezone.utc), 'finish': datetime.datetime(2022, 7, 20, 22, 0, tzinfo=datetime.timezone.utc)}]
    '''    
    start = start or datetime.now(timezone.utc)
    finish = finish or (start + timedelta(days=config.ADVANCE_BOOK_DAYS_LIMIT))

    relevant_bookings = [
        booking for booking in bookings
        if booking["finish"] > start
        and booking["start"] < finish
    ]

    if len(relevant_bookings)==0:
        return
    
    available_intervals = []

    if start < relevant_bookings[0]['start']:
        available_intervals = [{'start': start, 'finish': relevant_bookings[0]['start']}]

    for index, booking in enumerate(relevant_bookings):
        try:
            available_intervals.append({'start': booking['finish'], 'finish': relevant_bookings[index+1]['start']})
        except IndexError:
            pass

    if finish > relevant_bookings[-1]['finish']:
      available_intervals.append({'start': relevant_bookings[-1]['finish'], 'finish': finish})

    
    return available_intervals


def round_up_hour(dt) -> datetime:
    '''
    >>> dt = datetime(2022,7, 20,23,40)
    >>> round_up_hour(dt)
    datetime.datetime(2022, 7, 21, 0, 0)
    '''
    rounded_datetime = datetime(dt.year, dt.month, dt.day, dt.hour, tzinfo=dt.tzinfo)
    if rounded_datetime != dt:
        dt = dt + timedelta(hours=1)
        rounded_datetime = datetime(dt.year, dt.month, dt.day, dt.hour, tzinfo=dt.tzinfo)
    
    return rounded_datetime


def round_down_hour(dt) -> datetime:
    return datetime(dt.year, dt.month, dt.day, dt.hour, tzinfo=dt.tzinfo)


def interval_slot_starts(start, finish, hours=1) -> List[datetime]:
    '''
    >>> start = datetime(2022,7,20,9,30,0)
    >>> finish = datetime(2022,7,20,22,10,0)
    >>> start_2 = datetime(2022,7,20,12)
    >>> finish_2 = datetime(2022,7,20,16)
    >>> start_3 = datetime(2022,7,20,20)
    >>> finish_3 = datetime(2022,7,21,22)
    >>> len(interval_slot_starts(start, finish, 1))
    12
    >>> len(interval_slot_starts(start, finish, 4))
    9
    >>> len(interval_slot_starts(start, finish, 1.5))
    11
    >>> len(interval_slot_starts(start_2, finish_2, 4))
    1
    >>> len(interval_slot_starts(start_3, finish_3, 2))
    25
    '''
    first_slot_start = round_up_hour(start)
    last_slot_start = round_down_hour(round_down_hour(finish) - timedelta(hours=hours))

    if first_slot_start == last_slot_start:
        slots = [first_slot_start]
    elif last_slot_start < first_slot_start:
        slots = []
    else:
        delta = last_slot_start - first_slot_start + timedelta(hours=1)
        number_of_slots = int(delta / timedelta(hours=1))
        slots = [first_slot_start + timedelta(hours=x) for x in range(0,number_of_slots)]
    
    return slots


def all_slot_starts(available_intervals, hours=1) -> List[datetime]:
    '''
    >>> available_interval_1 = {"start": datetime(2022,7,20,9,0,0), "finish": datetime(2022,7,20,10,0,0)}
    >>> available_interval_2 = {"start": datetime(2022,7,20,12,0,0), "finish": datetime(2022,7,20,16,0,0)}
    >>> available_interval_3 = {"start": datetime(2022,7,20,17,0,0), "finish": datetime(2022,7,20,22,0,0)}
    >>> my_intervals = [available_interval_1, available_interval_2, available_interval_3]
    >>> all_slot_starts(my_intervals, 4)
    [datetime.datetime(2022, 7, 20, 12, 0), datetime.datetime(2022, 7, 20, 17, 0), datetime.datetime(2022, 7, 20, 18, 0)]
    '''
    if not available_intervals:
        return

    starts = []

    for interval in available_intervals:
        starts += interval_slot_starts(interval['start'], interval['finish'], hours)

    return starts


def format_date(slot_start) -> str:
    return slot_start.date().isoformat()


def format_time(slot_start) -> str:
    return str(slot_start.time())[0:5]


def map_slot_starts(slot_starts) -> Dict[str, List[str]]:
    '''
    >>> slot_starts = [datetime(2022, 7, 20, 12, 0), datetime(2022, 7, 20, 17, 0), datetime(2022, 7, 20, 18, 0)]
    >>> map_slot_starts(slot_starts)
    {'2022-07-20': ['12:00', '17:00', '18:00']}
    '''
    if not slot_starts:
        return
    mapped_slot_starts = {}
    for start in slot_starts:
        mapped_slot_starts.setdefault(format_date(start),[]).append(format_time(start))
    
    return mapped_slot_starts


def get_slot_starts(bookings_response, duration, start, finish) -> Dict[str, List[str]]:
    '''
    >>> test_json = [{"username": "benmp", "finish": "2022-07-31 12:00:00.000000", 
    ... "resource_id": "1", "start": "2022-07-31 10:00:00.000000"}, 
    ... {"username": "ksugden", "finish": "2022-08-04 18:00", 
    ... "resource_id": "1", "start": "2022-08-04 11:00"},
    ... {"username": "ksugden", "finish": "2022-08-07 11:00:00.000000",
    ... "resource_id": "1", "start": "2022-08-07 10:00:00.000000"},
    ... {"username": "benmp", "finish": "2022-08-07 12:00:00.000000",
    ... "resource_id": "1", "start": "2022-08-07 11:00:00.000000"}]
    >>> get_slot_starts(test_json, 2, datetime(2022,7,31,8), datetime(2022,8,1))
    {'2022-07-31': ['08:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']}
    >>> get_slot_starts(test_json, 1, datetime(2022,7,11,8), datetime(2022,7,12))
    >>> get_slot_starts(test_json, 6, datetime(2022,7,30,8), datetime(2022,8,1,10))
    {'2022-07-30': ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'], '2022-07-31': ['00:00', '01:00', '02:00', '03:00', '04:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'], '2022-08-01': ['00:00', '01:00', '02:00', '03:00', '04:00']}
    '''
    bookings = parse_bookings_response(bookings_response)
    intervals = available_intervals(bookings, start, finish)
    starts = all_slot_starts(intervals,duration)
    return map_slot_starts(starts)