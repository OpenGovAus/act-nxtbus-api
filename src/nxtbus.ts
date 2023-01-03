import 'node-fetch'
import {VehicleServiceResponse} from './response/vehicleServiceResponse.js'
import {StopServiceResponse} from './response/stopServiceResponse.js'
import {promises as fs} from "fs"
import * as cheerio from 'cheerio'

interface Services {
    stopData: string,
    vehicleData: string,
    productionTimetable: string
    [key: string]: string
}

export class NxtbusAPI {
    protected maxLength: number
    protected apiKey: string
    private base: string
    private services: Services
    private serviceEndpoint: string
    public csvData?: Promise<string>

    constructor (apiKey: string, stopCsv?: string) {
        if (!apiKey) {
            console.error("'apiKey' must be provided to create an API client.")
        }
        if (stopCsv) {
            console.log(`Using provided stop data from ${stopCsv}`)
            this.csvData = fs.readFile(stopCsv)
                .then((fileBuffer: Buffer) => fileBuffer.toString())
        } else {
            this.csvData = fetch('https://www.transport.act.gov.au/contact-us/information-for-developers')
                .then(res => res.text())
                .then(text => {
                    const $ = cheerio.load(text);
                    let url: string
                    $('tbody').children().each((i, elm) => {
                        const parsed = $(elm)
                        if(parsed.text().substring(0, 16) === 'Bus stop ID list') {
                            url = parsed.find('a').attr('href')
                        }
                    })
                    if(url) {
                        return fetch(url)
                    }
                })
                .then(res => res.text())
        }
        this.apiKey = apiKey
        this.base = 'http://siri.nxtbus.act.gov.au:11000'
        this.services = {
            stopData: 'sm',
            vehicleData: 'vm',
            productionTimetable: 'pt'
        }
        this.serviceEndpoint = 'service.xml'
    }

    protected getEndpointUrl (dataService: string): string {
        return `${this.base}/${this.apiKey}/${this.services[dataService]}/${this.serviceEndpoint}`
    }

    protected createEpoch (): string {
        const time = new Date()
        const offsetTime = new Date(time.getTime() + ((2 * Math.abs(time.getTimezoneOffset() / 60)) * 60 + time.getTimezoneOffset()) * 60 * 1000)
        return `${offsetTime.getFullYear()}-${String(offsetTime.getMonth() + 1).padStart(2, '0')}-${String(offsetTime.getDate() - 1).padStart(2, '0')}T${offsetTime.getUTCHours()}:${String(offsetTime.getMinutes()).padStart(2, '0')}:${String(offsetTime.getUTCSeconds()).padStart(2, '0')}.000+10:00` // JS dates suck
    }

    protected apiQuery = (url: string, postData: string): Promise<string> => {
        return fetch(url, { method: 'POST', body: postData })
            .then(res => res.text())
            .then(text => { return text })
    }

    public getIncomingBuses = async (stopNum: number, previewMins = 60) => {
        const reqTime = this.createEpoch()
        return new StopServiceResponse(await this.apiQuery(this.getEndpointUrl('stopData'), `<?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?>
        <Siri xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema" version="2.0"
        xmlns="http://www.siri.org.uk/siri">
        <ServiceRequest>
        <RequestTimestamp>${reqTime}</RequestTimestamp>
        <RequestorRef>${this.apiKey}</RequestorRef>
        <StopMonitoringRequest version="2.0">
        <RequestTimestamp>${reqTime}</RequestTimestamp>
        <PreviewInterval>PT${previewMins}M</PreviewInterval>
        <MonitoringRef>${String(stopNum).padStart(4, '0')}</MonitoringRef>
        <MaximumTextLength>${this.maxLength}</MaximumTextLength>
        </StopMonitoringRequest>
        </ServiceRequest>
        </Siri>`), this.csvData)
    }

    public getBusLocations = async (routeNum: number) => {
        const reqTime = this.createEpoch()
        return new VehicleServiceResponse(await this.apiQuery(this.getEndpointUrl('vehicleData'), `<Siri version='2.0' xmlns:ns2='http://www.ifopt.org.uk/acsb' xmlns='http://www.siri.org.uk/siri' xmlns:ns4=' http://datex2.eu/schema/2_0RC1/2_0' xmlns:ns3='http://www.ifopt.org.uk/ifopt'><ServiceRequest> <RequestTimestamp>${reqTime}</RequestTimestamp><RequestorRef>${this.apiKey}</RequestorRef><VehicleMonitoringRequest version='2.0'><RequestTimestamp>${reqTime}</RequestTimestamp><VehicleMonitoringRef>VM_ACT_${String(routeNum).padStart(4, '0')}</VehicleMonitoringRef><MaximumTextLength>${this.maxLength}</MaximumTextLength></VehicleMonitoringRequest></ServiceRequest></Siri>`), this.csvData)
    }
}
