// lib/redis.ts
import { kv } from '@vercel/kv';

type Session = {
    id: string;
    name: string;
    token: string;
    status: string;
    createdAt: number;
    teams: string[];
};

export async function createSession(name: string) {
  const token = Math.random().toString(36).substr(2, 8).toUpperCase();
  const session: Session = {
    id: `session:${token}`,
    name,
    token,
    status: 'pending',
    createdAt: Date.now(),
    teams: []
  };

  await kv.set(session.id, session);
  await kv.sadd('sessions', session.id);
  
  return session;
}

export async function createTeam(sessionId: string, name: string) {
  const token = Math.random().toString(36).slice(2, 8).toUpperCase();
  const team = {
    id: `team:${token}`,
    name,
    token,
    sessionId,
    score: 0,
    submissions: []
  };

  await kv.set(team.id, team);
  
  // Add team to session
  const session: Session | null = await kv.get(sessionId);
  if (session) {
    session.teams.push(team.id);
    await kv.set(sessionId, session);
  }

  return team;
}

export async function getSessions() {
  const sessionIds = await kv.smembers('sessions');
  const sessions = await Promise.all(
    sessionIds.map(async (id) => {
      const session: Session | null = await kv.get(id);
      if (session) {
        // Get teams for this session
        const teams = await Promise.all(
          session.teams.map((teamId: string) => kv.get(teamId))
        );
        return { ...session, teams };
      }
      return null;
    })
  );
  return sessions.filter(Boolean);
}