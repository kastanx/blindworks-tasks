import { ApiProperty } from '@nestjs/swagger';
import { CompleteTaskInstanceDto } from './complete-task-instance.dto';

export class SyncDataDto {
  @ApiProperty({ description: 'Last sync timestamp' })
  lastSyncTimestamp: Date;

  @ApiProperty({
    description: 'Completed task instances to sync',
    type: [CompleteTaskInstanceDto],
  })
  completedTaskInstances: CompleteTaskInstanceDto[];
}
