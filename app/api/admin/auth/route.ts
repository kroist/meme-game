// app/api/admin/auth/route.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/adminAuth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { accessCode } = await request.json();
    const admin = await adminAuth.verifyAdmin(accessCode);

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid admin access code" },
        { status: 401 }
      );
    }

    // Set a secure HTTP-only cookie for admin session
    cookies().set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      id: admin.id,
      name: admin.name,
      role: admin.role,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
