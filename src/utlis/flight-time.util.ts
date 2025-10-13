import { DateTime } from 'luxon';

export class FlightTime {
    static toLocal({
        utcDate,
        timezone,
    }: {
        utcDate: string;
        timezone: string;
    }): string {
        return DateTime.fromISO(utcDate, { zone: 'utc' })
            .setZone(timezone)
            .toISO({
                suppressMilliseconds: false,
                suppressSeconds: false,
                includeOffset: false,
            })!;
    }
}
