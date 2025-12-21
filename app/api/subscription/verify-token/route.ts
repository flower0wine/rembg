import { NextResponse } from "next/server";
import { isTokenExpired } from "@/lib/utils/jwt";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 },
      );
    }

    const expired = isTokenExpired(token);

    return NextResponse.json({ expired });
  }
  catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token", expired: true },
      { status: 500 },
    );
  }
}
