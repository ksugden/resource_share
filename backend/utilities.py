import json
from datetime import datetime, timedelta
from calendar import day_name
from typing import Dict, List
from dateutil import parser


def parse_bookings_response(bookings_response: List[Dict[str,str]]) -> List[Dict[str, datetime]]:
    return [{'start': parser.parse(b['start']), 'finish': parser.parse(b['finish'])} for b in bookings_response]


def available_intervals(bookings, start=None, finish=None) -> List[Dict[str, datetime]]:
    '''
    >>> booking_1 = {"start": datetime(2022,7,20,10,0,0), "finish": datetime(2022,7,20,11,0,0)}
    >>> booking_2 = {"start": datetime(2022,7,20,12,0,0), "finish": datetime(2022,7,20,14,0,0)}
    >>> booking_3 = {"start": datetime(2022,7,20,18,0,0), "finish": datetime(2022,7,20,19,0,0)}
    >>> booking_4 = {"start": datetime(2022,7,21,10,0,0), "finish": datetime(2022,7,21,12,0,0)}
    >>> my_bookings = [booking_1, booking_2, booking_3, booking_4]
    >>> available_intervals(my_bookings, datetime(2022,7,20,9,0,0), datetime(2022,7,20,17,0,0))
    [{'start': datetime.datetime(2022, 7, 20, 9, 0), 'finish': datetime.datetime(2022, 7, 20, 10, 0)}, {'start': datetime.datetime(2022, 7, 20, 11, 0), 'finish': datetime.datetime(2022, 7, 20, 12, 0)}, {'start': datetime.datetime(2022, 7, 20, 14, 0), 'finish': datetime.datetime(2022, 7, 20, 17, 0)}]
    >>> available_intervals(my_bookings, datetime(2022,7,20,10,30,0), datetime(2022,7,20,15,0,0))
    [{'start': datetime.datetime(2022, 7, 20, 11, 0), 'finish': datetime.datetime(2022, 7, 20, 12, 0)}, {'start': datetime.datetime(2022, 7, 20, 14, 0), 'finish': datetime.datetime(2022, 7, 20, 15, 0)}]
    >>> available_intervals(my_bookings, datetime(2022,7,20,18,0,0), datetime(2022,7,20,22,0,0))
    [{'start': datetime.datetime(2022, 7, 20, 19, 0), 'finish': datetime.datetime(2022, 7, 20, 22, 0)}]
    '''    
    start = start or datetime.now()
    finish = finish or (start + timedelta(days=1))

    relevant_bookings = [
        booking for booking in bookings
        if booking["finish"] > start
        and booking["start"] < finish
    ]
    
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
    rounded_datetime = datetime(dt.year, dt.month, dt.day, dt.hour)
    if rounded_datetime != dt:
        rounded_datetime = datetime(dt.year, dt.month, dt.day, dt.hour+1)
    
    return rounded_datetime


def round_down_hour(dt) -> datetime:
    return datetime(dt.year, dt.month, dt.day, dt.hour)


def interval_slot_starts(start, finish, hours=1) -> List[datetime]:
    '''
    >>> start = datetime(2022,7,20,9,30,0)
    >>> finish = datetime(2022,7,20,22,10,0)
    >>> start_2 = datetime(2022,7,20,12)
    >>> finish_2 = datetime(2022,7,20,16)
    >>> len(interval_slot_starts(start, finish, 1))
    12
    >>> len(interval_slot_starts(start, finish, 4))
    9
    >>> len(interval_slot_starts(start, finish, 1.5))
    11
    >>> len(interval_slot_starts(start_2, finish_2, 4))
    1
    '''
    first_slot_start = round_up_hour(start)
    last_slot_start = round_down_hour(round_down_hour(finish) - timedelta(hours=hours))

    if first_slot_start == last_slot_start:
        slots = [first_slot_start]
    elif last_slot_start < first_slot_start:
        slots = []
    else:
        number_of_slots = last_slot_start.hour - first_slot_start.hour + 1 #todo need to handle if finish goes over to next day
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
    starts = []

    for interval in available_intervals:
        starts += interval_slot_starts(interval['start'], interval['finish'], hours)

    return starts


def format_date(slot_start) -> str:
    day = day_name[slot_start.weekday()]
    return f'{day} {slot_start.day:02d}-{slot_start.month:02d}'


def format_time(slot_start) -> str:
    return str(slot_start.time())[0:5]


def map_slot_starts(slot_starts) -> Dict[str, List[str]]:
    '''
    >>> slot_starts = [datetime(2022, 7, 20, 12, 0), datetime(2022, 7, 20, 17, 0), datetime(2022, 7, 20, 18, 0)]
    >>> map_slot_starts(slot_starts)
    {'Wednesday 20-07': ['12:00', '17:00', '18:00']}
    '''
    mapped_slot_starts = {}
    for start in slot_starts:
        mapped_slot_starts.setdefault(format_date(start),[]).append(format_time(start))
    
    return mapped_slot_starts


def get_slot_starts(bookings_response) -> Dict[str, List[str]]:
    bookings = parse_bookings_response(bookings_response)
    intervals = available_intervals(bookings)
    starts = all_slot_starts(intervals)
    return map_slot_starts(starts)