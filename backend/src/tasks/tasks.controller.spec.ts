import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import {
  Notification,
  NotificationSchema,
} from '../../src/notifications/notification.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { FrequencyType, Task, TaskSchema, WeekDay } from './task.entity';
import { TaskGeneratorService } from './task.generator.service';
import { TaskInstance, TaskInstanceSchema } from './task.instance.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let taskModel: mongoose.Model<Task>;
  let taskInstanceModel: mongoose.Model<TaskInstance>;
  let notificationModel: mongoose.Model<Notification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        MongooseModule.forFeature([
          { name: Task.name, schema: TaskSchema },
          { name: TaskInstance.name, schema: TaskInstanceSchema },
          { name: Notification.name, schema: NotificationSchema },
        ]),
      ],
      controllers: [TasksController],
      providers: [TasksService, TaskGeneratorService],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    taskModel = module.get<mongoose.Model<Task>>('TaskModel');
    taskInstanceModel =
      module.get<mongoose.Model<TaskInstance>>('TaskInstanceModel');
    notificationModel =
      module.get<mongoose.Model<Notification>>('NotificationModel');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await taskModel.deleteMany({});
    await taskInstanceModel.deleteMany({});
    await notificationModel.deleteMany({});
  });

  describe('TaskInstance generation', () => {
    it('should generate daily task instances', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Daily Task',
        description: 'A daily task',
        startDate: new Date('2023-05-01').toUTCString(),
        endDate: new Date('2023-05-07').toUTCString(),
        frequency: {
          type: FrequencyType.DAILY,
          every: 1,
        },
        time: '09:00',
        patientId: 'patient1',
      };

      await controller.create(createTaskDto);

      const tasks = await taskModel.find().exec();
      expect(tasks).toHaveLength(1);

      const taskInstances = await taskInstanceModel.find().exec();
      expect(taskInstances).toHaveLength(7);

      taskInstances.forEach((instance) => {
        expect(instance.time).toBe('09:00');
      });
    });

    it('should generate every other day task instances', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Every Other Day Task',
        description: 'An every other day task',
        startDate: new Date('2023-05-01').toUTCString(),
        endDate: new Date('2023-05-10').toUTCString(),
        frequency: {
          type: FrequencyType.DAILY,
          every: 2,
        },
        time: '10:00',
        patientId: 'patient1',
        notifications: ['10:00'],
      };

      await controller.create(createTaskDto);

      const notifications = await notificationModel.find().exec();
      expect(notifications).toHaveLength(5);

      const taskInstances = await taskInstanceModel.find().sort('date').exec();
      expect(taskInstances).toHaveLength(5);

      const expectedDates = [
        '2023-05-01',
        '2023-05-03',
        '2023-05-05',
        '2023-05-07',
        '2023-05-09',
      ];
      taskInstances.forEach((instance, index) => {
        expect(instance.date.toISOString().split('T')[0]).toBe(
          expectedDates[index],
        );
        expect(instance.time).toBe('10:00');
      });
    });

    it('should generate weekly task instances', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Weekly Task',
        description: 'A weekly task',
        startDate: new Date('2023-05-01').toUTCString(),
        endDate: new Date('2023-05-28').toUTCString(),
        frequency: {
          type: FrequencyType.WEEKLY,
          every: 1,
          daysOfWeek: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY],
        },
        time: '11:00',
        patientId: 'patient1',
      };

      await controller.create(createTaskDto);

      const taskInstances = await taskInstanceModel.find().sort('date').exec();
      expect(taskInstances).toHaveLength(12);

      const expectedDates = [
        '2023-05-01',
        '2023-05-03',
        '2023-05-05',
        '2023-05-08',
        '2023-05-10',
        '2023-05-12',
        '2023-05-15',
        '2023-05-17',
        '2023-05-19',
        '2023-05-22',
        '2023-05-24',
        '2023-05-26',
      ];
      taskInstances.forEach((instance, index) => {
        expect(instance.date.toISOString().split('T')[0]).toBe(
          expectedDates[index],
        );
        expect(instance.time).toBe('11:00');
      });
    });

    it('should generate every other week task instances', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Every Other Week Task',
        description: 'An every other week task',
        startDate: new Date('2023-05-01').toUTCString(),
        endDate: new Date('2023-06-11').toUTCString(),
        frequency: {
          type: FrequencyType.WEEKLY,
          every: 2,
          daysOfWeek: [WeekDay.TUESDAY, WeekDay.THURSDAY],
        },
        time: '14:00',
        patientId: 'patient1',
      };

      await controller.create(createTaskDto);

      const taskInstances = await taskInstanceModel.find().sort('date').exec();
      expect(taskInstances).toHaveLength(6);

      const expectedDates = [
        '2023-05-02',
        '2023-05-04',
        '2023-05-16',
        '2023-05-18',
        '2023-05-30',
        '2023-06-01',
      ];
      taskInstances.forEach((instance, index) => {
        expect(instance.date.toISOString().split('T')[0]).toBe(
          expectedDates[index],
        );
        expect(instance.time).toBe('14:00');
      });
    });

    it('should not generate task instances outside the date range', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Limited Range Task',
        description: 'A task with a limited date range',
        startDate: new Date('2023-05-15').toUTCString(),
        endDate: new Date('2023-05-20').toUTCString(),
        frequency: {
          type: FrequencyType.DAILY,
          every: 1,
        },
        time: '10:00',
        patientId: 'patient1',
      };

      await controller.create(createTaskDto);

      const taskInstances = await taskInstanceModel.find().sort('date').exec();
      expect(taskInstances).toHaveLength(6);

      const firstInstance = taskInstances[0];
      const lastInstance = taskInstances[taskInstances.length - 1];

      expect(firstInstance.date.toISOString().split('T')[0]).toBe('2023-05-15');
      expect(lastInstance.date.toISOString().split('T')[0]).toBe('2023-05-20');
    });
  });
});
