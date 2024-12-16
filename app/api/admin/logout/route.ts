// app/api/admin/auth/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// app/api/admin/logout/route.ts
export async function POST() {
  cookies().delete("admin_session");
  return NextResponse.json({ success: true });
}
