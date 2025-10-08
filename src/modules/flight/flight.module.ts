import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';

@Module({
    providers: [FlightService],
    exports: [FlightService],
})
export class FlightModule {}
