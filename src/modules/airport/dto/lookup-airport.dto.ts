import { IsString } from 'class-validator';

export class LookupAirportDto {
    @IsString()
    name: string;
}
