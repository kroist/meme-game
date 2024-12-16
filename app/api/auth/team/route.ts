import { NextResponse } from "next/server";
import { kvHelpers } from "@/lib/kv";
export async function POST(request: Request) {
  try {
    const { accessCode } = await request.json();
    const team = await kvHelpers.getTeamByCode(accessCode);

    if (!team) {
      return NextResponse.json(
        { error: "Invalid access code" },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to authenticate team" },
      { status: 500 }
    );
  }
}
