export interface IDbAirport {
    id: number;
    name: string;
    city: string;
    country: string;
    iata_code: string;
    icao_code: string;
    latitude: number;
    longitude: number;
    altitude: number;
    timezone_offset: string;
    dst: string;
    tz: string;
    type: string;
    source: string;
}
