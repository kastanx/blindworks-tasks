import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteTaskInstanceDto {
  @ApiProperty({
    description: 'The ID of the task instance to be marked as completed',
  })
  @IsNotEmpty()
  @IsString()
  taskInstanceId: string;
}
