import { Injectable, OnModuleInit } from '@nestjs/common';
import { IAirport } from './interfaces/airport.interface';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { IDbAirport } from './interfaces/db-airport.interface';
import * as process from 'process';

@Injectable()
export class AirportService implements OnModuleInit {
    private pool: Pool;

    constructor(private readonly configService: ConfigService) {}

    onModuleInit() {
        this.pool = new Pool({
            user: this.configService.getOrThrow('DATABASE_STATIC_USER'),
            database: this.configService.getOrThrow('DATABASE_STATIC_DBNAME'),
            password: this.configService.getOrThrow('DATABASE_STATIC_PASSWORD'),
            host: this.configService.getOrThrow('DATABASE_STATIC_HOST'),
            port:
                process.env.NODE_ENV == 'LOCAL_DEV'
                    ? this.configService.getOrThrow('DATABASE_STATIC_PORT')
                    : 5432,
        });
    }

    public async getAirportByIcao(icao: string): Promise<IDbAirport | null> {
        const airport = await this.pool.query<IDbAirport>(
            `SELECT * FROM airports WHERE icao_code = $1`,
            [icao],
        );

        return airport.rows[0] || null;
    }

    public async getAirportByIata(iata: string): Promise<IDbAirport | null> {
        const airport = await this.pool.query<IDbAirport>(
            `SELECT * FROM airports WHERE iata_code = $1`,
            [iata],
        );

        return airport.rows[0] || null;
    }
}
