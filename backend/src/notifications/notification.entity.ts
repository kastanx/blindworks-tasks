import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'TaskInstance', required: true })
  taskInstanceId: Types.ObjectId;

  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  scheduledTime: Date;

  @Prop({ default: false })
  sent: boolean;

  @Prop()
  sentTime: Date;

  @Prop({ required: true })
  message: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
