import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { FlightStatsResponse } from './interfaces/fight-stats-flight.interface';
import { FlightData, isFlightData } from './interfaces/flight-data.interface';
import { AirportType } from '@prisma/client';

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

            return null;
        } catch (e) {
            return null;
        }
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
                        countryName: a.countryName,
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

    async saveFlightStats(
        data: FlightData,
        flightNumber: string,
        flightDate: Date,
    ) {
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
}
