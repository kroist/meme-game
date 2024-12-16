// app/auth/team-auth-form.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardFooter } from "@/components/ui/card";

interface FormState {
  error: string;
}

export function TeamAuthForm({
  verifyTeam,
}: {
  verifyTeam: (
    prevState: FormState | null,
    formData: FormData
  ) => Promise<FormState>;
}) {
  const [state, formAction] = useFormState(verifyTeam, null);

  return (
    <form action={formAction}>
      {state?.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <Input
          name="accessCode"
          type="text"
          placeholder="Enter access code"
          className="uppercase"
          maxLength={6}
          required
        />
      </div>
      <CardFooter className="px-0 mt-4">
        <SubmitButton />
      </CardFooter>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Verifying..." : "Join Session"}
    </Button>
  );
}
