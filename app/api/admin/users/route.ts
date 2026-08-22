import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // TODO: Later, write your Prisma query here:
    // const users = await prisma.user.findMany();
    
    // For now, return an empty array to satisfy the frontend and clear the 404
    return NextResponse.json({ users: [] }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}