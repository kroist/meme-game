"use server";
import React from "react";
import { Session } from "@/components/Session";

const GameManagement = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <Session />
    </div>
  );
};

export default GameManagement;
