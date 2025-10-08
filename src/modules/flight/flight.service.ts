import { Injectable, NotFoundException } from '@nestjs/common';
import { FlightStatsResponse } from './interfaces/fight-stats-flight';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

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
    ): Promise<FlightStatsResponse | null> {
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

            return res.data ? res.data : null;
        } catch (e) {
            return null;
        }
    }

    async saveFlightStats(data: FlightStatsResponse) {
        const { appendix, flightStatuses } = data;

        await this.saveAppendix(appendix);

        for (const flight of flightStatuses) {
            await this.saveFlight(flight);
        }

        return { success: true, saved: flightStatuses.length };
    }

    private async saveAppendix(appendix: FlightStatsResponse['appendix']) {
        const { airlines, airports, equipments } = appendix;

        // airlines
        for (const a of airlines) {
            await this.prisma.airline.upsert({
                where: { iata: a.iata },
                update: {
                    fs: a.fs,
                    icao: a.icao,
                    name: a.name,
                    active: a.active,
                },
                create: {
                    fs: a.fs,
                    iata: a.iata,
                    icao: a.icao,
                    name: a.name,
                    active: a.active,
                },
            });
        }

        // airports
        for (const ap of airports) {
            await this.prisma.airport.upsert({
                where: { iata: ap.iata },
                update: {
                    fs: ap.fs,
                    icao: ap.icao,
                    faa: ap.faa,
                    name: ap.name,
                    city: ap.city,
                    cityCode: ap.cityCode,
                    countryCode: ap.countryCode,
                    countryName: ap.countryName,
                    regionName: ap.regionName,
                    timeZoneRegionName: ap.timeZoneRegionName,
                    weatherZone: ap.weatherZone,
                    localTime: new Date(ap.localTime),
                    utcOffsetHours: ap.utcOffsetHours,
                    latitude: ap.latitude,
                    longitude: ap.longitude,
                    elevationFeet: ap.elevationFeet,
                    classification: ap.classification,
                    active: ap.active,
                    weatherUrl: ap.weatherUrl,
                    delayIndexUrl: ap.delayIndexUrl,
                },
                create: {
                    fs: ap.fs,
                    iata: ap.iata,
                    icao: ap.icao,
                    faa: ap.faa,
                    name: ap.name,
                    city: ap.city,
                    cityCode: ap.cityCode,
                    countryCode: ap.countryCode,
                    countryName: ap.countryName,
                    regionName: ap.regionName,
                    timeZoneRegionName: ap.timeZoneRegionName,
                    weatherZone: ap.weatherZone,
                    localTime: new Date(ap.localTime),
                    utcOffsetHours: ap.utcOffsetHours,
                    latitude: ap.latitude,
                    longitude: ap.longitude,
                    elevationFeet: ap.elevationFeet,
                    classification: ap.classification,
                    active: ap.active,
                    weatherUrl: ap.weatherUrl,
                    delayIndexUrl: ap.delayIndexUrl,
                },
            });
        }

        // equipment
        for (const eq of equipments) {
            await this.prisma.equipment.upsert({
                where: { iata: eq.iata },
                update: {
                    name: eq.name,
                    turboProp: eq.turboProp,
                    jet: eq.jet,
                    widebody: eq.widebody,
                    regional: eq.regional,
                },
                create: {
                    iata: eq.iata,
                    name: eq.name,
                    turboProp: eq.turboProp,
                    jet: eq.jet,
                    widebody: eq.widebody,
                    regional: eq.regional,
                },
            });
        }
    }

    private async saveFlight(
        flight: FlightStatsResponse['flightStatuses'][number],
    ) {
        const {
            flightId,
            carrierFsCode,
            flightNumber,
            status,
            departureAirportFsCode,
            arrivalAirportFsCode,
            operationalTimes,
            delays,
            flightDurations,
            airportResources,
            flightEquipment,
            codeshares,
        } = flight;

        const airline = await this.prisma.airline.findFirst({
            where: { fs: carrierFsCode },
            select: { id: true },
        });

        const departureAirport = await this.prisma.airport.findFirst({
            where: { fs: departureAirportFsCode },
            select: { id: true },
        });

        const arrivalAirport = await this.prisma.airport.findFirst({
            where: { fs: arrivalAirportFsCode },
            select: { id: true },
        });

        const equipment = flightEquipment?.actualEquipmentIataCode
            ? await this.prisma.equipment.findFirst({
                  where: { iata: flightEquipment.actualEquipmentIataCode },
                  select: { id: true },
              })
            : null;

        const savedFlight = await this.prisma.flight.upsert({
            where: { flightId },
            update: {
                carrierFsCode,
                flightNumber,
                status,
                airlineId: airline?.id,
                departureAirportId: departureAirport?.id,
                arrivalAirportId: arrivalAirport?.id,
                equipmentId: equipment?.id ?? null,
                scheduledDepartureUtc: operationalTimes.scheduledGateDeparture
                    ?.dateUtc
                    ? new Date(operationalTimes.scheduledGateDeparture.dateUtc)
                    : null,
                scheduledArrivalUtc: operationalTimes.scheduledGateArrival
                    ?.dateUtc
                    ? new Date(operationalTimes.scheduledGateArrival.dateUtc)
                    : null,
                estimatedDepartureUtc: operationalTimes.estimatedGateDeparture
                    ?.dateUtc
                    ? new Date(operationalTimes.estimatedGateDeparture.dateUtc)
                    : null,
                estimatedArrivalUtc: operationalTimes.estimatedGateArrival
                    ?.dateUtc
                    ? new Date(operationalTimes.estimatedGateArrival.dateUtc)
                    : null,
                actualDepartureUtc: operationalTimes.actualGateDeparture
                    ?.dateUtc
                    ? new Date(operationalTimes.actualGateDeparture.dateUtc)
                    : null,
                actualArrivalUtc: operationalTimes.actualGateArrival?.dateUtc
                    ? new Date(operationalTimes.actualGateArrival.dateUtc)
                    : null,
            },
            create: {
                flightId,
                carrierFsCode,
                flightNumber,
                status,
                airlineId: airline?.id,
                departureAirportId: departureAirport?.id,
                arrivalAirportId: arrivalAirport?.id,
                equipmentId: equipment?.id ?? null,
                scheduledDepartureUtc: operationalTimes.scheduledGateDeparture
                    ?.dateUtc
                    ? new Date(operationalTimes.scheduledGateDeparture.dateUtc)
                    : null,
                scheduledArrivalUtc: operationalTimes.scheduledGateArrival
                    ?.dateUtc
                    ? new Date(operationalTimes.scheduledGateArrival.dateUtc)
                    : null,
                estimatedDepartureUtc: operationalTimes.estimatedGateDeparture
                    ?.dateUtc
                    ? new Date(operationalTimes.estimatedGateDeparture.dateUtc)
                    : null,
                estimatedArrivalUtc: operationalTimes.estimatedGateArrival
                    ?.dateUtc
                    ? new Date(operationalTimes.estimatedGateArrival.dateUtc)
                    : null,
                actualDepartureUtc: operationalTimes.actualGateDeparture
                    ?.dateUtc
                    ? new Date(operationalTimes.actualGateDeparture.dateUtc)
                    : null,
                actualArrivalUtc: operationalTimes.actualGateArrival?.dateUtc
                    ? new Date(operationalTimes.actualGateArrival.dateUtc)
                    : null,
            },
        });

        // Дополнительные данные (1:1)
        if (delays) {
            await this.prisma.delay.upsert({
                where: { flightId: savedFlight.id },
                update: delays,
                create: { ...delays, flightId: savedFlight.id },
            });
        }

        if (flightDurations) {
            await this.prisma.flightDuration.upsert({
                where: { flightId: savedFlight.id },
                update: flightDurations,
                create: { ...flightDurations, flightId: savedFlight.id },
            });
        }

        if (airportResources) {
            await this.prisma.airportResource.upsert({
                where: { flightId: savedFlight.id },
                update: airportResources,
                create: { ...airportResources, flightId: savedFlight.id },
            });
        }

        // Codeshares (1:N)
        if (codeshares && codeshares.length > 0) {
            for (const c of codeshares) {
                await this.prisma.codeshare.upsert({
                    where: {
                        fsCode_flightNumber_flightId: {
                            fsCode: c.fsCode,
                            flightNumber: c.flightNumber,
                            flightId: savedFlight.id,
                        },
                    },
                    update: { relationship: c.relationship ?? null },
                    create: {
                        fsCode: c.fsCode,
                        flightNumber: c.flightNumber,
                        relationship: c.relationship ?? null,
                        flightId: savedFlight.id,
                    },
                });
            }
        }
    }
    async findFlightByCode(
        flightCode: string,
        airlineIcao: string,
        date: string | Date,
    ) {
        const flightDate = typeof date == 'string' ? new Date(date) : date;

        const startOfDay = new Date(flightDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(flightDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const airline = await this.prisma.airline.findFirst({
            where: { icao: airlineIcao.toUpperCase() },
            select: { id: true },
        });

        if (!airline) {
            throw new NotFoundException(
                `Airline with ICAO ${airlineIcao} not found`,
            );
        }

        const flight = await this.prisma.flight.findFirst({
            where: {
                flightNumber: flightCode,
                airlineId: airline.id,
                scheduledDepartureUtc: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                airline: true,
                departureAirport: true,
                arrivalAirport: true,
                delays: true,
                durations: true,
                airportResources: true,
                equipment: true,
                codeshares: true,
            },
        });

        if (!flight) {
            throw new NotFoundException(
                `Flight ${airlineIcao}${flightCode} on ${date} not found`,
            );
        }

        return flight;
    }
}
