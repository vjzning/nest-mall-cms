export interface NotificationPayload {
  targetType: 'USER' | 'ADMIN';
  targetId?: number;
  type: string;
  title: string;
  content: string;
  payload?: any;
  channels?: string[];
  extraEmails?: string[]; // 额外指定的邮箱
}

export interface NotificationChannel {
  getName(): string;
  send(payload: NotificationPayload): Promise<void>;
}
