import { ApiProperty } from '@nestjs/swagger';
import { TaskInstanceDto } from './task-instance.dto';

export class SyncResultDto {
  @ApiProperty({
    description: 'Updated task instances',
    type: [TaskInstanceDto],
  })
  updatedTaskInstances: TaskInstanceDto[];

  @ApiProperty({ description: 'New sync timestamp' })
  newSyncTimestamp: Date;
}
