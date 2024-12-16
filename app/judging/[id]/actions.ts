// app/session/[id]/judging/actions.ts
"use server";

import { kvHelpers } from "@/lib/kv";
import { revalidatePath } from "next/cache";

export async function submitVote(
  sessionId: string,
  teamId: string,
  votes: Record<number, string>
) {
  try {
    // Check if team has already voted
    const hasVoted = await kvHelpers.hasTeamVoted(teamId);
    if (hasVoted) {
      return {
        success: false,
        error: "Your team has already submitted votes",
      };
    }

    // Convert votes object to array format
    const votesArray = Object.entries(votes).map(
      ([templateId, votedTeamId]) => ({
        templateId: templateId.toString(),
        votedTeamId,
      })
    );

    // Save votes
    await kvHelpers.saveVotes(sessionId, teamId, votesArray);

    // Revalidate the page
    revalidatePath(`/session/${sessionId}/judging`);

    return { success: true };
  } catch (error) {
    console.error("Failed to submit votes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit votes",
    };
  }
}

export async function getVotingStatus(sessionId: string, teamId: string) {
  try {
    const hasVoted = await kvHelpers.hasTeamVoted(teamId);
    const votes = hasVoted ? await kvHelpers.getTeamVotes(teamId) : [];

    return {
      hasVoted,
      votes,
    };
  } catch (error) {
    console.error("Failed to get voting status:", error);
    return {
      hasVoted: false,
      votes: [],
    };
  }
}
