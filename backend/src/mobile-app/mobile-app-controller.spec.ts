import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Task, TaskDocument, TaskSchema } from '../../src/tasks/task.entity';
import {
  TaskInstance,
  TaskInstanceDocument,
  TaskInstanceSchema,
} from '../../src/tasks/task.instance.entity';
import { MobileAppController } from './mobile-app.controller';
import { MobileAppService } from './mobile-app.service';

describe('MobileAppController', () => {
  let controller: MobileAppController;
  let moduleRef: TestingModule;
  let taskModel: Model<Task>;
  let taskInstanceModel: Model<TaskInstance>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([
          { name: Task.name, schema: TaskSchema },
          { name: TaskInstance.name, schema: TaskInstanceSchema },
        ]),
      ],
      controllers: [MobileAppController],
      providers: [MobileAppService],
    }).compile();

    controller = moduleRef.get<MobileAppController>(MobileAppController);
    taskModel = moduleRef.get<Model<Task>>(getModelToken(Task.name));
    taskInstanceModel = moduleRef.get<Model<TaskInstance>>(
      getModelToken(TaskInstance.name),
    );
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await taskModel.deleteMany({});
    await taskInstanceModel.deleteMany({});
  });

  async function createTask(patientId: string): Promise<TaskDocument> {
    const task = new taskModel({
      title: 'Test Task',
      description: 'Test Description',
      patientId,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      frequency: { type: 'DAILY', every: 1 },
      time: '09:00',
    });
    return task.save();
  }

  async function createTaskInstance(
    taskId: string | unknown,
    patientId: string,
    date: Date,
  ): Promise<TaskInstanceDocument> {
    const taskInstance = new taskInstanceModel({
      taskId,
      patientId,
      date,
      title: 'test title',
      description: 'test description',
      time: '09:00',
      completed: false,
      updatedAt: new Date(),
    });
    return taskInstance.save();
  }

  describe('getTaskInstancesForPatient', () => {
    it('should return paginated task instances for a patient', async () => {
      const patientId = 'patient123';
      const task = await createTask(patientId);
      const startDate = new Date();
      const endDate = new Date(new Date().setDate(new Date().getDate() + 7));

      for (let i = 0; i < 5; i++) {
        await createTaskInstance(
          task._id,
          patientId,
          new Date(new Date().setDate(new Date().getDate() + i)),
        );
      }

      const result = await controller.getTaskInstancesForPatient(patientId, {
        startDate,
        endDate,
        page: 1,
        limit: 3,
      });

      expect(result.taskInstances.length).toBe(3);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
    });
  });

  describe('completeTaskInstance', () => {
    it('should mark a task instance as completed', async () => {
      const patientId = 'patient123';
      const task = await createTask(patientId);
      const taskInstance = await createTaskInstance(
        task._id,
        patientId,
        new Date(),
      );

      const result = await controller.completeTaskInstance({
        taskInstanceId: taskInstance._id.toString(),
      });

      expect(result.completed).toBe(true);
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('getCompletedTaskInstances', () => {
    it('should return paginated completed task instances for a patient', async () => {
      const patientId = 'patient123';
      const task = await createTask(patientId);

      for (let i = 0; i < 5; i++) {
        const taskInstance = await createTaskInstance(
          task._id,
          patientId,
          new Date(new Date().setDate(new Date().getDate() + i)),
        );
        if (i < 3) {
          await taskInstanceModel.findByIdAndUpdate(taskInstance._id, {
            completed: true,
          });
        }
      }

      const result = await controller.getCompletedTaskInstances(
        patientId,
        1,
        2,
      );

      expect(result.taskInstances.length).toBe(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.taskInstances.every((instance) => instance.completed)).toBe(
        true,
      );
    });
  });

  describe('sync', () => {
    it('should sync completed task instances and return updated instances', async () => {
      const patientId = 'patient123';
      const task = await createTask(patientId);

      const instances = await Promise.all([
        createTaskInstance(task._id, patientId, new Date()),
        createTaskInstance(
          task._id,
          patientId,
          new Date(new Date().setDate(new Date().getDate() + 1)),
        ),
        createTaskInstance(
          task._id,
          patientId,
          new Date(new Date().setDate(new Date().getDate() + 2)),
        ),
      ]);

      const syncData = {
        lastSyncTimestamp: new Date(
          new Date().setDate(new Date().getDate() - 1),
        ),
        completedTaskInstances: [
          { taskInstanceId: instances[0]._id.toString() },
          { taskInstanceId: instances[1]._id.toString() },
        ],
      };

      const result = await controller.sync(patientId, syncData);

      expect(result.updatedTaskInstances.length).toBe(3);
      expect(
        result.updatedTaskInstances.filter((instance) => instance.completed)
          .length,
      ).toBe(2);
      expect(result.newSyncTimestamp).toBeDefined();
    });
  });
});
