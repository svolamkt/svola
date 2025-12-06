export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      brand_identity: {
        Row: {
          brand_voice_description: string | null
          company_description: string | null
          company_name: string
          competitors: Json | null
          created_at: string | null
          forbidden_words: string[] | null
          founded_year: number | null
          industry: string | null
          key_messages: string[] | null
          logo_url: string | null
          market_research: Json | null
          organization_id: string
          primary_color: string | null
          secondary_color: string | null
          swot_analysis: Json | null
          target_audience: Json | null
          tone_of_voice: Json | null
          typography: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          brand_voice_description?: string | null
          company_description?: string | null
          company_name: string
          competitors?: Json | null
          created_at?: string | null
          forbidden_words?: string[] | null
          founded_year?: number | null
          industry?: string | null
          key_messages?: string[] | null
          logo_url?: string | null
          market_research?: Json | null
          organization_id: string
          primary_color?: string | null
          secondary_color?: string | null
          swot_analysis?: Json | null
          target_audience?: Json | null
          tone_of_voice?: Json | null
          typography?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          brand_voice_description?: string | null
          company_description?: string | null
          company_name?: string
          competitors?: Json | null
          created_at?: string | null
          forbidden_words?: string[] | null
          founded_year?: number | null
          industry?: string | null
          key_messages?: string[] | null
          logo_url?: string | null
          market_research?: Json | null
          organization_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          swot_analysis?: Json | null
          target_audience?: Json | null
          tone_of_voice?: Json | null
          typography?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_identity_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          encrypted_token: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          provider: string | null
        }
        Insert: {
          encrypted_token?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          provider?: string | null
        }
        Update: {
          encrypted_token?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_vectors: {
        Row: {
          content_chunk: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
        }
        Insert: {
          content_chunk?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
        }
        Update: {
          content_chunk?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_vectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_searches: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          query: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          query?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          query?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_searches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company_name: string | null
          contact_name: string | null
          email: string | null
          enrichment_data: Json | null
          id: string
          linkedin_url: string | null
          organization_id: string | null
          search_id: string | null
          status: string | null
        }
        Insert: {
          company_name?: string | null
          contact_name?: string | null
          email?: string | null
          enrichment_data?: Json | null
          id?: string
          linkedin_url?: string | null
          organization_id?: string | null
          search_id?: string | null
          status?: string | null
        }
        Update: {
          company_name?: string | null
          contact_name?: string | null
          email?: string | null
          enrichment_data?: Json | null
          id?: string
          linkedin_url?: string | null
          organization_id?: string | null
          search_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "lead_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          subscription_status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          subscription_status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          subscription_status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          organization_id: string | null
          role: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          ai_rationale: string | null
          content_payload: Json
          created_at: string | null
          id: string
          organization_id: string | null
          related_lead_id: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          ai_rationale?: string | null
          content_payload: Json
          created_at?: string | null
          id?: string
          organization_id?: string | null
          related_lead_id?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          ai_rationale?: string | null
          content_payload?: Json
          created_at?: string | null
          id?: string
          organization_id?: string | null
          related_lead_id?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_related_lead_id_fkey"
            columns: ["related_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_docs: {
        Row: {
          content_json: Json | null
          created_at: string | null
          doc_type: string | null
          id: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          content_json?: Json | null
          created_at?: string | null
          doc_type?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content_json?: Json | null
          created_at?: string | null
          doc_type?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_docs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
