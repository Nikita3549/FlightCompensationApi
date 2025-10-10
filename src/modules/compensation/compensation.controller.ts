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

        const dateKey = date.toISOString().split('T')[0];
        const keyIata = iataCode.toUpperCase();
        const keyFlight = flightCode.toUpperCase();
        const cacheKey = `eligibility:${keyIata}${keyFlight}:${dateKey}`;

        const cached = await this.redis.get(cacheKey);
        if (cached) {
            try {
                console.log('cache');
                const flightFromCache = JSON.parse(
                    cached,
                ) as FlightStatsResponse;
                return this.buildEligibilityResponse(flightFromCache);
            } catch {
                await this.redis.del(cacheKey);
            }
        }

        const airline = await this.airlineService.getAirlineByIata(iataCode);
        const airlineCode = airline ? airline.icao : iataCode;

        console.log('api');
        let flightResponse = await this.flightService.getFlightByFlightCode(
            flightCode,
            airlineCode,
            date,
        );
        debugger;
        if (
            !flightResponse ||
            (flightResponse as any).error ||
            !flightResponse?.flightStatuses[0]
        ) {
            return { isEligible: false };
        }

        debugger;
        if (
            !(await this.flightService.getFlightByFlightCode(
                flightCode,
                airlineCode,
                date,
            ))
        ) {
            await this.flightService.saveFlightStats(flightResponse);
        }
        debugger;
        await this.redis.set(
            cacheKey,
            JSON.stringify(flightResponse),
            'EX',
            600,
        );

        return this.buildEligibilityResponse(flightResponse);
    }

    private buildEligibilityResponse(flight: FlightStatsResponse) {
        const flightStatus = flight.flightStatuses[0];
        if (!flightStatus) return { isEligible: false };

        const actualCancelled =
            flightStatus.status === 'C' || flightStatus.status === 'R';
        const delayMinutes = flightStatus.delays?.arrivalGateDelayMinutes || 0;

        const isEligible = delayMinutes > 180 || actualCancelled;
        if (!isEligible) return { isEligible: false };

        const findAirport = (code: string) =>
            flight.appendix.airports
                .filter((a) => a.icao === code || a.iata === code)
                .map((a) => ({
                    name: a.name,
                    countryName: a.countryName,
                    city: a.city,
                    icao: a.icao,
                    iata: a.iata,
                }));

        return {
            isEligible,
            reason: actualCancelled ? 'cancellation' : 'delay',
            arrivalDate: flightStatus.arrivalDate,
            departureDate: flightStatus.departureDate,
            departureAirport: findAirport(flightStatus.departureAirportFsCode),
            arrivalAirport: findAirport(flightStatus.arrivalAirportFsCode),
            delay: delayMinutes,
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

        const flightRegex = /^([A-Z0-9]{2})(\d{1,4})$/i;
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
