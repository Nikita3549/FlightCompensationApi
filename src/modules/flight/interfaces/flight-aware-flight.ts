export interface FlightAwareAirportInfo {
    code: string;
    code_icao: string;
    code_iata: string;
    code_lid: string | null;
    timezone: string;
    name: string;
    city: string;
    airport_info_url: string;
}

export interface FlightAwareFlight {
    ident: string;
    ident_icao: string;
    ident_iata: string;
    actual_runway_off: string | null;
    actual_runway_on: string | null;
    fa_flight_id: string;
    operator: string;
    operator_icao: string;
    operator_iata: string;
    flight_number: string;
    registration: string;
    atc_ident: string | null;
    inbound_fa_flight_id: string | null;
    codeshares: string[];
    codeshares_iata: string[];
    blocked: boolean;
    diverted: boolean;
    cancelled: boolean;
    position_only: boolean;
    origin: FlightAwareAirportInfo;
    destination: FlightAwareAirportInfo;
    departure_delay: number | null;
    arrival_delay: number | null;
    filed_ete: number | null;
    foresight_predictions_available: boolean;
    scheduled_out: string | null;
    estimated_out: string | null;
    actual_out: string | null;
    scheduled_off: string | null;
    estimated_off: string | null;
    actual_off: string | null;
    scheduled_on: string | null;
    estimated_on: string | null;
    actual_on: string | null;
    scheduled_in: string | null;
    estimated_in: string | null;
    actual_in: string | null;
    progress_percent: number;
    status: string;
    aircraft_type: string | null;
    route_distance: number | null;
    filed_airspeed: number | null;
    filed_altitude: number | null;
    route: string | null;
    baggage_claim: string | null;
    seats_cabin_business: number | null;
    seats_cabin_coach: number | null;
    seats_cabin_first: number | null;
    gate_origin: string | null;
    gate_destination: string | null;
    terminal_origin: string | null;
    terminal_destination: string | null;
    type: string;
}

export interface FlightAwareFlightsResponse {
    flights: FlightAwareFlight[];
    links: any;
    num_pages: number;
}
