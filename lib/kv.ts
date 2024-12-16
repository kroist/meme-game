import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";

export interface Vote {
  templateId: string;
  votedTeamId: string;
}

export interface Session {
  id: string;
  name: string;
  date: string;
  status: "upcoming" | "active" | "completed";
  teams: string[];
  templates: string[];
  createdAt: number;
}

export interface Team {
  id: string;
  sessionId: string;
  name: string;
  accessCode: string;
  submissions: {
    templateId: string;
    caption: string;
  }[];
  votes?: Vote[]; // Add votes to Team interface
}

// Prefix keys to avoid collisions
const SESSION_PREFIX = "meme:session:";
const TEAM_PREFIX = "meme:team:";
const CODE_PREFIX = "meme:code:";
const VOTE_PREFIX = "meme:vote:";

export const kvHelpers = {
  // Existing session operations
  async createSession(
    session: Omit<Session, "id" | "createdAt">
  ): Promise<Session> {
    const id = crypto.randomUUID();
    const newSession: Session = {
      ...session,
      id,
      createdAt: Date.now(),
      teams: [],
    };

    await kv.set(`${SESSION_PREFIX}${id}`, newSession);
    await kv.sadd("meme:sessions", id);

    return newSession;
  },

  async getSession(id: string): Promise<Session | null> {
    return kv.get(`${SESSION_PREFIX}${id}`);
  },

  async changeStatus(
    sessionId: string,
    status: Session["status"]
  ): Promise<Session> {
    const session = (await kv.get(`${SESSION_PREFIX}${sessionId}`)) as Session;
    if (!session) throw new Error("Session not found");

    const updatedSession = { ...session, status };
    await kv.set(`${SESSION_PREFIX}${sessionId}`, updatedSession);

    return updatedSession;
  },

  async getAllSessions(): Promise<Session[]> {
    revalidatePath("https://distinct-ringtail-22252.upstash.io");
    const sessionIds = await kv.smembers("meme:sessions");
    console.log(sessionIds);
    const sessions = await Promise.all(
      sessionIds.map((id) => kv.get(`${SESSION_PREFIX}${id}`))
    );
    console.log(sessions);
    return sessions.filter(Boolean) as Session[];
  },

  // New delete session operation
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await kvHelpers.deleteSessionVotes(sessionId);
      // Get all teams in the session
      const teamIds = await kv.smembers(`${SESSION_PREFIX}${sessionId}:teams`);

      // Delete all teams in the session
      for (const teamId of teamIds) {
        const team = (await kv.get(`${TEAM_PREFIX}${teamId}`)) as Team;
        if (team) {
          await kvHelpers.deleteTeam(teamId);
        }
      }

      // Delete session-related keys
      await kv.del(`${SESSION_PREFIX}${sessionId}`);
      await kv.del(`${SESSION_PREFIX}${sessionId}:teams`);
      await kv.srem("meme:sessions", sessionId);

      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  },

  // Existing team operations
  async createTeam(sessionId: string, teamName: string): Promise<Team> {
    const id = crypto.randomUUID();
    const accessCode = generateAccessCode();

    const team: Team = {
      id,
      sessionId,
      name: teamName,
      accessCode,
      submissions: [],
    };

    await kv.set(`${TEAM_PREFIX}${id}`, team);
    await kv.set(`${CODE_PREFIX}${accessCode}`, id);
    await kv.sadd(`${SESSION_PREFIX}${sessionId}:teams`, id);

    return team;
  },

  async getTeamByCode(accessCode: string): Promise<Team | null> {
    const teamId = await kv.get(`${CODE_PREFIX}${accessCode}`);
    if (!teamId) return null;
    return kv.get(`${TEAM_PREFIX}${teamId}`);
  },

  async getSessionTeams(sessionId: string): Promise<Team[]> {
    const teamIds = await kv.smembers(`${SESSION_PREFIX}${sessionId}:teams`);
    const teams = await Promise.all(
      teamIds.map((id) => kv.get(`${TEAM_PREFIX}${id}`))
    );
    return teams.filter(Boolean) as Team[];
  },

  // New delete team operation
  async deleteTeam(teamId: string): Promise<boolean> {
    try {
      // Get team data to access the access code and session ID
      const team = (await kv.get(`${TEAM_PREFIX}${teamId}`)) as Team;
      if (!team) return false;

      // Delete team-related keys
      await kv.del(`${TEAM_PREFIX}${teamId}`);
      await kv.del(`${CODE_PREFIX}${team.accessCode}`);
      await kv.srem(`${SESSION_PREFIX}${team.sessionId}:teams`, teamId);

      return true;
    } catch (error) {
      console.error("Error deleting team:", error);
      return false;
    }
  },
  async saveSubmission(
    teamId: string,
    submissionArray: Team["submissions"]
  ): Promise<Team> {
    const team = (await kv.get(`${TEAM_PREFIX}${teamId}`)) as Team;
    if (!team) throw new Error("Team not found");

    // Update or add the submission

    team.submissions = submissionArray;

    await kv.set(`${TEAM_PREFIX}${teamId}`, team);
    return team;
  },

  async getTeamSubmissions(teamId: string): Promise<Team["submissions"]> {
    const team = (await kv.get(`${TEAM_PREFIX}${teamId}`)) as Team;
    if (!team) throw new Error("Team not found");
    return team.submissions;
  },
  async getTeam(teamId: string): Promise<Team | null> {
    return kv.get(`${TEAM_PREFIX}${teamId}`);
  },
  async saveVotes(
    sessionId: string,
    votingTeamId: string,
    votes: Vote[]
  ): Promise<Team> {
    const team = (await kv.get(`${TEAM_PREFIX}${votingTeamId}`)) as Team;
    if (!team) throw new Error("Team not found");

    // Validate that the team belongs to the session
    if (team.sessionId !== sessionId) {
      throw new Error("Team does not belong to this session");
    }

    // Update the team's votes
    team.votes = votes;
    await kv.set(`${TEAM_PREFIX}${votingTeamId}`, team);

    // Store votes in a separate set for easy retrieval
    for (const vote of votes) {
      await kv.sadd(
        `${VOTE_PREFIX}${sessionId}:${vote.templateId}:${vote.votedTeamId}`,
        votingTeamId
      );
    }

    return team;
  },

  async getTeamVotes(teamId: string): Promise<Vote[]> {
    const team = (await kv.get(`${TEAM_PREFIX}${teamId}`)) as Team;
    if (!team) throw new Error("Team not found");
    return team.votes || [];
  },

  async getTemplateVotes(
    sessionId: string,
    templateId: string
  ): Promise<Record<string, string[]>> {
    const teams = await kvHelpers.getSessionTeams(sessionId);
    const votes: Record<string, string[]> = {};

    // Initialize votes object for each team
    for (const team of teams) {
      votes[team.id] = [];
    }

    // Get votes for each team
    for (const votedTeam of teams) {
      const votingTeamIds = await kv.smembers(
        `${VOTE_PREFIX}${sessionId}:${templateId}:${votedTeam.id}`
      );
      votes[votedTeam.id] = votingTeamIds;
    }

    return votes;
  },

  async hasTeamVoted(teamId: string): Promise<boolean> {
    const team = (await kv.get(`${TEAM_PREFIX}${teamId}`)) as Team;
    return Boolean(team?.votes && team.votes.length > 0);
  },

  // Add this to the deleteSession function
  async deleteSessionVotes(sessionId: string): Promise<void> {
    const teams = await kvHelpers.getSessionTeams(sessionId);
    const templates = (await kvHelpers.getSession(sessionId))?.templates || [];

    // Delete all vote keys for the session
    for (const team of teams) {
      for (const templateId of templates) {
        await kv.del(`${VOTE_PREFIX}${sessionId}:${templateId}:${team.id}`);
      }
    }
  },
};

// Helper function to generate access codes
function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
