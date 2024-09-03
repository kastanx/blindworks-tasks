import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendPendingNotifications() {
    const now = new Date();
    const pendingNotifications = await this.notificationModel
      .find({
        scheduledTime: { $lte: now },
        sent: false,
      })
      .exec();

    for (const notification of pendingNotifications) {
      await this.sendNotification(notification);
      notification.sent = true;
      notification.sentTime = new Date();
      await notification.save();
    }
  }

  private async sendNotification(notification: Notification) {
    console.log(`Sending notification: ${notification.message}`);
  }
}
