"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddTeamForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, teamName }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to create team");
      }

      setTeamName("");
      router.refresh(); // Refresh the server components
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter team name"
          className="flex-1 rounded border p-2"
          disabled={isLoading}
        />
        {teamName.length > 0 && (
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add Team"}
          </button>
        )}
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
