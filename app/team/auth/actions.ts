"use server";

import { kvHelpers } from "@/lib/kv";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyTeam(
  prevState: { error: string } | null,
  formData: FormData
) {
  const accessCode = formData.get("accessCode") as string;

  if (!accessCode) {
    return { error: "Access code is required" };
  }

  const team = await kvHelpers.getTeamByCode(accessCode.toUpperCase());
  console.log(team);

  if (!team) {
    return { error: "Invalid access code. Please try again." };
  }

  // Set cookie with team information
  cookies().set(
    "team",
    JSON.stringify({
      id: team.id,
      sessionId: team.sessionId,
      name: team.name,
    }),
    {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    }
  );

  redirect(`/session/${team.sessionId}`);
}
