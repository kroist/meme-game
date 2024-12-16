// app/session/[id]/judging/judging-component.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { submitVote } from "./actions";

interface MemeTemplate {
  id: number;
  name: string;
  url: string;
  description: string;
}

interface Team {
  id: string;
  name: string;
  submissions: {
    templateId: string;
    caption: string;
  }[];
  votes?: {
    templateId: string;
    votedTeamId: string;
  }[];
}

interface JudgingComponentProps {
  currentTeamId: string;
  teams: Team[];
  memeTemplates: MemeTemplate[];
  sessionId: string;
  hasVoted: boolean;
  initialVotes: {
    templateId: string;
    votedTeamId: string;
  }[];
}

export default function JudgingComponent({
  currentTeamId,
  teams,
  memeTemplates,
  sessionId,
  hasVoted: initialHasVoted,
  initialVotes = [],
}: JudgingComponentProps) {
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [votes, setVotes] = useState<Record<number, string>>(() => {
    // Convert initial votes to record format
    return initialVotes.reduce(
      (acc, vote) => ({
        ...acc,
        [parseInt(vote.templateId)]: vote.votedTeamId,
      }),
      {}
    );
  });
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleVoteSubmission = async () => {
    // Check if all templates have votes
    const hasAllVotes = memeTemplates.every((template) => votes[template.id]);

    if (!hasAllVotes) {
      toast({
        title: "Missing votes",
        description: "Please vote for all templates before submitting.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await submitVote(sessionId, currentTeamId, votes);

      if (result.success) {
        setHasVoted(true);
        toast({
          title: "Success!",
          description: "Your votes have been submitted.",
        });
      } else {
        toast({
          title: "Error",
          description:
            result.error || "Failed to submit votes. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleVote = (templateId: number, teamId: string) => {
    if (hasVoted) return;

    setVotes((prev) => ({
      ...prev,
      [templateId]: teamId,
    }));
  };

  const getVotedTeamName = (templateId: number) => {
    const votedTeamId = votes[templateId];
    return teams.find((team) => team.id === votedTeamId)?.name;
  };

  return (
    <div className="space-y-6">
      {hasVoted && (
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-700">
              Your votes have been submitted. You can review your choices below.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{memeTemplates[currentTemplate].name}</CardTitle>
          <CardDescription>
            {memeTemplates[currentTemplate].description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={memeTemplates[currentTemplate].url}
              alt={memeTemplates[currentTemplate].name}
              className="object-contain w-full h-full"
            />
          </div>

          <div className="space-y-4">
            {teams
              .filter((team) => team.id !== currentTeamId)
              .map((team) => {
                const submission = team.submissions.find(
                  (sub) =>
                    sub.templateId ===
                    memeTemplates[currentTemplate].id.toString()
                );

                if (!submission) return null;

                const isVoted =
                  votes[memeTemplates[currentTemplate].id] === team.id;

                return (
                  <Card
                    key={team.id}
                    className={`p-4 ${
                      isVoted ? "border-2 border-primary" : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium">
                          {submission.caption}
                        </p>
                        {isVoted && <Badge variant="secondary">Selected</Badge>}
                      </div>
                      <Button
                        variant={isVoted ? "default" : "outline"}
                        className="w-full"
                        onClick={() =>
                          handleVote(memeTemplates[currentTemplate].id, team.id)
                        }
                        disabled={hasVoted}
                      >
                        {isVoted ? "Selected" : "Select this caption"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentTemplate((curr) => curr - 1)}
            disabled={currentTemplate === 0}
          >
            Previous
          </Button>
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm text-muted-foreground">
              Template {currentTemplate + 1} of {memeTemplates.length}
            </div>
            {votes[memeTemplates[currentTemplate].id] && (
              <div className="text-xs text-muted-foreground">
                Selected: {getVotedTeamName(memeTemplates[currentTemplate].id)}
              </div>
            )}
          </div>
          {currentTemplate === memeTemplates.length - 1 ? (
            <Button
              onClick={handleVoteSubmission}
              disabled={isPending || hasVoted}
            >
              {isPending
                ? "Submitting..."
                : hasVoted
                ? "Submitted"
                : "Submit All Votes"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentTemplate((curr) => curr + 1)}
              disabled={currentTemplate === memeTemplates.length - 1}
            >
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
