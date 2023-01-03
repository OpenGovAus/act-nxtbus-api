import * as cheerio from 'cheerio'
import { Stop, parseStop } from '../stop.js'

export interface VehicleJourney {
    direction: string
    datedVehicleJourney: string
    pattern: number
    routeName: string
    features?: Array<string>
    firstStop: string
    lastStop: string
    destinationDisplay: string
    aimedDepartureTime: string
    aimedArrivalTime: string
    isInCongestion: boolean
    isMonitored: boolean
    location?: {
        lat: number
        long: number
    }
    delay?: string
    busId?: string
    stopInfo?: Stop
    visitNumber?: number
    isAtStop?: boolean
}

export class ServiceResponse {
    public xml: string
    protected $: cheerio.CheerioAPI
    protected root: cheerio.Cheerio<cheerio.AnyNode>
    public timestamp: string
    public status: boolean
    protected csvData: Promise<string>

    constructor (xmlResponse: string, csvData: Promise<string>) {
        this.csvData = csvData
        this.xml = xmlResponse
        this.$ = cheerio.load(this.xml, { xmlMode: true })
        this.root = this.$('ServiceDelivery')
        const toTimestamp = this.root.find('ResponseTimestamp').text()
        this.timestamp = toTimestamp.substring(0, toTimestamp.length / 2) // I don't know why it does this
        this.status = Boolean(this.root.find('Status').text())
    }

    emptyBus(): VehicleJourney {
        return {
            direction: '',
            datedVehicleJourney: '',
            pattern: 0,
            routeName: '',
            firstStop: '',
            lastStop: '',
            destinationDisplay: '',
            aimedDepartureTime: '',
            aimedArrivalTime: '',
            isMonitored: false,
            isInCongestion: false
        }
    }

    protected async parseVehicleJourney(el: cheerio.Cheerio<cheerio.AnyNode>) {
        const journey = el.find('MonitoredVehicleJourney')
        const busObj = this.emptyBus()
        busObj.direction = journey.find('DirectionRef').text()
        busObj.datedVehicleJourney = journey.find('FramedVehicleJourneyRef').find('DatedVehicleJourneyRef').text()
        busObj.pattern = Number(journey.find('JourneyPatternRef').text())
        let rn = journey.find('PublishedLineName').text()
        if (rn.length === 1) {
            rn = `R${rn}` // e.g R4, R8, etc
        }
        busObj.routeName = rn
        const vehicleFeatures = journey.find('VehicleFeatureRef')
        if (vehicleFeatures) {
            busObj.features = []
            vehicleFeatures.each((i, elm) => {
                busObj.features.push(this.$(elm).text())
            })
        }
        busObj.firstStop = journey.find('OriginName').text()
        busObj.lastStop = journey.find('DestinationName').text()
        busObj.destinationDisplay = journey.find('DestinationDisplayAtOrigin').text()
        busObj.aimedDepartureTime = journey.find('OriginAimedDepartureTime').text()
        busObj.aimedArrivalTime = journey.find('DestinationAimedArrivalTime').text()
        busObj.isInCongestion = Boolean(journey.find('InCongestion').text())
        busObj.isMonitored = Boolean(journey.find('Monitored').text())
        if (busObj.isMonitored) {
            const coords = journey.find('VehicleLocation')
            busObj.location = { lat: Number(coords.find('Latitude').text()), long: Number(coords.find('Longitude').text()) }
            busObj.delay = journey.find('Delay').text()
            busObj.busId = journey.find('VehicleRef').text()
            const monitoredCall = journey.find('MonitoredCall')
            if (monitoredCall) {
                busObj.stopInfo = await parseStop(monitoredCall.find('StopPointRef').text(), this.csvData)
                busObj.visitNumber = Number(monitoredCall.find('VisitNumber').text())
                busObj.isAtStop = Boolean(monitoredCall.find('VehicleAtStop').text())
            }
        }
        return busObj
    }    
}

export interface APIResponse {
    timestamp: string
    status: boolean
}
