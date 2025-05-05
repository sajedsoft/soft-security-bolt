export type AttendanceStatus = 'present' | 'absent' | '24h';

export interface AttendanceRecord {
  id: string;
  agent_id: string;
  site_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  is_replacement: boolean;
  comments: string | null;
  total_hours: number | null;
  created_at: string;
  updated_at: string;
  agent?: {
    name: string;
    photo_url: string | null;
  };
  site?: {
    site_name: string;
  };
}

export interface AgentWithSite {
  id: string;
  name: string;
  photo_url: string | null;
  site_id: string | null;
  site?: {
    site_name: string;
  };
}