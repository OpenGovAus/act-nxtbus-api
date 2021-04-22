import sys
from datetime import datetime
from requests import post
from bs4 import BeautifulSoup

BASE_URL = 'http://siri.nxtbus.act.gov.au:11000/'
STOP_DATA = '/sm/'
VEHICLE_DATA = '/vm/'
SERVICE_ENDPOINT = 'service.xml'

def create_epoch():
    return(str(datetime.now()).replace(' ', 'T')[:-6] + '000+10:00')

def get_incoming_buses(stop_num, api_key):
    req_time = create_epoch()
    post_url = f'{BASE_URL}{api_key}{STOP_DATA}{SERVICE_ENDPOINT}'
    post_data = f'<Siri version=\'2.0\' xmlns:ns2=\'http://www.ifopt.org.uk/acsb\' xmlns=\'http://www.siri.org.uk/siri\' xmlns:ns4=\'http://datex2.eu/schema/2_0RC1/2_0\' xmlns:ns3=\'http://www.ifopt.org.uk/ifopt\'><ServiceRequest> <RequestTimestamp>{req_time}</RequestTimestamp><RequestorRef>#####</RequestorRef><StopMonitoringRequest version=\'2.0\'><RequestTimestamp>{req_time}</RequestTimestamp><PreviewInterval>PT30M</PreviewInterval><MonitoringRef>{stop_num}</MonitoringRef><MaximumStopVisits>100</MaximumStopVisits><MaximumTextLength>1000</MaximumTextLength></StopMonitoringRequest></ServiceRequest></Siri>'
    return(post(post_url, data=post_data).text.strip())

def get_bus_locations(route_num, api_key):
    formatted_route_num = str(route_num).zfill(4)
    req_time = create_epoch()
    post_url = f'{BASE_URL}{api_key}{VEHICLE_DATA}{SERVICE_ENDPOINT}'
    post_data = f'<Siri version=\'2.0\' xmlns:ns2=\'http://www.ifopt.org.uk/acsb\' xmlns=\'http://www.siri.org.uk/siri\' xmlns:ns4=\' http://datex2.eu/schema/2_0RC1/2_0\' xmlns:ns3=\'http://www.ifopt.org.uk/ifopt\'><ServiceRequest> <RequestTimestamp>{req_time}</RequestTimestamp><RequestorRef>{api_key}</RequestorRef><VehicleMonitoringRequest version=\'2.0\'><RequestTimestamp>{req_time}</RequestTimestamp><VehicleMonitoringRef>VM_ACT_{formatted_route_num}</VehicleMonitoringRef></VehicleMonitoringRequest></ServiceRequest></Siri>'
    return(post(post_url, data=post_data).text.strip())

def gen_bus_list(api_data):
    try:
        return BeautifulSoup(api_data, 'xml').find('StopMonitoringDelivery').find_all('MonitoredStopVisit')
    except:
        try:
            return BeautifulSoup(api_data, 'xml').find('VehicleMonitoringDelivery').find_all('VehicleActivity')
        except:
            sys.exit('No incoming/outgoing bus data found...') 

class bus():
    def __init__(self, api_data):
        self.due_time = api_data.find('AimedArrivalTime').text
        self.route_num = int(api_data.find('ExternalLineRef').text)
        self.origin_title = api_data.find('OriginName').text.title()
        self.destination_title = api_data.find('DestinationDisplayAtOrigin').text.title()
        if(api_data.find('VehicleAtStop').text == 'true'):
            self.is_at_stop = True
        else:
            self.is_at_stop = False

        if(self.route_num in range(2, 10)):
            self.route_title = f'R{self.route_num}'
        else:
            self.route_title = str(self.route_num)

        if(api_data.find('Monitored').text == 'true'):
            self.is_monitored = True
        else:
            self.is_monitored = False
        
        if(self.is_monitored):
            self.expected_time = api_data.find('ExpectedArrivalTime').text
            self.id = api_data.find('VehicleRef').text
        else:
            self.expected_time = self.due_time

class bus_location():
    def __init__(self, api_data):
        self.is_monitored = True if(api_data.find('Monitored').text == 'true') else False
        if(self.is_monitored):
            self.id = api_data.find('VehicleRef').text
            self.loc_lat = api_data.find("Latitude").text
            self.loc_lon = api_data.find("Longitude").text
            self.percentage = api_data.find('Percentage').text