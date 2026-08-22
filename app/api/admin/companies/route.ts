import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // TODO: Later, write your Prisma query here:
    // const companies = await prisma.company.findMany();

    // For now, return an empty array so the frontend falls back to local storage cleanly
    return NextResponse.json({ companies: [] }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}