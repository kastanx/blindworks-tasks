import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TaskInstance,
  TaskInstanceDocument,
} from '../tasks/task.instance.entity';

@Injectable()
export class MobileAppService {
  constructor(
    @InjectModel(TaskInstance.name)
    private taskInstanceModel: Model<TaskInstance>,
  ) {}

  async getTaskInstancesForPatient(
    patientId: string,
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    lastSyncTimestamp?: Date,
  ): Promise<{ taskInstances: TaskInstanceDocument[]; total: number }> {
    const query = {
      patientId,
      date: { $gte: startDate, $lte: endDate },
      ...(lastSyncTimestamp && { updatedAt: { $gt: lastSyncTimestamp } }),
    };

    const total = await this.taskInstanceModel.countDocuments(query);
    const taskInstances = await this.taskInstanceModel
      .find(query)
      .sort({ date: 1, time: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { taskInstances, total };
  }

  async completeTaskInstance(taskInstanceId: string): Promise<TaskInstance> {
    return this.taskInstanceModel
      .findByIdAndUpdate(
        taskInstanceId,
        { completed: true, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async batchCompleteTaskInstances(
    taskInstanceIds: string[],
  ): Promise<TaskInstanceDocument[]> {
    const updatePromises = taskInstanceIds.map((id) =>
      this.taskInstanceModel
        .findByIdAndUpdate(
          id,
          { completed: true, updatedAt: new Date() },
          { new: true },
        )
        .exec(),
    );
    return Promise.all(updatePromises);
  }

  async getCompletedTaskInstancesForPatient(
    patientId: string,
    page: number,
    limit: number,
  ): Promise<{ taskInstances: TaskInstance[]; total: number }> {
    const query = { patientId, completed: true };
    const total = await this.taskInstanceModel.countDocuments(query);
    const taskInstances = await this.taskInstanceModel
      .find(query)
      .sort({ date: -1, time: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { taskInstances, total };
  }
}
