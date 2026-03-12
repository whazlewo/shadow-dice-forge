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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      character_drafts: {
        Row: {
          id: string
          updated_at: string
          user_id: string
          wizard_state: Json
          wizard_step: number
        }
        Insert: {
          id?: string
          updated_at?: string
          user_id: string
          wizard_state?: Json
          wizard_step?: number
        }
        Update: {
          id?: string
          updated_at?: string
          user_id?: string
          wizard_state?: Json
          wizard_step?: number
        }
        Relationships: []
      }
      characters: {
        Row: {
          adept_powers: Json | null
          armor: Json | null
          attribute_sources: Json | null
          attributes: Json | null
          augmentations: Json | null
          condition_monitor: Json | null
          contacts: Json | null
          created_at: string
          gear: Json | null
          id: string
          ids_lifestyles: Json | null
          karma_ledger: Json | null
          matrix_stats: Json | null
          melee_weapons: Json | null
          metatype: string | null
          name: string
          notes: Json | null
          other_abilities: Json | null
          personal_info: Json | null
          portrait_url: string | null
          priorities: Json | null
          qualities: Json | null
          ranged_weapons: Json | null
          skills: Json | null
          spells: Json | null
          updated_at: string
          user_id: string
          vehicles: Json | null
        }
        Insert: {
          adept_powers?: Json | null
          armor?: Json | null
          attribute_sources?: Json | null
          attributes?: Json | null
          augmentations?: Json | null
          condition_monitor?: Json | null
          contacts?: Json | null
          created_at?: string
          gear?: Json | null
          id?: string
          ids_lifestyles?: Json | null
          karma_ledger?: Json | null
          matrix_stats?: Json | null
          melee_weapons?: Json | null
          metatype?: string | null
          name?: string
          notes?: Json | null
          other_abilities?: Json | null
          personal_info?: Json | null
          portrait_url?: string | null
          priorities?: Json | null
          qualities?: Json | null
          ranged_weapons?: Json | null
          skills?: Json | null
          spells?: Json | null
          updated_at?: string
          user_id: string
          vehicles?: Json | null
        }
        Update: {
          adept_powers?: Json | null
          armor?: Json | null
          attribute_sources?: Json | null
          attributes?: Json | null
          augmentations?: Json | null
          condition_monitor?: Json | null
          contacts?: Json | null
          created_at?: string
          gear?: Json | null
          id?: string
          ids_lifestyles?: Json | null
          karma_ledger?: Json | null
          matrix_stats?: Json | null
          melee_weapons?: Json | null
          metatype?: string | null
          name?: string
          notes?: Json | null
          other_abilities?: Json | null
          personal_info?: Json | null
          portrait_url?: string | null
          priorities?: Json | null
          qualities?: Json | null
          ranged_weapons?: Json | null
          skills?: Json | null
          spells?: Json | null
          updated_at?: string
          user_id?: string
          vehicles?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_character_owner: { Args: { char_id: string }; Returns: boolean }
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
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
