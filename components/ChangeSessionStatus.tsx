"use client";
import { Session } from "@/lib/kv";
import { Button } from "./ui/button";

export const ChangeSessionStatus = ({ session }: { session: Session }) => {
  const changeTo = async (sessionId: string, status: string) => {
    const response = await fetch(`/api/sessions/${sessionId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
    if (response.ok) {
      window.location.reload();
    }
  };

  if (session.status === "upcoming") {
    return (
      <Button onClick={() => changeTo(session.id, "active")}>
        Start Session
      </Button>
    );
  }
  if (session.status === "active") {
    return (
      <Button onClick={() => changeTo(session.id, "completed")}>
        End Session
      </Button>
    );
  }
  return null;
};
