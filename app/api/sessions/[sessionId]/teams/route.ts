import { NextResponse } from "next/server";
import { kvHelpers } from "@/lib/kv";

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { teamName } = await request.json();
    const team = await kvHelpers.createTeam(params.sessionId, teamName);
    return NextResponse.json(team);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const teams = await kvHelpers.getSessionTeams(params.sessionId);
    return NextResponse.json(teams);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const params = await request.json();
    await kvHelpers.deleteTeam(params.teamId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
}
