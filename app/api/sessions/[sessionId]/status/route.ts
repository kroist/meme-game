import { kvHelpers } from "@/lib/kv";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { status } = await request.json();
    const team = await kvHelpers.changeStatus(params.sessionId, status);
    return NextResponse.json(team);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
