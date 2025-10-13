import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { FlightStatsResponse } from './interfaces/fight-stats-flight.interface';
import { FlightData, isFlightData } from './interfaces/flight-data.interface';
import { AirportType } from '@prisma/client';
import {
    FlightAwareFlight,
    FlightAwareFlightsResponse,
} from './interfaces/flight-aware-flight';
import { formatDate } from '../../utlis/formatDate';
import { FlightTime } from '../../utlis/flight-time.util';

@Injectable()
export class FlightService {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}
    async getFlightByFlightCode(
        flightCode: string,
        airlineCode: string,
        date: Date,
    ): Promise<FlightData | null> {
        try {
            const flightFromFlightStats = await this.getFlightFromFlightStats(
                flightCode,
                airlineCode,
                date,
            );

            if (flightFromFlightStats) {
                return flightFromFlightStats;
            }

            const flightFromFlightAware = await this.getFlightFromFlightAware(
                flightCode,
                airlineCode,
                date,
            );

            if (flightFromFlightAware) {
                return flightFromFlightAware;
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    private async getFlightFromFlightAware(
        flightCode: string,
        airlineCode: string,
        date: Date,
    ): Promise<FlightData | null> {
        try {
            const flightIdent = `${airlineCode}${flightCode}`;

            const { end: flightDateEnd, start: flightDateStart } =
                this.getFlightDateRange(date);

            const res = await axios.get<FlightAwareFlightsResponse>(
                `${this.configService.getOrThrow('FLIGHTAWARE_BASE_URL')}/history/flights/${flightIdent}`,
                {
                    params: {
                        start: flightDateStart
                            .toISOString()
                            .replace(/\.\d{3}Z$/, 'Z'),
                        end: flightDateEnd
                            .toISOString()
                            .replace(/\.\d{3}Z$/, 'Z'),
                    },
                    headers: {
                        ['x-apikey']: this.configService.getOrThrow(
                            'FLIGHTAWARE_API_KEY',
                        ),
                    },
                },
            );

            const flight = this.findFlightByDate(res.data.flights, date);

            if (!flight || !flight.scheduled_in || !flight.scheduled_off) {
                return null;
            }

            const actualCancelled = !!flight?.cancelled;
            const delayMinutes = flight?.arrival_delay
                ? Math.floor(flight.arrival_delay / (60 * 60))
                : 0;

            const isEligible = delayMinutes > 180 || actualCancelled;

            const formattedFlight: FlightData = {
                isEligible,
                reason: actualCancelled ? 'cancellation' : 'delay',
                delayMinutes,
                arrivalDateLocal: FlightTime.toLocal({
                    utcDate: flight.scheduled_in,
                    timezone: flight.destination.timezone,
                }),
                departureDateLocal: FlightTime.toLocal({
                    utcDate: flight.scheduled_off,
                    timezone: flight.origin.timezone,
                }),
                arrivalDateUtc: flight.scheduled_in,
                departureDateUtc: flight.scheduled_off,
                departureAirport: {
                    name: flight.origin.name,
                    iata: flight.origin.code_iata,
                    icao: flight.origin.code_icao,
                    city: flight.origin.city,
                },
                arrivalAirport: {
                    name: flight.destination.name,
                    iata: flight.destination.code_iata,
                    icao: flight.destination.code_icao,
                    city: flight.destination.city,
                },
            };

            if (!isFlightData(formattedFlight)) {
                console.warn(`Flight ${airlineCode}${flightCode} includes wrong response from FlightStats.
Final flight object doesn't implement CreateFlightData interface.
${JSON.stringify(formattedFlight, null, 2)}`);

                return null;
            }

            return formattedFlight;
        } catch (e) {
            return null;
        }
    }

    private findFlightByDate(
        flights: FlightAwareFlight[],
        date: Date,
    ): FlightAwareFlight | undefined {
        return flights.find(
            (f) =>
                f.scheduled_off &&
                f.scheduled_off.includes(formatDate(date, 'yyyy-mm-dd')),
        );
    }

    private async getFlightFromFlightStats(
        flightCode: string,
        airlineCode: string,
        date: Date,
    ): Promise<FlightData | null> {
        try {
            const url = `${this.configService.getOrThrow('FLIGHT_STATS_URL')}/flex/flightstatus/rest/v2/json/flight/status/${airlineCode}/${flightCode}/dep/${date.getUTCFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

            const res = await axios.get<FlightStatsResponse>(url, {
                params: {
                    appId: this.configService.getOrThrow('FLIGHT_STATS_APP_ID'),
                    appKey: this.configService.getOrThrow(
                        'FLIGHT_STATS_API_KEY',
                    ),
                },
            });

            const flightStatus = res.data?.flightStatuses[0];

            if (!flightStatus) {
                return null;
            }

            const actualCancelled =
                flightStatus.status === 'C' || flightStatus.status === 'R';
            const delayMinutes =
                flightStatus.delays?.arrivalGateDelayMinutes || 0;

            const isEligible = delayMinutes > 180 || actualCancelled;

            const findAirport = (code: string) =>
                res.data.appendix.airports
                    .filter((a) => a.fs == code)
                    .map((a) => ({
                        name: a.name,
                        city: a.city,
                        icao: a.icao,
                        iata: a.iata,
                    }))[0];

            const flight = {
                isEligible,
                reason: actualCancelled ? 'cancellation' : 'delay',
                delayMinutes,
                arrivalDateLocal: flightStatus.arrivalDate.dateLocal,
                departureDateLocal: flightStatus.departureDate.dateLocal,
                arrivalDateUtc: flightStatus.arrivalDate.dateUtc,
                departureDateUtc: flightStatus.departureDate.dateUtc,
                departureAirport: findAirport(
                    flightStatus.departureAirportFsCode,
                ),
                arrivalAirport: findAirport(flightStatus.arrivalAirportFsCode),
            };

            if (!isFlightData(flight)) {
                console.warn(`Flight ${airlineCode}${flightCode} includes wrong response from FlightStats.
Final flight object doesn't implement CreateFlightData interface.
${JSON.stringify(flight, null, 2)}`);

                return null;
            }

            return flight;
        } catch (e) {
            return null;
        }
    }

    async saveFlight(data: FlightData, flightNumber: string, flightDate: Date) {
        return this.prisma.flight.create({
            data: {
                isEligible: data.isEligible,
                reason: data.reason,
                delayMinutes: data.delayMinutes,

                arrivalDateLocal: data.arrivalDateLocal,
                departureDateLocal: data.departureDateLocal,
                arrivalDateUtc: data.arrivalDateUtc,
                departureDateUtc: data.departureDateUtc,

                date: flightDate,
                flightNumber,
                airports: {
                    create: [
                        {
                            ...data.arrivalAirport,
                            type: AirportType.ARRIVAL,
                        },
                        {
                            ...data.departureAirport,
                            type: AirportType.DEPARTURE,
                        },
                    ],
                },
            },
            include: {
                airports: true,
            },
        });
    }

    async getFlightFromDb(flightNumber: string, flightDate: Date) {
        return this.prisma.flight.findFirst({
            where: {
                flightNumber,
                date: flightDate,
            },
            include: {
                airports: true,
            },
        });
    }

    getFlightDateRange(date: Date) {
        if (new Date() < date) {
            throw new Error('Flight date is later than now');
        }

        const start = new Date(date);
        start.setUTCDate(start.getUTCDate());
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setUTCDate(end.getUTCDate() + 1);
        end.setUTCHours(23, 59, 59, 999);

        return { start, end };
    }
}
