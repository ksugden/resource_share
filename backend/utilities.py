import json
from datetime import datetime, timedelta
from xmlrpc.client import DateTime


def available_intervals(bookings, start=None, finish=None):
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


def round_up_hour(dt):
    rounded_datetime = datetime(dt.year, dt.month, dt.day, dt.hour)
    if rounded_datetime != dt:
        rounded_datetime = datetime(dt.year, dt.month, dt.day, dt.hour+1)
    
    return rounded_datetime


def round_down_hour(dt):
    return datetime(dt.year, dt.month, dt.day, dt.hour)


def interval_slots(start, finish, hours=1):
    '''
    >>> start = datetime(2022,7,20,9,30,0)
    >>> finish = datetime(2022,7,20,22,10,0)
    >>> start_2 = datetime(2022,7,20,12)
    >>> finish_2 = datetime(2022,7,20,16)
    >>> len(interval_slots(start, finish, 1))
    12
    >>> len(interval_slots(start, finish, 4))
    9
    >>> len(interval_slots(start, finish, 1.5))
    11
    >>> len(interval_slots(start_2, finish_2, 4))
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


def available_slots(available_intervals, hours=1):
    '''
    >>> available_interval_1 = {"start": datetime(2022,7,20,9,0,0), "finish": datetime(2022,7,20,10,0,0)}
    >>> available_interval_2 = {"start": datetime(2022,7,20,12,0,0), "finish": datetime(2022,7,20,16,0,0)}
    >>> available_interval_3 = {"start": datetime(2022,7,20,17,0,0), "finish": datetime(2022,7,20,22,0,0)}
    >>> my_intervals = [available_interval_1, available_interval_2, available_interval_3]
    >>> available_slots(my_intervals, 4)
    [datetime.datetime(2022, 7, 20, 12, 0), datetime.datetime(2022, 7, 20, 17, 0), datetime.datetime(2022, 7, 20, 18, 0)]
    '''
    available_slots = []

    for interval in available_intervals:
        available_slots += interval_slots(interval['start'], interval['finish'], hours)

    return available_slots


def map_slots(slots):
    pass
    '''
    >>> slots = [datetime.datetime(2022, 7, 20, 12, 0), datetime.datetime(2022, 7, 20, 17, 0), datetime.datetime(2022, 7, 20, 18, 0)]
    >>> map_slots(slots)
    {'20-07-2022':['12:00','17:00','18:00']}
    '''
    mapped_slots = {}
    for slot in slots:
        mapped_slots[f'{slot.day}-{slot.month}-{slot.year}'].append(f'{slot.hour}:{slot.minute}')
    
    return mapped_slots