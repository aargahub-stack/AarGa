import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/api/projects";

export const revalidate = 60; // ISR: re-fetch from Supabase at most once a minute

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ data: projects, count: projects.length });
  } catch (err) {
    console.error("[GET /api/projects]", err);
    return NextResponse.json(
      { error: "Failed to load projects." },
      { status: 500 }
    );
  }
}
