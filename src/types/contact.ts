export interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  phone_number: string | null;
  email: string | null;
  site_id: string | null;
  created_at: string;
  updated_at: string;
  site?: {
    site_name: string;
  };
}