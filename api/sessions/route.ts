// app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import { createSession, getSessions } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const session = await createSession(name);
    return NextResponse.json(session);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error creating session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessions = await getSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error fetching sessions' },
      { status: 500 }
    );
  }
}
