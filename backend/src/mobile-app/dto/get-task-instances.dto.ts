import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class GetTaskInstancesDto {
  @ApiProperty({
    description: 'Start date for the query',
    type: String,
    format: 'date-time',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'End date for the query',
    type: String,
    format: 'date-time',
    example: '2024-01-31T23:59:59.000Z',
  })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Limit number of results per page',
    default: 20,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Timestamp of the last synchronization',
    type: String,
    format: 'date-time',
    example: '2024-01-15T10:00:00.000Z',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  lastSyncTimestamp?: Date;
}
