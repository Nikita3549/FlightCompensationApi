import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AirlineService } from '../airline/airline.service';
import { GetCompensationEligibilityDto } from './dto/get-compensation-eligibility.dto';
import { FlightService } from '../flight/flight.service';
import { RedisService } from '../redis/redis.service';
import {
    FlightStatsResponse,
    IFlightStatsFlight,
} from '../flight/interfaces/fight-stats-flight';

@Controller('compensation')
export class CompensationController {
    constructor(
        private readonly airlineService: AirlineService,
        private readonly flightService: FlightService,
        private readonly redis: RedisService,
    ) {}

    @Get('eligibility')
    async getCompensationEligibility(
        @Query() dto: GetCompensationEligibilityDto,
    ) {
        const { flightCode, iataCode, date } = this.parseFlightDto(dto);
        const cacheKey = `eligibility:${iataCode}${flightCode}:${date.toISOString().split('T')[0]}`;

        const flight = await (async (): Promise<FlightStatsResponse | null> => {
            // Try cache
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                console.log('cache');
                return JSON.parse(cached) as FlightStatsResponse;
            }
            const airline =
                await this.airlineService.getAirlineByIata(iataCode);
            const airlineCode = airline ? airline.icao : iataCode;

            // Try db
            const dbFlight = await this.flightService.getFlightByFlightCode(
                flightCode,
                airlineCode,
                date,
            );

            if (dbFlight) {
                await this.redis.set(
                    cacheKey,
                    JSON.stringify(dbFlight),
                    'EX',
                    600,
                );
                console.log('db');
                return dbFlight;
            }

            const flightStatus = await this.flightService.getFlightByFlightCode(
                flightCode,
                airlineCode,
                date,
            );
            console.log('api');

            if (flightStatus) {
                await this.flightService.saveFlightStats(flightStatus);
                await this.redis.set(
                    cacheKey,
                    JSON.stringify(flightStatus),
                    'EX',
                    600,
                );
                return flightStatus;
            }
            return null;
        })();

        if (!flight) {
            return {
                isEligible: false,
            };
        }

        const flightStatus = flight.flightStatuses[0];

        const actualCancelled =
            flightStatus.status == 'C' || flightStatus.status == 'R'; // C - cancelled, R - redirected
        const delayMinutes = flightStatus.delays?.arrivalGateDelayMinutes
            ? flightStatus.delays.arrivalGateDelayMinutes
            : 0;

        const isEligible = delayMinutes > 180 || actualCancelled;

        if (isEligible) {
            return {
                isEligible,
                reason: actualCancelled ? 'cancellation' : 'delay',
            };
        }

        return {
            isEligible: false,
        };
    }

    private parseFlightDto(dto: GetCompensationEligibilityDto) {
        const { date, flightNumber } = dto;

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            throw new BadRequestException(
                'Invalid date format. Expected yyyy-mm-dd',
            );
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            throw new BadRequestException('Invalid date value');
        }

        const flightRegex = /^([A-Z]{2})(\d{1,4})$/i;
        const match = flightNumber.match(flightRegex);
        if (!match) {
            throw new BadRequestException(
                'Invalid flight number format. Expected like "AF1488"',
            );
        }

        const [, iataCode, flightCode] = match;

        return {
            date: parsedDate,
            iataCode: iataCode.toUpperCase(),
            flightCode,
        };
    }
}
