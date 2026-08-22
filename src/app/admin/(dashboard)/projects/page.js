import { getAllProjects } from "@/lib/api/projects";
import ProjectsManagerView from "./ProjectsManagerView";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return <ProjectsManagerView initialProjects={projects} />;
}
