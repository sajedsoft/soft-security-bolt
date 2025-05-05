export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          name: string
          photo_url: string | null
          job_title: string
          phone: string
          contract_type: string
          start_date: string
          contract_end_date: string | null
          status: string
          sex: string | null
          date_of_birth: string | null
          place_of_birth: string | null
          matricule: string | null
          site_id: string | null
          documents: string[]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          photo_url?: string | null
          job_title: string
          phone: string
          contract_type: string
          start_date: string
          contract_end_date?: string | null
          status: string
          sex?: string | null
          date_of_birth?: string | null
          place_of_birth?: string | null
          matricule?: string | null
          site_id?: string | null
          documents?: string[]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          photo_url?: string | null
          job_title?: string
          phone?: string
          contract_type?: string
          start_date?: string
          contract_end_date?: string | null
          status?: string
          sex?: string | null
          date_of_birth?: string | null
          place_of_birth?: string | null
          matricule?: string | null
          site_id?: string | null
          documents?: string[]
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sites: {
        Row: {
          id: string
          company_name: string | null
          site_name: string | null
          site_code: string | null
          zone: string | null
          activity_type: string | null
          day_agents_count: number
          night_agents_count: number
          has_team_leader: boolean
          has_guard_dog: boolean
          risk_level: string
          status: string
          contract_start_date: string | null
          contact_name: string | null
          contact_phone: string | null
          group_id: string | null
          group_name: string | null
          instructions: string | null
          photo_url: string | null
          latitude: number | null
          longitude: number | null
          emergency_link_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_name?: string | null
          site_name?: string | null
          site_code?: string | null
          zone?: string | null
          activity_type?: string | null
          day_agents_count?: number
          night_agents_count?: number
          has_team_leader?: boolean
          has_guard_dog?: boolean
          risk_level?: string
          status?: string
          contract_start_date?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          group_id?: string | null
          group_name?: string | null
          instructions?: string | null
          photo_url?: string | null
          latitude?: number | null
          longitude?: number | null
          emergency_link_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string | null
          site_name?: string | null
          site_code?: string | null
          zone?: string | null
          activity_type?: string | null
          day_agents_count?: number
          night_agents_count?: number
          has_team_leader?: boolean
          has_guard_dog?: boolean
          risk_level?: string
          status?: string
          contract_start_date?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          group_id?: string | null
          group_name?: string | null
          instructions?: string | null
          photo_url?: string | null
          latitude?: number | null
          longitude?: number | null
          emergency_link_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type: "industrial" | "construction" | "office" | "other"
      risk_level: "standard" | "medium" | "high" | "very_high"
      site_status: "active" | "inactive"
      sim_provider: "mtn" | "orange" | "moov"
    }
  }
}