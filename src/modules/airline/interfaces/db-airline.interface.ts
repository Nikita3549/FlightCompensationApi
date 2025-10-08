export interface IDbAirline {
    id: number;
    name: string;
    alias: string | null;
    iata_code: string | null;
    icao_code: string | null;
    callsign: string | null;
    country: string | null;
    active: boolean;
}
