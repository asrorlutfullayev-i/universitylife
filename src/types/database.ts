export type UserRole = "student" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  hemis_login: string;
  university: string;
  faculty: string;
  group_name: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
}

export type OpportunityType = "scholarship" | "international";

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  deadline: string;
  requirements?: string | null;
  contact?: string | null;
  is_published: boolean;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  points: number;
  is_published: boolean;
  created_at: string;
}

export type GroupType = "sport" | "science";

export interface GroupItem {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  schedule?: string | null;
  leader_name?: string | null;
  contact?: string | null;
  is_published: boolean;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  is_published: boolean;
  created_at: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  notes?: string | null;
  created_at: string;
  opportunity?: Opportunity;
  profile?: Profile;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  qr_token: string;
  is_checked_in: boolean;
  checked_in_at?: string | null;
  created_at: string;
  event?: EventItem;
  profile?: Profile;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  group?: GroupItem;
}

export interface PointsLog {
  id: string;
  user_id: string;
  event_id?: string | null;
  points: number;
  reason: string;
  created_at: string;
  event?: EventItem;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  university: string;
  faculty: string;
  group_name: string;
  total_points: number;
  rank: number;
}
