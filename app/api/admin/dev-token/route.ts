import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Safely parse the body. If it fails, it falls back to an empty object instead of crashing.
    const body = await req.json().catch(() => ({})); 

    const token = `admin_dev_token_${Date.now()}`;

    return NextResponse.json({ token, success: true }, { status: 200 });
  } catch (error) {
    console.error("Token Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}