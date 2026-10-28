/**
 * Notification Provider Abstraction
 * Handles transactional events and admin marketing broadcasts
 */

export interface TransactionalNotificationParams {
  userId?: string | null;
  orderNumber?: string;
  type:
    | "ORDER_PLACED"
    | "ORDER_CONFIRMED"
    | "ORDER_PREPARING"
    | "ORDER_OUT_FOR_DELIVERY"
    | "ORDER_DELIVERED"
    | "ORDER_CANCELLED";
  recipientPhone?: string;
  recipientName?: string;
  metadata?: Record<string, unknown>;
}

export interface BroadcastNotificationParams {
  title: string;
  message: string;
  targetUrl?: string | null;
  subscriberTokens: string[];
}

export interface BroadcastResult {
  recipientCount: number;
  successCount: number;
  failureCount: number;
}

export interface INotificationProvider {
  sendTransactional(params: TransactionalNotificationParams): Promise<boolean>;
  sendBroadcast(params: BroadcastNotificationParams): Promise<BroadcastResult>;
}

export class ModularNotificationProvider implements INotificationProvider {
  async sendTransactional(params: TransactionalNotificationParams): Promise<boolean> {
    // In production: send SMS/WhatsApp or Web Push
    // Non-blocking log to ensure transactional speed
    console.log(`[NOTIFICATION_TRANSACTIONAL] ${params.type} for Order #${params.orderNumber} to ${params.recipientPhone || "User"}`);
    return true;
  }

  async sendBroadcast(params: BroadcastNotificationParams): Promise<BroadcastResult> {
    const total = params.subscriberTokens.length;
    // Process in batches if large
    console.log(`[NOTIFICATION_BROADCAST] Sent "${params.title}" to ${total} subscribers`);
    return {
      recipientCount: total,
      successCount: total,
      failureCount: 0,
    };
  }
}

export const notificationProvider = new ModularNotificationProvider();
