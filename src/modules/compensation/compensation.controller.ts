import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AirlineService } from '../airline/airline.service';
import { GetCompensationEligibilityDto } from './dto/get-compensation-eligibility.dto';
import { FlightService } from '../flight/flight.service';
import { RedisService } from '../redis/redis.service';
import { FlightData } from '../flight/interfaces/flight-data.interface';

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

        const airline = await this.airlineService.getAirlineByIata(iataCode);
        const airlineCode = airline ? airline.icao : iataCode;
        const flightNumber = `${iataCode}${flightCode}`;

        const cached = await this.redis.get(cacheKey);
        if (cached) {
            try {
                console.log('cache');
                const flightFromCache = JSON.parse(cached) as FlightData;
                return this.buildEligibilityResponse(flightFromCache);
            } catch {
                await this.redis.del(cacheKey);
            }
        }

        console.log('api');
        let flight = await this.flightService.getFlightByFlightCode(
            flightCode,
            airlineCode,
            date,
        );

        if (!flight) {
            return { isEligible: false };
        }

        if (!(await this.flightService.getFlightFromDb(flightNumber, date))) {
            await this.flightService.saveFlight(flight, flightNumber, date);
        }

        await this.redis.set(cacheKey, JSON.stringify(flight), 'EX', 900);

        return this.buildEligibilityResponse(flight);
    }

    private buildEligibilityResponse(flight: FlightData) {
        const requiredTopLevelFields = [
            'isEligible',
            'reason',
            'arrivalDateUtc',
            'arrivalDateLocal',
            'departureDateUtc',
            'departureDateLocal',
            'delayMinutes',
            'departureAirport',
            'arrivalAirport',
        ] as const;

        const requiredAirportFields = ['name', 'city', 'icao', 'iata'] as const;

        if (
            flight &&
            flight?.isEligible != null &&
            flight?.delayMinutes &&
            !flight.isEligible
        ) {
            return {
                isEligible: false,
                delay: flight.delayMinutes,
            };
        }

        const validateAirport = (airport: any) => {
            for (const field of requiredAirportFields) {
                if (!airport?.[field]) {
                    return {
                        isEligible: false,
                    };
                }
            }
        };

        const validateFlight = (data: any) => {
            for (const field of requiredTopLevelFields) {
                if (data[field] === undefined || data[field] === null) {
                    return {
                        isEligible: false,
                    };
                }
            }
        };

        validateFlight(flight);
        validateAirport(flight.departureAirport);
        validateAirport(flight.arrivalAirport);

        return {
            isEligible: flight.isEligible,
            reason: flight.reason,
            arrivalDate: {
                dateUtc: flight.arrivalDateUtc,
                dateLocal: flight.arrivalDateLocal,
            },
            departureDate: {
                dateUtc: flight.departureDateUtc,
                dateLocal: flight.departureDateLocal,
            },
            departureAirport: flight.departureAirport,
            arrivalAirport: flight.arrivalAirport,
            delay: flight.delayMinutes,
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
