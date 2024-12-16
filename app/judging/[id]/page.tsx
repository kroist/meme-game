// app/session/[id]/judging/page.tsx
import { kvHelpers } from "@/lib/kv";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import JudgingComponent from "./judging-component";
import { MEME_TEMPLATES } from "@/lib/meme-template";

async function getSessionData(sessionId: string) {
  const session = await kvHelpers.getSession(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }
  return session;
}

async function getTeamData() {
  const teamCookie = cookies().get("team");
  if (!teamCookie) {
    return null;
  }
  return JSON.parse(teamCookie.value);
}

export default async function JudgingPage({
  params: { id: sessionId },
}: {
  params: { id: string };
}) {
  const teamData = await getTeamData();
  if (!teamData) {
    redirect("/team/auth");
  }

  const session = await getSessionData(sessionId);
  const currentTeam = await kvHelpers.getTeam(teamData.id);
  if (!currentTeam) {
    redirect("/team/auth");
  }
  const hasVoted = await kvHelpers.hasTeamVoted(teamData.id);
  const votes = hasVoted ? await kvHelpers.getTeamVotes(teamData.id) : [];

  // Get all teams and their submissions
  const allTeams = await kvHelpers.getSessionTeams(sessionId);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Judging - {session.name}</CardTitle>
              <Badge variant="outline">{currentTeam.name}</Badge>
            </div>
          </CardHeader>
        </Card>

        <JudgingComponent
          currentTeamId={teamData.id}
          teams={allTeams}
          memeTemplates={MEME_TEMPLATES}
          sessionId={sessionId}
          hasVoted={hasVoted}
          initialVotes={votes}
        />
      </div>
    </div>
  );
}
