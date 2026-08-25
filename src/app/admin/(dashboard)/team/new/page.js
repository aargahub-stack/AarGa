import { getOptionsForNewTeamMember } from "../actions";
import NewTeamMemberView from "./NewTeamMemberView";

export default async function NewTeamMemberPage() {
  const { authUsers, interns } = await getOptionsForNewTeamMember();

  return <NewTeamMemberView authUsers={authUsers} interns={interns} />;
}
