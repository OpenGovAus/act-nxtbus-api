from datetime import datetime

def to_epoch(input_time):
    try:
        return(datetime(int(input_time[:4]), int(input_time[5:7]), int(input_time[8:10]), int(input_time[11:13]), int(input_time[14:16]), int(input_time[17:19])))
    except:
        return(input_time)