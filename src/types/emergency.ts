export interface EmergencyAlert {
  id: string;
  site_id: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  type: 'danger' | 'contact';
  message?: string;
  site?: {
    site_name: string;
    contact_name: string;
  };
}

export interface EmergencyContact {
  name: string;
  number: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: 'Police', number: '110' },
  { name: 'Fire Department', number: '180' },
  { name: 'Ambulance', number: '185' },
  { name: 'Operations Control', number: '0708090910' }
];