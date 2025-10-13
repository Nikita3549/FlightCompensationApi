import { DateTime } from 'luxon';

interface Airport {
    timezone: string;
}

interface GetLocalTimeParams {
    utcDate: string | null;
    airport: Airport;
    format?: string;
}

interface IFromFlightData {
    scheduledDeparture: string | null;
    actualDeparture: string | null;
    scheduledArrival: string | null;
    actualArrival: string | null;
}

export class FlightTime {
    static toLocal({
        utcDate,
        airport,
        format = 'yyyy-MM-dd HH:mm',
    }: GetLocalTimeParams): string | null {
        if (!utcDate || !airport?.timezone) return null;

        return DateTime.fromISO(utcDate, { zone: 'utc' })
            .setZone(airport.timezone)
            .toFormat(format);
    }

    static fromFlight(flight: {
        scheduled_out?: string | null;
        actual_out?: string | null;
        scheduled_in?: string | null;
        actual_in?: string | null;
        origin: Airport;
        destination: Airport;
    }): IFromFlightData | null {
        if (
            !flight.scheduled_in ||
            !flight.actual_in ||
            !flight.scheduled_out ||
            !flight.actual_out
        ) {
            return null;
        }

        return {
            scheduledDeparture: this.toLocal({
                utcDate: flight.scheduled_out,
                airport: flight.origin,
            }),
            actualDeparture: this.toLocal({
                utcDate: flight.actual_out,
                airport: flight.origin,
            }),
            scheduledArrival: this.toLocal({
                utcDate: flight.scheduled_in,
                airport: flight.destination,
            }),
            actualArrival: this.toLocal({
                utcDate: flight.actual_in,
                airport: flight.destination,
            }),
        };
    }
}
