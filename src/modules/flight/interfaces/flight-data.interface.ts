import { CancellationReason } from '@prisma/client';

export interface FlightData {
    isEligible: boolean;
    reason: CancellationReason | null;
    delayMinutes: number;
    arrivalDateLocal: string;
    departureDateLocal: string;
    arrivalDateUtc: string;
    departureDateUtc: string;
    departureAirport: {
        name: string;
        city: string;
        icao: string;
        iata: string;
    };
    arrivalAirport: {
        name: string;
        city: string;
        icao: string;
        iata: string;
    };
}

export function isFlightData(obj: any): obj is FlightData {
    if (typeof obj !== 'object' || obj === null) return false;

    const isAirport = (a: any) =>
        a &&
        typeof a.name === 'string' &&
        typeof a.city === 'string' &&
        typeof a.icao === 'string' &&
        typeof a.iata === 'string';

    const cancellationReasons = Object.values(CancellationReason);

    return (
        typeof obj.isEligible === 'boolean' &&
        (obj.reason === null || cancellationReasons.includes(obj.reason)) &&
        typeof obj.delayMinutes === 'number' &&
        typeof obj.arrivalDateLocal === 'string' &&
        typeof obj.departureDateLocal === 'string' &&
        typeof obj.arrivalDateUtc === 'string' &&
        typeof obj.departureDateUtc === 'string' &&
        isAirport(obj.departureAirport) &&
        isAirport(obj.arrivalAirport)
    );
}
