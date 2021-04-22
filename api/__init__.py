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
    post_data = f'<Siri version=\'2.0\' xmlns:ns2=\'http://www.ifopt.org.uk/acsb\' xmlns=\'http://www.siri.org.uk/siri\' xmlns:ns4=\'http://datex2.eu/schema/2_0RC1/2_0\' xmlns:ns3=\'http://www.ifopt.org.uk/ifopt\'><ServiceRequest> <RequestTimestamp>{req_time}</RequestTimestamp><RequestorRef>#####</RequestorRef><StopMonitoringRequest version=\'2.0\'><RequestTimestamp>{req_time}</RequestTimestamp><PreviewInterval>PT30M</PreviewInterval><MonitoringRef>{stop_num}</MonitoringRef><MaximumStopVisits>10</MaximumStopVisits><MaximumTextLength>500</MaximumTextLength></StopMonitoringRequest></ServiceRequest></Siri>'
    return(post(post_url, data=post_data).text.strip())

def get_bus_locations(route_num, api_key):
    formatted_route_num = str(route_num).zfill(4)
    req_time = create_epoch()
    post_url = f'{BASE_URL}{api_key}{VEHICLE_DATA}{SERVICE_ENDPOINT}'
    post_data = f'<Siri version=\'2.0\' xmlns:ns2=\'http://www.ifopt.org.uk/acsb\' xmlns=\'http://www.siri.org.uk/siri\' xmlns:ns4=\' http://datex2.eu/schema/2_0RC1/2_0\' xmlns:ns3=\'http://www.ifopt.org.uk/ifopt\'><ServiceRequest> <RequestTimestamp>{req_time}</RequestTimestamp><RequestorRef>{api_key}</RequestorRef><VehicleMonitoringRequest version=\'2.0\'><RequestTimestamp>{req_time}</RequestTimestamp><VehicleMonitoringRef>VM_ACT_{formatted_route_num}</VehicleMonitoringRef></VehicleMonitoringRequest></ServiceRequest></Siri>'
    return(post(post_url, data=post_data).text.strip())

class bus():
    def __init__(self, api_data):
        self.api_data = api_data
        if(api_data.parent.find('MonitoredStopVisit')):
            self.due_time = self.api_data.find('AimedArrivalTime').text
            self.expected_time = self.api_data.find('ExpectedArrivalTime').text
            self.route_num = self.api_data.find('ExternalLineRef').text
            self.origin_title = self.api_data.find('OriginName').text.title()
            self.destination_title = self.api_data.find('DestinationDisplayAtOrigin').text.title()
        else:
            pass