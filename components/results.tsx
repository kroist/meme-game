import { kvHelpers, Session, Team } from "@/lib/kv";
import { MEME_TEMPLATES } from "@/lib/meme-template";

// app/session/[id]/results.tsx
export async function VoteResults({
  session,
  teams,
}: {
  session: Session;
  teams: Team[];
}) {
  // Get votes for each template
  const templateResults = await Promise.all(
    MEME_TEMPLATES.map(async (template) => {
      const templateId = template.id.toString();
      const votes = await kvHelpers.getTemplateVotes(session.id, templateId);

      // Calculate vote counts for each team
      const voteCounts = Object.entries(votes).map(([teamId, votingTeams]) => ({
        teamId,
        count: votingTeams.length,
        team: teams.find((t) => t.id === teamId),
        voters: votingTeams,
      }));

      // Sort by vote count descending
      voteCounts.sort((a, b) => b.count - a.count);

      // Get the winning submission
      const winner = voteCounts[0];
      const submission = winner.team?.submissions.find(
        (s) => s.templateId === templateId
      );

      return {
        templateId,
        winner: {
          ...winner,
          submission,
        },
        allVotes: voteCounts,
      };
    })
  );
  console.log("kek", templateResults);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Template Results</h3>

      {templateResults.map((result) => (
        <div key={result.templateId} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Template {result.templateId}</h4>
              <span className="text-sm text-gray-500">
                {result.allVotes.reduce((sum, v) => sum + v.count, 0)} total
                votes
              </span>
            </div>

            {/* Winner Section */}
            {result.winner.count > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-green-800">
                      Winner: {result.winner.team?.name}
                    </p>
                    <p className="text-sm text-green-700">
                      {result.winner.count} votes
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 rounded-full text-sm text-green-800">
                    1st Place
                  </div>
                </div>
                <p className="text-green-800 mt-2">
                  Winning Caption: {result.winner.submission?.caption}
                </p>
              </div>
            )}

            {/* All Votes Table */}
            <div className="mt-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-2">Team</th>
                    <th className="pb-2">Caption</th>
                    <th className="pb-2">Votes</th>
                    <th className="pb-2">Voted By</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {result.allVotes.map((vote) => {
                    const submission = vote.team?.submissions.find(
                      (s) => s.templateId === result.templateId
                    );

                    return (
                      <tr key={vote.teamId} className="border-t">
                        <td className="py-2">{vote.team?.name}</td>
                        <td className="py-2">{submission?.caption}</td>
                        <td className="py-2">{vote.count}</td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-1">
                            {vote.voters.map((voterId) => {
                              const voter = teams.find((t) => t.id === voterId);
                              return (
                                <span
                                  key={voterId}
                                  className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                                >
                                  {voter?.name}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
