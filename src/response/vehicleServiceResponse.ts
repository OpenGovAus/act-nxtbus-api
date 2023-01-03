import {ServiceResponse, APIResponse, VehicleJourney} from './serviceResponse.js'

interface Vehicle {
    recordedAt: string
    validUntil: string
    route: string
    progress?: {
        distance: number
        percentage: number
    },
    bus?: VehicleJourney
}

interface VehicleAPIResponse extends APIResponse {
    vehicles?: Array<Vehicle>
}

function emptyVehicleAPIResponse(): VehicleAPIResponse {
    return {
        timestamp: '',
        status: true
    }
}

function emptyVehicle(): Vehicle {
    return {
        recordedAt: '',
        validUntil: '',
        route: ''
    }
}

export class VehicleServiceResponse extends ServiceResponse {
    public async json () {
        const retJson = emptyVehicleAPIResponse()
        retJson.timestamp = this.timestamp
        retJson.status = this.status
        const buses = this.root.find('VehicleMonitoringDelivery').find('VehicleActivity')
        if (retJson.status && buses) {
            retJson.vehicles = []
            const busArray = buses.toArray()
            for (const elm of busArray) {
                const elemObj = emptyVehicle()
                const elem = this.$(elm)
                elemObj.recordedAt = elem.find('RecordedAtTime').text()
                elemObj.validUntil = elem.find('ValidUntilTime').text()
                elemObj.route = elem.find('VehicleMonitoringRef').text()
                const progress = elem.find('ProgressBetweenStops')
                elemObj.progress = { distance: Number(progress.find('LinkDistance').text()), percentage: Number(progress.find('Percentage').text()) }
                elemObj.bus = await this.parseVehicleJourney(elem)

                retJson.vehicles.push(elemObj)
            }
        }
        return retJson
    }
}
