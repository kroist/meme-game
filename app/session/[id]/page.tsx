// app/session/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { kvHelpers } from "@/lib/kv";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MemeGame from "./meme-game";

const MEME_TEMPLATES = [
  {
    id: 1,
    name: "Distracted Boyfriend",
    url: "/distracted-boyfriend.png",
    description:
      "Guy looking back at another girl while his girlfriend looks disapproving",
  },
  {
    id: 2,
    name: "Drake Posting",
    url: "/drake.png",
    description: "Drake disapproving top panel, approving bottom panel",
  },
  {
    id: 3,
    name: "Is This a Pigeon?",
    url: "/bell-curve.png",
    description: "Bell curve",
  },
];

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

export default async function SessionPage({
  params: { id: sessionId },
}: {
  params: { id: string };
}) {
  const teamData = await getTeamData();
  if (!teamData) {
    redirect("/team/auth");
  }

  const session = await getSessionData(sessionId);
  const team = await kvHelpers.getTeam(teamData.id);
  if (session.status === "completed") {
    redirect(`/judging/${sessionId}`);
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Session Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{session.name}</CardTitle>
              <Badge
                variant={
                  session.status === "upcoming"
                    ? "secondary"
                    : session.status === "active"
                    ? "outline"
                    : "default"
                }
              >
                {session.status}
              </Badge>
            </div>
            <CardDescription>Your team: {teamData.name}</CardDescription>
          </CardHeader>
        </Card>

        {session.status === "active" ? (
          <MemeGame
            sessionId={sessionId}
            teamId={teamData.id}
            memeTemplates={MEME_TEMPLATES}
            initialSubmissions={team?.submissions || []}
          />
        ) : session.status === "upcoming" ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Waiting for the host to start the session...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                This session has ended. Thanks for participating!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
