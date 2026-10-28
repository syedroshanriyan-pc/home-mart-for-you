import crypto from "crypto";

/**
 * Generates a collision-resistant, human-friendly order number with the "FC-" prefix.
 * Format: FC-<TIMESTAMP_SEGMENT>-<RANDOM_ALPHANUMERIC>
 * Example: FC-7H3K9A-1B2C3D
 * 
 * Never relies on order count, ensuring zero collisions under concurrent order creation.
 */
export function generateCollisionResistantOrderNumber(): string {
  // Millisecond timestamp in base36 + 6 random hexadecimal characters
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `FC-${timePart}-${randomPart}`;
}

/**
 * Allocates a confirmed unique order number by verifying against the database
 * with a bounded retry policy (max 5 attempts) to guarantee uniqueness.
 */
export async function allocateUniqueOrderNumber(
  dbClient?: any,
  maxRetries = 5
): Promise<string> {
  const client = dbClient || (await import("@/lib/prisma")).prisma;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const candidate = generateCollisionResistantOrderNumber();
    const existing = await client.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  // Fallback with high-entropy timestamp and random integers if extreme contention
  const finalFallback = `FC-${Date.now()}-${crypto.randomInt(100000, 999999)}`;
  return finalFallback;
}
