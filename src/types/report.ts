export interface AttendanceReport {
  site_name: string;
  date: string;
  agent_name: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | '24h';
  total_hours: number | null;
}

export interface IncidentReport {
  site_name: string;
  date: string;
  incident_types: string[];
  description: string;
  agent_name: string | null;
  reported_by: string;
  resolution_details: string | null;
  status: 'resolved' | 'in_progress' | 'escalated' | 'unresolved';
}

export interface PresenceSummary {
  site_name: string;
  total_agents: number;
  present: number;
  absent: number;
  date: string;
}