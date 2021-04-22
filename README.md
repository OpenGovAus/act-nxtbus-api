# act-nxtbus-api

Python wrapper for Transport Canberra's NXTBUS API.

Info [here](http://web.archive.org/web/20200407080209if_/https://www.transport.act.gov.au/__data/assets/pdf_file/0009/1353807/ACT-Government-NXTBus-API-Reference-Final.pdf), and [here](https://www.transport.act.gov.au/contact-us/information-for-developers).

## Setup

### Installation

Clone repository:
```sh
git clone https://github.com/OpenGovAus/act-nxtbus-api.git
```

Enter cloned repository:
```sh
cd act-nxtbus-api
```

Install `poetry`:

```sh
pip3 install poetry
```

Update/install Python dependencies:
```
poetry update
```

### API Key

You used to be able to apply for a registration form [here](https://www.transport.act.gov.au/contact-us/information-for-developers/nxtbus-data-feed-registration-form), but the link has since been revoked. This doc will be updated in the future if an API key registration form is reuploaded.

If you do have an API key, put it in `secrets.py` like this:

```py
API_KEY = 'APIKEY'
```

The wrapper will do the rest of the work for you.

## Usage

To get a brief overview at the functions of the wrapper, run `demo.py`:

```sh
poetry run python3 demo.py
```

### Bus stop data

To get info about buses travelling past a certain bus stop, use this method:

```py
import api, secrets

print(api.get_incoming_buses(STOPNUM, secrets.API_KEY))
```

Where `STOPNUM` is a bus stop number. They can be found in `stop_data/AllStops.csv`, or [here](https://www.transport.act.gov.au/__data/assets/file/0006/1249692/AllStops.csv).

GPS data for buses on a certain route can also be obtained like this:

```py
print(api.get_bus_locations(ROUTENUM, secrets.API_KEY))
```