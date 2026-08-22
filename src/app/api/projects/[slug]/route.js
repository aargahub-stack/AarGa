import { NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/api/projects";

export const revalidate = 60;

export async function GET(_request, { params }) {
  try {
    const project = await getProjectBySlug(params.slug);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ data: project });
  } catch (err) {
    console.error("[GET /api/projects/[slug]]", err);
    return NextResponse.json(
      { error: "Failed to load project." },
      { status: 500 }
    );
  }
}
