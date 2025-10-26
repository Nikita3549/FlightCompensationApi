import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';
import { AirportService } from '../airport/airport.service';

@Module({
    providers: [FlightService, AirportService],
    exports: [FlightService],
})
export class FlightModule {}
