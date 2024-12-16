"use client";

import { Trash2 } from "lucide-react";

export const DeleteSession = ({ sessionId }: { sessionId: string }) => {
  return (
    <button
      onClick={() => {
        fetch(`/api/sessions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
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
