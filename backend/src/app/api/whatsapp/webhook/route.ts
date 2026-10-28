import { NextRequest, NextResponse } from "next/server";
import {
  getWhatsAppConfig,
  verifyWhatsAppSignature,
  processWhatsAppWebhookEvent,
} from "@/lib/whatsapp";

/**
 * GET /api/whatsapp/webhook
 * Meta Webhook verification handshake
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const config = getWhatsAppConfig();

  if (mode === "subscribe" && token === config.verifyToken) {
    console.info("[WHATSAPP_WEBHOOK] Verification challenge confirmed successfully.");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[WHATSAPP_WEBHOOK] Verification failed: Token mismatch or invalid mode.");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Meta Webhook event notification dispatcher
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    // Verify cryptographic signature
    const isValid = verifyWhatsAppSignature(rawBody, signature);
    if (!isValid) {
      console.error("[WHATSAPP_WEBHOOK] Invalid HMAC signature rejected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: any = null;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const result = await processWhatsAppWebhookEvent(payload);

    return NextResponse.json({
      success: true,
      handled: result.handled,
      eventCount: result.eventCount,
    });
  } catch (error: any) {
    console.error("[WHATSAPP_WEBHOOK_EXCEPTION]", error.message);
    // Always return 200 to prevent Meta retry loops on internal non-fatal errors
    return NextResponse.json({ success: false, error: "Internal processing error" }, { status: 200 });
  }
}
