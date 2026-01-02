import { Logger } from '@nestjs/common';
import { NotificationChannel, NotificationPayload } from '../interfaces/notification.interface';

export class EmailChannel implements NotificationChannel {
  private readonly logger = new Logger(EmailChannel.name);

  getName(): string {
    return 'EMAIL';
  }

  async send(payload: NotificationPayload): Promise<void> {
    const recipients = payload.extraEmails || [];
    
    if (recipients.length === 0) {
      this.logger.warn(`[EmailChannel] No email addresses found for notification: ${payload.title}`);
      return;
    }

    // 这里实现真正的邮件发送逻辑
    // 可以集成 nodemailer 或者 第三方邮件服务(SendGrid, AWS SES 等)
    this.logger.log(`[EmailChannel] Sending email to: ${recipients.join(', ')}`);
    this.logger.log(`[EmailChannel] Subject: ${payload.title}`);
    this.logger.log(`[EmailChannel] Content: ${payload.content}`);
    
    // 模拟发送延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    this.logger.log(`[EmailChannel] Email sent successfully to ${recipients.length} recipients`);
  }
}
