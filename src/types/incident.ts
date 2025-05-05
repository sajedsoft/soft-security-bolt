export type IncidentType = 
  | 'internal_theft'
  | 'external_theft'
  | 'staff_delay'
  | 'fire'
  | 'agent_abandoning_post'
  | 'sleeping_agent'
  | 'agent_bad_posture'
  | 'non_compliance'
  | 'hygiene_problem'
  | 'communication_problem'
  | 'client_complaint'
  | 'insubordination'
  | 'other';

export type IncidentStatus = 'resolved' | 'in_progress' | 'escalated' | 'unresolved';

export interface IncidentReport {
  id: string;
  site_id: string;
  agent_id?: string;
  incident_types: IncidentType[];
  other_incident_type?: string;
  description: string;
  reported_by: string;
  resolution_details: string | null;
  status: IncidentStatus;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  site?: {
    site_name: string;
  };
  agent?: {
    name: string;
  };
}