// app/session/[id]/meme-game.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { submitMemeEntries } from "./actions";

interface MemeTemplate {
  id: number;
  name: string;
  url: string;
  description: string;
}

interface Submission {
  templateId: string;
  caption: string;
}

interface MemeGameProps {
  sessionId: string;
  teamId: string;
  memeTemplates: MemeTemplate[];
  initialSubmissions: Submission[];
}

export default function MemeGame({
  sessionId,
  teamId,
  memeTemplates,
  initialSubmissions,
}: MemeGameProps) {
  // Convert initialSubmissions array to Record format and initialize state
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [submissions, setSubmissions] = useState<Record<number, string>>(() => {
    const submissionRecord: Record<number, string> = {};
    initialSubmissions.forEach((sub) => {
      submissionRecord[parseInt(sub.templateId)] = sub.caption;
    });
    return submissionRecord;
  });
  const [isPending, startTransition] = useTransition();
  // If we have submissions for all templates, consider it submitted
  const [isSubmitted, setIsSubmitted] = useState(
    memeTemplates.every((template) =>
      initialSubmissions.some(
        (sub) => sub.templateId === template.id.toString()
      )
    )
  );
  const { toast } = useToast();

  const handleSubmission = async () => {
    // Check if all templates have captions
    const hasAllSubmissions = memeTemplates.every((template) =>
      submissions[template.id]?.trim()
    );

    if (!hasAllSubmissions) {
      toast({
        title: "Missing captions",
        description:
          "Please provide captions for all templates before submitting.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await submitMemeEntries(teamId, sessionId, submissions);

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "Success!",
          description: "Your meme captions have been submitted.",
        });
      } else {
        toast({
          title: "Error",
          description:
            result.error || "Failed to submit captions. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{memeTemplates[currentTemplate].name}</CardTitle>
          <div className="flex gap-2">
            {isSubmitted && <Badge variant="secondary">Submitted</Badge>}
            {isPending && <Badge variant="outline">Submitting...</Badge>}
          </div>
        </div>
        <CardDescription>
          {memeTemplates[currentTemplate].description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={memeTemplates[currentTemplate].url}
            alt={memeTemplates[currentTemplate].name}
            className="object-contain w-full h-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your Caption:</label>
          <Textarea
            placeholder={
              isSubmitted ? "Submissions are closed" : "Enter your caption..."
            }
            value={submissions[memeTemplates[currentTemplate].id] || ""}
            onChange={(e) => {
              setSubmissions((prev) => ({
                ...prev,
                [memeTemplates[currentTemplate].id]: e.target.value,
              }));
            }}
            disabled={isSubmitted}
            className="min-h-[100px]"
          />
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
        <div className="text-sm text-muted-foreground">
          Template {currentTemplate + 1} of {memeTemplates.length}
        </div>
        {currentTemplate === memeTemplates.length - 1 && !isSubmitted ? (
          <Button
            onClick={handleSubmission}
            disabled={isPending || isSubmitted}
          >
            {isPending ? "Submitting..." : "Submit All"}
          </Button>
        ) : null}
        {currentTemplate < memeTemplates.length - 1 ? (
          <Button
            onClick={() => setCurrentTemplate((curr) => curr + 1)}
            disabled={currentTemplate === memeTemplates.length - 1}
          >
            Next
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
