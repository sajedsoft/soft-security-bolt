export type ContractType = 'cdd' | 'cdi' | 'intern' | 'trial';
export type AgentStatus = 'active' | 'suspended' | 'left';
export type Sex = 'male' | 'female';
export type JobTitle = 
  | 'APS STANDARD'
  | 'APS EN ARME'
  | 'CONDUCTEUR'
  | 'CONTRÔLEUR VOITURE'
  | 'CONTRÔLEUR MOTO'
  | 'OPÉRATION'
  | 'RESSOURCE HUMAINE'
  | 'CYNOPHILE'
  | 'PC'
  | 'AGENT NETTOYAGE'
  | 'CONFORMITÉ'
  | 'INFORMATICIEN'
  | 'COMPTABILITÉ'
  | 'EXPLOITATION'
  | 'COUTURIER'
  | 'SUPERVISEUR'
  | 'TECHNICIEN'
  | 'GDC';

export interface Agent {
  id: string;
  name: string;
  photo_url: string | null;
  job_title: JobTitle;
  phone: string;
  contract_type: ContractType;
  start_date: string;
  contract_end_date: string | null;
  status: AgentStatus;
  sex: Sex | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  matricule: string | null;
  site_id: string | null;
  documents: string[];
  created_at?: string;
  updated_at?: string;
}