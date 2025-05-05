export type ActivityType = 'industrial' | 'construction' | 'office' | 'other';
export type RiskLevel = 'standard' | 'medium' | 'high' | 'very_high';
export type SiteStatus = 'active' | 'inactive';
export type SimProvider = 'mtn' | 'orange' | 'moov';

export interface Site {
  id: string;
  company_name: string | null;
  site_name: string | null;
  zone: string | null;
  activity_type: ActivityType | null;
  day_agents_count: number;
  night_agents_count: number;
  has_team_leader: boolean;
  has_guard_dog: boolean;
  risk_level: RiskLevel;
  status: SiteStatus;
  contract_start_date: string | null;
  contract_end_date: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  intermediary_name: string | null;
  intermediary_phone: string | null;
  group_id: string | null;
  group_name: string | null;
  instructions: string | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  emergency_link_id: string;
  talkies_count: number;
  phones_count: number;
  qr_codes_count: number;
  landmark1: string | null;
  landmark2: string | null;
  landmark3: string | null;
  created_at?: string;
  updated_at?: string;
}

export const ABIDJAN_ZONES = {
  'Abobo': ['Abobo Baoulé', 'Abobo Gare', 'Akéikoi', 'Anador', 'Avocatier', 'Kennedy', "N'Dotré", 'PK-18', 'Sagbé'],
  'Adjamé': ['220 Logements', 'Bracodi', 'Forum', 'Liberté', 'Paillet', 'Williamsville'],
  'Attécoubé': ['Locodjro', 'Santé', 'Williamsville'],
  'Cocody': ['Angré', 'Deux Plateaux', 'Riviera', 'Ambassade', 'Danga', 'Lycée Technique', 'Mermoz'],
  'Koumassi': ['Akromiabla', 'Grand Campement', 'Prodomo', 'Zone Industrielle'],
  'Marcory': ['Biétry', 'Champroux', 'Zone 4', 'Zone 3'],
  'Plateau': ['Commerce', 'Administratif', 'Résidentiel'],
  'Port-Bouët': ['Aéroport', 'Gonzagueville', 'Vridi'],
  'Treichville': ['Arras', 'Avenue 8', 'Zone Portuaire'],
  'Yopougon': ['Andokoi', 'Banco', 'Gesco', 'Niangon', 'Port-Bouët 2', 'Selmer', 'Sideci', 'Toit Rouge']
};

export const INTERIOR_CITIES = [
  'Bouaké',
  'Daloa', 
  'Yamoussoukro',
  'Korhogo',
  'San Pedro',
  'Man',
  'Divo',
  'Gagnoa',
  'Abengourou',
  'Bondoukou',
  'Séguéla',
  'Odienné',
  'Dimbokro',
  'Ferkessédougou',
  'Sassandra'
];