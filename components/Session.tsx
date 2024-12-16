import { kvHelpers, type Session } from "@/lib/kv";
import { AddTeamForm } from "./AddTeamForm";
import { CreateSession } from "./CreateSession";
import { DeleteSession } from "./DeleteSession";
import { DeleteTeam } from "./DeleteTeam";
import { ChangeSessionStatus } from "./ChangeSessionStatus";
import { VoteResults } from "./results";

export async function Session() {
  const sessions = await kvHelpers.getAllSessions();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Game</h1>
        <CreateSession />
      </div>
      <div className="grid gap-6">
        {sessions
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
      </div>
    </div>
  );
}

async function SessionCard({ session }: { session: Session }) {
  const teams = await kvHelpers.getSessionTeams(session.id);

  // Get votes for each template
  const voteCounts: Record<string, Record<string, string[]>> = {};
  for (const templateId of session.templates) {
    voteCounts[templateId] = await kvHelpers.getTemplateVotes(
      session.id,
      templateId
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Session Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{session.name}</h2>
            <p className="text-gray-500">
              {new Date(session.date).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              session.status === "active"
                ? "bg-green-100 text-green-800"
                : session.status === "upcoming"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {session.status}
          </span>
          <ChangeSessionStatus session={session} />
          <DeleteSession sessionId={session.id} />
        </div>

        {/* Add Team Form */}
        <AddTeamForm sessionId={session.id} />
      </div>

      {/* Teams List */}
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Teams ({teams.length})</h3>
        <div className="grid gap-4">
          {teams.map((team) => {
            // Calculate total votes received by this team
            const totalVotesReceived = session.templates.reduce(
              (total, templateId) => {
                return total + (voteCounts[templateId]?.[team.id]?.length || 0);
              },
              0
            );

            // Get which teams this team voted for
            const teamVotes = team.votes || [];

            return (
              <div key={team.id} className="flex flex-col p-4 border rounded">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-gray-500">
                      Access Code: {team.accessCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {team.submissions.length} submissions
                    </p>
                    <p className="text-sm text-gray-500">
                      {totalVotesReceived} votes received
                    </p>
                  </div>
                  <DeleteTeam sessionId={session.id} teamId={team.id} />
                </div>

                {/* Submissions */}
                {team.submissions.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium text-sm mb-2">Submissions:</p>
                    <div className="grid gap-2">
                      {team.submissions.map((submission) => (
                        <div
                          key={submission.templateId}
                          className="text-sm p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">
                            Template {submission.templateId}:
                          </span>{" "}
                          {submission.caption}
                          {/* Show votes received for this submission */}
                          {voteCounts[submission.templateId]?.[team.id]
                            ?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Votes received:{" "}
                              {
                                voteCounts[submission.templateId][team.id]
                                  .length
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Votes Cast */}
                {teamVotes.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2">Votes Cast:</p>
                    <div className="grid gap-2">
                      {teamVotes.map((vote) => {
                        const votedTeam = teams.find(
                          (t) => t.id === vote.votedTeamId
                        );
                        return (
                          <div
                            key={vote.templateId}
                            className="text-sm p-2 bg-gray-50 rounded"
                          >
                            <span className="font-medium">
                              Template {vote.templateId}:
                            </span>{" "}
                            Voted for {votedTeam?.name || "Unknown Team"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {teams.length === 0 && (
            <p className="text-gray-500 text-center py-4">No teams yet</p>
          )}
        </div>
        {/* Add Results Section if session is completed */}
        {session.status === "completed" && (
          <div className="p-6 border-t">
            <VoteResults session={session} teams={teams} />
          </div>
        )}
      </div>
    </div>
  );
}
