import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { Notification } from '../notifications/notification.entity';
import { FrequencyType, Task, TaskDocument, WeekDay } from './task.entity';
import { TaskInstance, TaskInstanceDocument } from './task.instance.entity';

@Injectable()
export class TaskGeneratorService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(TaskInstance.name)
    private taskInstanceModel: Model<TaskInstance>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async generateTaskInstances(taskId: string): Promise<void> {
    const task = await this.taskModel.findById(taskId).exec();

    if (!task) {
      throw new Error('Task not found');
    }

    const startDate = moment(task.startDate);
    const endDate = moment(task.endDate);
    const currentDate = startDate.clone();

    while (currentDate.isSameOrBefore(endDate)) {
      if (this.shouldCreateTaskForDate(task, currentDate)) {
        const taskInstance = new this.taskInstanceModel({
          taskId: task._id,
          date: currentDate.toDate(),
          time: task.time,
          title: task.title,
          description: task.description,
          patientId: task.patientId,
        });

        await taskInstance.save();
        await this.generateNotifications(taskInstance, task);
      }
      currentDate.add(1, 'day');
    }
  }

  private shouldCreateTaskForDate(task: Task, date: moment.Moment): boolean {
    const { type, every, daysOfWeek } = task.frequency;

    if (type === FrequencyType.DAILY) {
      return date.diff(task.startDate, 'days') % every === 0;
    } else if (type === FrequencyType.WEEKLY) {
      const weeksSinceStart = date.diff(task.startDate, 'weeks');
      const isCorrectWeek = weeksSinceStart % every === 0;
      const isCorrectDay = daysOfWeek.includes(
        WeekDay[date.format('dddd').toUpperCase()],
      );
      return isCorrectWeek && isCorrectDay;
    }

    return false;
  }

  private async generateNotifications(
    taskInstance: TaskInstanceDocument,
    task: TaskDocument,
  ): Promise<void> {
    const notificationTimes = this.calculateNotificationTimes(
      taskInstance,
      task,
    );

    const notifications = notificationTimes.map((time) => ({
      taskInstanceId: taskInstance._id,
      patientId: taskInstance.patientId,
      scheduledTime: time,
      message: `Reminder: ${taskInstance.title} at ${taskInstance.time}`,
    }));

    await this.notificationModel.insertMany(notifications);
  }

  private calculateNotificationTimes(
    taskInstance: TaskInstance,
    task: TaskDocument,
  ): Date[] {
    const taskDate = moment(taskInstance.date).format('YYYY-MM-DD');

    return task.notifications.map((notificationTime) => {
      const notificationDateTime = moment(
        `${taskDate} ${notificationTime}`,
        'YYYY-MM-DD HH:mm',
      );

      return notificationDateTime.toDate();
    });
  }
}
