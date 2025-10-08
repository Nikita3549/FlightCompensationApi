import { IsString } from 'class-validator';

export class GetCompensationEligibilityDto{
  @IsString()
  flightNumber: string

  @IsString()
  date: string
}