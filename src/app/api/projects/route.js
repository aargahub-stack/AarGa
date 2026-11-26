import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/api/projects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
