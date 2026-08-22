import { getAllInterns } from "@/lib/api/interns";
import InternsManagerView from "./InternsManagerView";

export default async function AdminInternsPage() {
  const interns = await getAllInterns();

  return <InternsManagerView initialInterns={interns} />;
}
