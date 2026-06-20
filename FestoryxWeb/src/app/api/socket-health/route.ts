import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`${socketUrl}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      return NextResponse.json({ status: "ok" });
    }
    return NextResponse.json({ status: "offline" }, { status: 502 });
  } catch (error) {
    clearTimeout(timeoutId);
    // Suppress console errors for connection refusal (e.g. ECONNREFUSED) to keep terminal logs clean
    return NextResponse.json({ status: "offline" }, { status: 502 });
  }
}
