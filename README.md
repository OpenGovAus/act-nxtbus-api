# act-nxtbus-api

[npm package](https://www.npmjs.com/package/nxtbus)

TypeScript wrapper for Transport Canberra's NXTBUS API.

This package allows translation to a more modern JSON format compared to the XML garbage which NXTBUS spits out.

Info [here](http://web.archive.org/web/20200407080209if_/https://www.transport.act.gov.au/__data/assets/pdf_file/0009/1353807/ACT-Government-NXTBus-API-Reference-Final.pdf), and [here](https://www.transport.act.gov.au/contact-us/information-for-developers).

## API Key (required)

**Register for an API key [here](https://www.transport.act.gov.au/contact-us/information-for-developers/nxtbus-data-feed-registration-form)**

## Usage
1. Install with `npm`:
    ```sh
    npm i nxtbus
    ```
2. Use in a Node JS/TS project:
    ```ts
    import { NxtbusAPI } from 'nxtbus';

    const nxtbus = new NxtbusAPI(process.env.NXTBUS_API_KEY)
    const route45BusLocations = await nxtbus.getBusLocations(45)
    const locationJson = await route45BusLocations.json()

    console.log(JSON.stringify(locationJson, null, 2))
    ```

    Produces:
    ```json
    {
        "timestamp": "2023-01-03T16:19:03+11:00",
        "status": true,
        "vehicles": [
            {
            "recordedAt": "2023-01-03T16:18:51.549+11:00",
            "validUntil": "2023-01-03T16:29:03+11:00",
            "route": "VM_ACT_0045",
            "progress": {
                "distance": 294,
                "percentage": 54
            },
            "bus": {
                "direction": "B",
                "datedVehicleJourney": "3043-00004-1",
                "pattern": "115",
   ...
    ```
## The API

Our `nxtbus` module provides integration with ACT Government's bus stop and vehicle monitoring API.

Each API function returns a form of `ServiceResponse`, which can display both XML and JSON outputs, as well as an interactive `cheerio` interface within Node.

_Note: see the official API reference PDF linked above for information on specific fields._

### Creating a client instance

Once you have an API key, you can create an instance of `nxtbus` like so:

1. First, import the `NxtbusAPI` class:
    ```js
    import { NxtbusAPI } from 'nxtbus'
    ```
2. Then, create an instance of the object using your key:
    ```js
    const nxtbus = new NxtbusAPI(process.env.NXTBUS_API_KEY)
    ```

Now you can pull data from the API.

### Getting bus locations from a route

To track all buses on a specific route, use `nxtbus.getBusLocations`.

Let's get the bus locations on route _45_, and return it in both XML and JSON formats.

1. First, `await` the `getBusLocations` function:
    ```js
    const locations = await nxtbus.getBusLocations(45)
    ```
2. To display the XML, you can simply log it to the console:
    ```js
    console.log(locations.xml)
    ```
3. JSON is a 2 line process, as the `nxtbus` package does some work in the background to add the locations of bus stops.
    ```js
    const locationsJson = await locations.json()
    console.log(JSON.stringify(locationsJson, null, 2))
    ```

### Getting bus locations relative to a bus stop

To track incoming buses for a specific stop, first you need the bus stop's ID. That can be obtained from the CSV located [here](https://www.transport.act.gov.au/__data/assets/file/0006/1249692/AllStops.csv) _(The `nxtbus` package pulls this file in the background for up-to-date bus stop information)_.

The same XML/JSON rules apply here. XML will be skipped; we'll just print the JSON output.

_This will uses the bus stop 4455 - `Erldunda Cct opp Hawker PS`_

1. `await` the `getIncomingBuses` function:
    ```js
    const busesToStop = await nxtbus.getIncomingBuses(4455)
    ```
2. `await` the JSON return:
    ```js
    const stopJson = await busesToStop.json()
    ```
3. Log the output to the console:
    ```js
    console.log(JSON.stringify(stopJson, null, 2))
    ```

### To do

Add `productionTimetable` and `estimatedTimetable` endpoints.
