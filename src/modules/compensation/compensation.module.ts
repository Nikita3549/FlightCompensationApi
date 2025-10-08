import { Module } from '@nestjs/common';
import { CompensationController } from './compensation.controller';
import { AirlineModule } from '../airline/airline.module';
import { FlightModule } from '../flight/flight.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [AirlineModule, FlightModule, RedisModule],
    controllers: [CompensationController],
})
export class CompensationModule {}
