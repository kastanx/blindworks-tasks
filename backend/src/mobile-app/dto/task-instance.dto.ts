import { ApiProperty } from '@nestjs/swagger';

export class TaskInstanceDto {
  @ApiProperty({ description: 'The ID of the task instance' })
  id: string;

  @ApiProperty({ description: 'The title of the task' })
  title: string;

  @ApiProperty({ description: 'The description of the task' })
  description: string;

  @ApiProperty({ description: 'The date of the task instance' })
  date: Date;

  @ApiProperty({ description: 'The time of the task instance' })
  time: string;

  @ApiProperty({ description: 'Whether the task instance has been completed' })
  completed: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
