'''
This is just a little demo script I wrote to show some basics of what you can do with the API.
'''

from api import *
from stop_data import *
from utils import *
from bs4 import BeautifulSoup
import random, secrets, json, sys

if(not secrets.API_KEY):
    sys.exit('A valid API key must be provided in secrets.py.')

rndstop = int(random.choice(stop_list())[0])
init_data = BeautifulSoup(get_incoming_buses(rndstop, secrets.API_KEY), 'xml').find('StopMonitoringDelivery')

print(get_stop_data(rndstop))

try:
    data = init_data.find_all('MonitoredStopVisit')
except:
    sys.exit('No bus incoming/outgoing bus data found.')

for bus_entry in data:
    rndbus = bus(bus_entry)
    print(f'{rndbus.route_num} - From {rndbus.origin_title} to {rndbus.destination_title}.\nDue at {to_epoch(rndbus.due_time)}, expected at {to_epoch(rndbus.expected_time)}')