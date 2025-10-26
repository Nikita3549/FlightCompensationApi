export interface IOAGFlightInfo {
    data: OAGFlight[];
    paging: OAGPaging;
}

export interface OAGFlight {
    carrier: OAGCarrier;
    serviceSuffix: string;
    flightNumber: number;
    sequenceNumber: number;
    flightType: string;
    departure: OAGFlightPoint;
    arrival: OAGFlightPoint;
    elapsedTime?: number;
    cargoTonnage?: number;
    aircraftType?: OAGCodeEntry;
    serviceType?: OAGCodeEntry;
    segmentInfo?: OAGSegmentInfo;
    distance?: OAGDistance;
    codeshare?: OAGCodeshare;
    scheduleInstanceKey?: string;
    statusKey?: string;
}

export interface OAGCarrier {
    iata?: string;
    icao?: string;
    [key: string]: any;
}

export interface OAGFlightPoint {
    airport: OAGAirport;
    terminal?: string;
    country?: OAGCountry;
    date?: OAGLocalUtcDate;
    time?: OAGLocalUtcTime;
    [key: string]: any;
}

export interface OAGAirport {
    iata?: string;
    icao?: string;
    [key: string]: any;
}

export interface OAGCountry {
    code?: string;
}

export interface OAGLocalUtcDate {
    local?: string; // YYYY-MM-DD
    utc?: string; // YYYY-MM-DD
}

export interface OAGLocalUtcTime {
    local?: string; // HH:mm
    utc?: string; // HH:mm
}

export interface OAGCodeEntry {
    iata?: string;
    icao?: string;
    [key: string]: any;
}

export interface OAGSegmentInfo {
    numberOfStops?: number;
    intermediateAirports?: {
        iata?: string[];
    };
}

export interface OAGDistance {
    accumulatedGreatCircleKilometers?: number;
    accumulatedGreatCircleMiles?: number;
    accumulatedGreatCircleNauticalMiles?: number;
    greatCircleKilometers?: number;
    greatCircleMiles?: number;
    greatCircleNauticalMiles?: number;
}

export interface OAGCodeshare {
    jointOperationAirlineDesignators?: any[];
    marketingFlights?: any[];
}

export interface OAGPaging {
    limit?: number;
    totalCount?: number;
    totalPages?: number;
    next?: string;
}
