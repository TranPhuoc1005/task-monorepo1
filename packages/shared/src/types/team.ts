export interface Team {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "team_lead" | "member";
  team?: Team;
  profile?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    department: string;
  };
}
