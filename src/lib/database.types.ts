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
  economic_sense_test: {
    Tables: {
      amount_ranges: {
        Row: {
          category_id: number
          created_at: string | null
          id: number
          label_ko: string
          max_amount: number
          min_amount: number
          size: string
          typical_amount: number
        }
        Insert: {
          category_id: number
          created_at?: string | null
          id?: number
          label_ko: string
          max_amount: number
          min_amount: number
          size: string
          typical_amount: number
        }
        Update: {
          category_id?: number
          created_at?: string | null
          id?: number
          label_ko?: string
          max_amount?: number
          min_amount?: number
          size?: string
          typical_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "amount_ranges_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      economic_rankings: {
        Row: {
          created_at: string | null
          final_balance: number
          id: string
          investor_type: string
          luck_score: number
          nickname: string
          rationality_score: number
          risk_score: number
          round_results: Json | null
          total_return: number
        }
        Insert: {
          created_at?: string | null
          final_balance: number
          id?: string
          investor_type: string
          luck_score: number
          nickname: string
          rationality_score: number
          risk_score: number
          round_results?: Json | null
          total_return: number
        }
        Update: {
          created_at?: string | null
          final_balance?: number
          id?: string
          investor_type?: string
          luck_score?: number
          nickname?: string
          rationality_score?: number
          risk_score?: number
          round_results?: Json | null
          total_return?: number
        }
        Relationships: []
      }
      question_categories: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          emoji: string
          id: number
          name_ko: string
          type: Database["economic_sense_test"]["Enums"]["question_type"]
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          emoji: string
          id?: number
          name_ko: string
          type: Database["economic_sense_test"]["Enums"]["question_type"]
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          emoji?: string
          id?: number
          name_ko?: string
          type?: Database["economic_sense_test"]["Enums"]["question_type"]
        }
        Relationships: []
      }
      question_scenarios: {
        Row: {
          amount_range_id: number
          created_at: string | null
          id: number
          is_active: boolean
          normalized_max_ev: number
          option_a_description: string
          option_a_label: string
          option_a_outcomes: Json
          option_b_description: string
          option_b_label: string
          option_b_outcomes: Json
          situation: string
          updated_at: string | null
        }
        Insert: {
          amount_range_id: number
          created_at?: string | null
          id?: number
          is_active?: boolean
          normalized_max_ev?: number
          option_a_description: string
          option_a_label: string
          option_a_outcomes: Json
          option_b_description: string
          option_b_label: string
          option_b_outcomes: Json
          situation: string
          updated_at?: string | null
        }
        Update: {
          amount_range_id?: number
          created_at?: string | null
          id?: number
          is_active?: boolean
          normalized_max_ev?: number
          option_a_description?: string
          option_a_label?: string
          option_a_outcomes?: Json
          option_b_description?: string
          option_b_label?: string
          option_b_outcomes?: Json
          situation?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_scenarios_amount_range_id_fkey"
            columns: ["amount_range_id"]
            isOneToOne: false
            referencedRelation: "amount_ranges"
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
      question_type: "earning" | "spending"
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
  economic_sense_test: {
    Enums: {
      question_type: ["earning", "spending"],
    },
  },
} as const
