// app/session/[id]/actions.ts
"use server";

import { kvHelpers } from "@/lib/kv";
import { revalidatePath } from "next/cache";

export async function submitMemeEntries(
  teamId: string,
  sessionId: string,
  submissions: Record<number, string>
) {
  try {
    // Convert submissions object to array format expected by the Team type
    const submissionsArray = Object.entries(submissions).map(
      ([templateId, caption]) => ({
        templateId: templateId.toString(),
        caption,
      })
    );

    // Update all submissions at once

    await kvHelpers.saveSubmission(teamId, submissionsArray);

    // Revalidate the session page
    revalidatePath(`/session/${sessionId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to submit entries:", error);
    return { success: false, error: "Failed to submit entries" };
  }
}
