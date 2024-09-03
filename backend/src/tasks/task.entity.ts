import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TaskInstance } from './task.instance.entity';

export type TaskDocument = Task & Document;

export enum FrequencyType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export class Frequency {
  @Prop({ required: true, enum: FrequencyType })
  type: FrequencyType;

  @Prop({ required: true, min: 1 })
  every: number;

  @Prop({ type: [String], enum: WeekDay })
  daysOfWeek?: WeekDay[];
}

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, type: Frequency })
  frequency: Frequency;

  @Prop({ required: true })
  time: string;

  @Prop({ type: [String] })
  notifications: string[];

  @Prop({ required: true })
  patientId: string;

  taskInstances: TaskInstance[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.virtual('taskInstances', {
  ref: 'TaskInstance',
  localField: '_id',
  foreignField: 'taskId',
});
