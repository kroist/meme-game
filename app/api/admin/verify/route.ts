// app/api/admin/verify/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/adminAuth";

export async function GET() {
  const session = cookies().get("admin_session");

  if (!session?.value) {
    return NextResponse.json({ error: "No session found" }, { status: 401 });
  }
  const admin = await adminAuth.verifyAdmin(session.value);

  if (!admin) {
    cookies().delete("admin_session");
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  return NextResponse.json({
    id: admin.id,
    name: admin.name,
    role: admin.role,
  });
}
