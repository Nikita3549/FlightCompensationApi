import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompensationModule } from './modules/compensation/compensation.module';
import { ConfigModule } from '@nestjs/config';
import { AirlineModule } from './modules/airline/airline.module';
import { FlightModule } from './modules/flight/flight.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { AirportModule } from './modules/airport/airport.module';

@Module({
    imports: [
        CompensationModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AirlineModule,
        FlightModule,
        RedisModule,
        AirportModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
