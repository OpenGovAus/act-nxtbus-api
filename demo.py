'''
This is just a little demo script I wrote to show some basics of what you can do with the API.
'''

from api import *
from stop_data import *
from utils import *
from bs4 import BeautifulSoup
import random, secrets, json, sys, hashlib

if(not secrets.API_KEY):
    sys.exit('A valid API key must be provided in secrets.py.')

rndstop = int(random.choice(stop_list())[0])
print(get_stop_data(rndstop))

data = get_incoming_buses(rndstop, secrets.API_KEY)

with open(f'{hashlib.md5(str(get_stop_data(rndstop)).encode("utf-8")).hexdigest()}.xml', 'w') as f:
    f.write(data)

for bus_entry in gen_bus_list(data):
    rndbus = bus(bus_entry)
    print(f'{rndbus.route_title} - From {rndbus.origin_title} to {rndbus.destination_title}.\nDue at {to_epoch(rndbus.due_time)}, expected at {to_epoch(rndbus.expected_time)}')
    for bus_location_entry in gen_bus_list(get_bus_locations(rndbus.route_num, secrets.API_KEY)):
        _busloc = bus_location(bus_location_entry)
        if(_busloc.is_monitored):
            if(_busloc.id == rndbus.id): # Check if GPS entry is same as incoming bus for a stop
                print(_busloc.loc_lat, _busloc.loc_lon)
                print(_busloc.percentage)
    '''
    if rndbus.route_num in range(2, 10):
        print(f'R{rndbus.route_num}') # Correctly display R buses (e.g R4, R2, R10, etc) as "R#", rather than "#"
    '''