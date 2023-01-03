import { ServiceResponse, APIResponse, VehicleJourney } from './serviceResponse.js'

interface Stop {
    recordedAt: string
    validUntil: string
    monitoringRef: number
    clearDownRef: number
    bus?: VehicleJourney
}

interface StopAPIResponse extends APIResponse {
    stops?: Array<Stop>
}

function emptyVehicleAPIResponse(): StopAPIResponse {
    return {
        timestamp: '',
        status: true
    }
}

function emptyStop(): Stop {
    return {
        recordedAt: '',
        validUntil: '',
        monitoringRef: 0,
        clearDownRef: 0
    }
}


export class StopServiceResponse extends ServiceResponse {
    public async json() {
        const retJson = emptyVehicleAPIResponse()
        retJson.status = this.status
        retJson.timestamp = this.timestamp
        const stops = this.root.find('StopMonitoringDelivery').find('MonitoredStopVisit')
        if (retJson.status && stops) {
            retJson.stops = []
            const stopArray = stops.toArray()
            for (const elm of stopArray) {
                const elemObj = emptyStop()
                const elem = this.$(elm)
                elemObj.recordedAt = elem.find('RecordedAtTime').text()
                elemObj.validUntil = elem.find('ValidUntilTime').text()
                elemObj.monitoringRef = Number(elem.find('MonitoringRef').text())
                elemObj.clearDownRef = Number(elem.find('ClearDownRef').text())
                elemObj.bus = await this.parseVehicleJourney(elem)

                retJson.stops.push(elemObj)
            }
        }
        return retJson
    }
}
