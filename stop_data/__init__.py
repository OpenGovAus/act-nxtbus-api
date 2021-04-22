import csv, os

if __name__ == '__main__':
    CSV_PATH = f'{os.path.dirname(os.path.dirname(os.path.realpath(__file__)))}/AllStops.csv'
else:
    CSV_PATH = f'{os.path.dirname(os.path.dirname(os.path.realpath(__file__)))}/stop_data/AllStops.csv'

def stop_list():
    row_list = []
    with open(CSV_PATH, 'r') as f:
        csv_reader = csv.reader(f, delimiter='	')
        for row in csv_reader:
            row_list.append(row)
    return row_list

def get_stop_data(stop_num):
    for stop in stop_list():
        if(stop[0] == str(stop_num)):
            return(stop)

def get_stop_name(stop_num):
    return(get_stop_data(stop_num)[1])

def get_stop_coords(stop_num):
    stop_data = get_stop_data(stop_num)
    return([stop_data[2], stop_data[3]])