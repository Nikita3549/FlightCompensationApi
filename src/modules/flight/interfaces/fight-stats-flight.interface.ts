export interface FlightStatsResponse {
    request: RequestInfo;
    appendix: Appendix;
    flightStatuses: IFlightStatsFlight[];
}

export interface RequestInfo {
    airline: {
        requestedCode: string;
        fsCode: string;
    };
    flight: {
        requested: string;
        interpreted: string;
    };
    utc: {
        interpreted: boolean | string;
    };
    url: string;
    nonstopOnly: {
        interpreted: boolean | string;
    };
    date: {
        year: string;
        month: string;
        day: string;
        interpreted: string;
    };
    extendedOptions: {
        requested: string;
        interpreted: string;
    };
}

export interface Appendix {
    airlines: Airline[];
    airports: Airport[];
    equipments: Equipment[];
}

export interface Airline {
    fs: string;
    iata: string;
    icao: string;
    name: string;
    active: boolean;
}

export interface Airport {
    fs: string;
    iata: string;
    icao: string;
    faa: string;
    name: string;
    city: string;
    cityCode: string;
    countryCode: string;
    countryName: string;
    regionName: string;
    timeZoneRegionName: string;
    weatherZone: string;
    localTime: string; // ISO local datetime
    utcOffsetHours: number;
    latitude: number;
    longitude: number;
    elevationFeet: number;
    classification: number;
    active: boolean;
    weatherUrl?: string;
    delayIndexUrl?: string;
}

export interface Equipment {
    iata: string;
    name: string;
    turboProp: boolean;
    jet: boolean;
    widebody: boolean;
    regional: boolean;
}

export interface IFlightStatsFlight {
    flightId: number;
    carrierFsCode: string;
    flightNumber: string;
    departureAirportFsCode: string;
    arrivalAirportFsCode: string;
    departureDate: DateInfo;
    arrivalDate: DateInfo;
    status: string;
    schedule: ScheduleInfo;
    operationalTimes: OperationalTimes;
    codeshares?: Codeshare[];
    delays?: Delays;
    flightDurations?: FlightDurations;
    airportResources?: AirportResources;
    flightEquipment?: FlightEquipment;
}

export interface DateInfo {
    dateUtc: string; // ISO UTC datetime
    dateLocal: string; // local datetime string
}

export interface ScheduleInfo {
    flightType: string;
    serviceClasses: string;
    restrictions: string;
    uplines: any[]; // usually array of objects; kept generic
    downlines: any[];
}

export interface OperationalTimes {
    publishedDeparture?: DateInfo;
    scheduledGateDeparture?: DateInfo;
    estimatedGateDeparture?: DateInfo;
    actualGateDeparture?: DateInfo;
    estimatedRunwayDeparture?: DateInfo;
    actualRunwayDeparture?: DateInfo;
    publishedArrival?: DateInfo;
    scheduledGateArrival?: DateInfo;
    estimatedGateArrival?: DateInfo;
    actualGateArrival?: DateInfo;
    estimatedRunwayArrival?: DateInfo;
    actualRunwayArrival?: DateInfo;
}

export interface Codeshare {
    fsCode: string;
    flightNumber: string;
    relationship?: string;
}

export interface Delays {
    departureGateDelayMinutes?: number;
    arrivalGateDelayMinutes?: number;
}

export interface FlightDurations {
    scheduledBlockMinutes?: number;
    blockMinutes?: number;
    airMinutes?: number;
    taxiOutMinutes?: number;
    taxiInMinutes?: number;
    [key: string]: any;
}

export interface AirportResources {
    departureTerminal?: string;
    departureGate?: string;
    arrivalTerminal?: string;
    baggage?: string;
    [key: string]: any;
}

export interface FlightEquipment {
    scheduledEquipmentIataCode?: string;
    actualEquipmentIataCode?: string;
    tailNumber?: string;
}

export const isFlightStatsResponse = (obj: any): obj is FlightStatsResponse => {
    return (
        !!obj &&
        Array.isArray(obj.flightStatuses) &&
        !!obj.request &&
        !!obj.appendix
    );
};
