import { NextResponse } from "next/server";
import { getAllInterns, getInternStats } from "@/lib/api/interns";

export const revalidate = 60;

export async function GET() {
  try {
    const [interns, stats] = await Promise.all([
      getAllInterns(),
      getInternStats(),
    ]);
    return NextResponse.json({ data: interns, stats });
  } catch (err) {
    console.error("[GET /api/interns]", err);
    return NextResponse.json(
      { error: "Failed to load interns." },
      { status: 500 }
    );
  }
}
