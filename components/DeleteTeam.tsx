"use client";

import { Trash2 } from "lucide-react";

export const DeleteTeam = ({
  sessionId,
  teamId,
}: {
  sessionId: string;
  teamId: string;
}) => {
  return (
    <button
      onClick={() => {
        fetch(`/api/sessions/${sessionId}/teams`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId }),
          cache: "no-store",
        }).then(() => {
          window.location.reload();
        });
      }}
    >
      <Trash2 size={24} />
    </button>
  );
};
