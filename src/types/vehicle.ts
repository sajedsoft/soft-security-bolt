export type VehicleType = 'moto' | 'car' | 'pickup' | '4x4';
export type FuelType = 'gasoline' | 'diesel' | 'electric';
export type MaintenanceType = 'oil_change' | 'repair' | 'inspection' | 'other';

export interface Vehicle {
  id: string;
  code: string;
  license_plate: string;
  vehicle_type: VehicleType;
  brand: string;
  model: string;
  color?: string;
  fuel_type: FuelType;
  current_mileage: number;
  first_use_date: string;
  last_oil_change_km?: number;
  next_oil_change_km?: number;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: 'insurance' | 'technical_visit' | 'sticker' | 'parking_card' | 'patente';
  expiry_date: string;
  document_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicle_id: string;
  maintenance_date: string;
  maintenance_type: MaintenanceType;
  garage?: string;
  description?: string;
  mileage: number;
  created_at?: string;
}

export interface VehicleAssignment {
  id: string;
  vehicle_id: string;
  agent_id: string;
  start_date: string;
  end_date?: string;
  created_at?: string;
}