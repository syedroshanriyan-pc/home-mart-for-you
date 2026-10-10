/**
 * Payment Provider Abstraction
 * Keeps payment gateway implementations decoupled from domain logic
 */

export interface CreatePaymentIntentParams {
  orderId: string;
  orderNumber: string;
  amountMinor: number;
  method: string;
  customerName: string;
  customerMobile: string;
}

export interface PaymentIntentResult {
  success: boolean;
  provider: string;
  transactionReference: string;
  checkoutUrl?: string;
  instructions?: string;
}

export interface IPaymentProvider {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  verifyPaymentWebhook(payload: unknown, signature: string): Promise<boolean>;
}

export class ModularPaymentProvider implements IPaymentProvider {
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    if (params.method === "COD") {
      return {
        success: true,
        provider: "CASH_ON_DELIVERY",
        transactionReference: `COD_${params.orderNumber}_${Date.now()}`,
        instructions: "Pay cash upon delivery. COD surcharge ₹7 is included in total.",
      };
    }

    // Direct UPI / Gateway placeholder ready for Razorpay/Cashfree/PhonePe integration
    return {
      success: true,
      provider: params.method,
      transactionReference: `UPI_${params.orderNumber}_${Date.now()}`,
      instructions: `Scan shop QR or pay via ${params.method} to shop UPI ID freshchicken@upi`,
    };
  }

  async verifyPaymentWebhook(payload: unknown, signature: string): Promise<boolean> {
    // In production with Razorpay/PhonePe, verify HMAC signature
    if (!signature) return false;
    return true;
  }
}

export const paymentProvider = new ModularPaymentProvider();
