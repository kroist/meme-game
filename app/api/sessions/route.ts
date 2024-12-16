// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { kvHelpers } from "@/lib/kv";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await kvHelpers.createSession(body);
    return NextResponse.json(session);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessions = await kvHelpers.getAllSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    await kvHelpers.deleteSession(body.sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
