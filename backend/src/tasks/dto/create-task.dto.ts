import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { FrequencyType, WeekDay } from '../task.entity';

class FrequencyDto {
  @ApiProperty({ enum: FrequencyType, example: 'DAILY' })
  @IsNotEmpty()
  @IsEnum(FrequencyType)
  type: FrequencyType;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  every: number;

  @ApiProperty({ enum: WeekDay, example: ['MONDAY'] })
  @IsOptional()
  @IsArray()
  @IsEnum(WeekDay, { each: true })
  daysOfWeek?: WeekDay[];
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Measure blood pressure' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Please measure your blood pressure and record the results.',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: '2023-05-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2023-05-31' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ type: FrequencyDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => FrequencyDto)
  frequency: FrequencyDto;

  @ApiProperty({ example: '09:00' })
  @IsString()
  time: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notifications?: string[];

  @ApiProperty({ example: '123456789' })
  @IsString()
  patientId: string;
}
