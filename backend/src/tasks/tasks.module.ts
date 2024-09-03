import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from 'src/notifications/notification.entity';
import { Task, TaskSchema } from './task.entity';
import { TaskGeneratorService } from './task.generator.service';
import { TaskInstance, TaskInstanceSchema } from './task.instance.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: TaskInstance.name, schema: TaskInstanceSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    // AuthModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskGeneratorService],
})
export class TasksModule {}
