import { ApiProperty } from '@nestjs/swagger';
import { TaskInstanceDto } from './task-instance.dto';

export class PaginatedTaskInstancesDto {
  @ApiProperty({
    description: 'List of task instances',
    type: [TaskInstanceDto],
  })
  taskInstances: TaskInstanceDto[];

  @ApiProperty({ description: 'Total number of task instances' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of task instances per page' })
  limit: number;
}
