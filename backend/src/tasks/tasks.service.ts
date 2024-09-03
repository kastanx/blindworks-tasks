import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './task.entity';
import { TaskGeneratorService } from './task.generator.service';
import { TaskInstance, TaskInstanceDocument } from './task.instance.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(TaskInstance.name)
    private taskInstance: Model<TaskInstanceDocument>,
    private taskGeneratorService: TaskGeneratorService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const session = await this.taskModel.db.startSession();
    session.startTransaction();

    try {
      const createdTask = new this.taskModel({ ...createTaskDto });
      const savedTask = await createdTask.save();

      await this.taskGeneratorService.generateTaskInstances(
        savedTask._id.toString(),
      );

      await session.commitTransaction();
      return savedTask;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel
      .findOne({ _id: id })
      .populate('taskInstances')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const updatedTask = await this.taskModel
      .findOneAndUpdate({ _id: id }, updateTaskDto, { new: true })
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    await this.taskInstance.deleteMany({ taskId: id }).exec();
  }
}
