import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../tasks/task.entity';
import {
  TaskInstance,
  TaskInstanceSchema,
} from '../tasks/task.instance.entity';
import { MobileAppController } from './mobile-app.controller';
import { MobileAppService } from './mobile-app.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: TaskInstance.name, schema: TaskInstanceSchema },
    ]),
  ],
  controllers: [MobileAppController],
  providers: [MobileAppService],
})
export class MobileAppModule {}
