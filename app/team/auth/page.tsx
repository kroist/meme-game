// app/auth/page.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TeamAuthForm } from "./team-auth-form";
import { verifyTeam } from "./actions";

export default function TeamAuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team Access</CardTitle>
          <CardDescription>
            Enter your team access code to join the session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamAuthForm verifyTeam={verifyTeam} />
        </CardContent>
      </Card>
    </div>
  );
}
