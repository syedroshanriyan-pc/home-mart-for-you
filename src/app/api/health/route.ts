import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const probe = req.nextUrl.searchParams.get("probe"); // "liveness" or "readiness"
  const now = new Date();

  // Basic Liveness Probe: Fast return for load balancers / process monitors
  if (probe === "liveness") {
    return NextResponse.json(
      {
        status: "ok",
        type: "liveness",
        timestamp: now.toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  // Deep Readiness Probe: Validates Supabase PostgreSQL connectivity with timeout
  let dbStatus: "connected" | "disconnected" | "timeout" = "disconnected";
  let latencyMs = -1;

  try {
    const startTime = Date.now();
    
    // 2500ms timeout race to prevent hanging requests on connection pool exhaustion
    const pingPromise = prisma.$queryRawUnsafe("SELECT 1 as ping");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database ping timeout")), 2500)
    );

    await Promise.race([pingPromise, timeoutPromise]);
    latencyMs = Date.now() - startTime;
    dbStatus = "connected";
  } catch (err: any) {
    if (err?.message === "Database ping timeout") {
      dbStatus = "timeout";
    } else {
      dbStatus = "disconnected";
    }
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      service: "homemart4u-backend",
      environment: process.env.NODE_ENV || "production",
      timestamp: now.toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: latencyMs >= 0 ? latencyMs : undefined,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
