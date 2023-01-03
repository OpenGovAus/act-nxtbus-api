export async function parseStop(id: string, csvData: Promise<string>): Promise<Stop> {
    const csvAwait = await csvData
    const filtered = csvAwait.split('\n').filter(rowStr => {
        return (rowStr.split('\t')[0] === id.substring(0, 4))
    })
    const split = filtered[0].split('\t')
    return {id: Number(split[0]), location: split[1], lat: Number(split[2]), long: Number(split[3]), road: split[4].substring(0, split[4].length -1)}
}

export interface Stop {
    id: number
    location: string
    lat: number
    long: number,
    road: string
}
