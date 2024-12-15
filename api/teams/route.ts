
// app/api/teams/route.ts
import { NextResponse } from 'next/server';
import { createTeam } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { name, sessionId } = await req.json();
    const team = await createTeam(sessionId, name);
    return NextResponse.json(team);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error creating team' },
      { status: 500 }
    );
  }
}