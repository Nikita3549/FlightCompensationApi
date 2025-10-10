import { Injectable, OnModuleInit } from '@nestjs/common';
import process from 'process';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { IAirline } from './interfaces/airline.interface';
import { IDbAirline } from './interfaces/db-airline.interface';

@Injectable()
export class AirlineService implements OnModuleInit {
    private pool: Pool;

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        this.pool = new Pool({
            user: this.configService.getOrThrow('DATABASE_STATIC_USER'),
            database: this.configService.getOrThrow('DATABASE_STATIC_DBNAME'),
            password: this.configService.getOrThrow('DATABASE_STATIC_PASSWORD'),
            host: this.configService.getOrThrow('DATABASE_STATIC_HOST'),
            port:
                this.configService.get('NODE_ENV') == 'LOCAL_DEV'
                    ? this.configService.getOrThrow('DATABASE_STATIC_PORT')
                    : 5432,
        });
    }

    async getAirlineByIata(iata: string): Promise<IAirline | null> {
        const result = await this.pool.query<IDbAirline>(
            `SELECT
            id,
            name,
            alias,
            iata_code,
            icao_code,
            callsign,
            country,
            active
         FROM airlines
         WHERE active = true
           AND iata_code = $1
             AND active = true
         LIMIT 1;`,
            [iata.toUpperCase()],
        );

        const row = result.rows[0];
        if (!row || !row?.icao_code || !row?.iata_code) {
            return null;
        }

        return {
            icao: row.icao_code,
            iata: row.iata_code,
            name: row.name,
        };
    }
}
