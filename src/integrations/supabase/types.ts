export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["company_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      flow_connections: {
        Row: {
          created_at: string
          flow_id: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_ping: string
          updated_at: string
          url: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          flow_id: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_ping?: string
          updated_at?: string
          url: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          flow_id?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_ping?: string
          updated_at?: string
          url?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_connections_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_emails: {
        Row: {
          created_at: string | null
          email: string
          flow_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          flow_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          flow_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_emails_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_urls: {
        Row: {
          created_at: string | null
          flow_id: string | null
          id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          flow_id?: string | null
          id?: string
          url: string
        }
        Update: {
          created_at?: string | null
          flow_id?: string | null
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_urls_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_visits: {
        Row: {
          created_at: string
          flow_id: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          url: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          flow_id: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          url: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          flow_id?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          url?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      flows: {
        Row: {
          attendant_name: string | null
          avatar_url: string | null
          button_avatar_url: string | null
          button_offset_x: number | null
          button_offset_y: number | null
          button_position: string | null
          button_size: number | null
          chat_height: number | null
          chat_offset_x: number | null
          chat_offset_y: number | null
          chat_position: string | null
          chat_width: number | null
          colors: Json | null
          company_id: string | null
          created_at: string | null
          description: string | null
          final_message: string | null
          final_message_custom: string | null
          id: string
          is_active: boolean | null
          minimum_question: number | null
          name: string
          position: string | null
          show_whatsapp_button: boolean | null
          updated_at: string | null
          welcome_message: string | null
          whatsapp: string | null
          whatsapp_message_template: string | null
        }
        Insert: {
          attendant_name?: string | null
          avatar_url?: string | null
          button_avatar_url?: string | null
          button_offset_x?: number | null
          button_offset_y?: number | null
          button_position?: string | null
          button_size?: number | null
          chat_height?: number | null
          chat_offset_x?: number | null
          chat_offset_y?: number | null
          chat_position?: string | null
          chat_width?: number | null
          colors?: Json | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          final_message?: string | null
          final_message_custom?: string | null
          id?: string
          is_active?: boolean | null
          minimum_question?: number | null
          name: string
          position?: string | null
          show_whatsapp_button?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
          whatsapp?: string | null
          whatsapp_message_template?: string | null
        }
        Update: {
          attendant_name?: string | null
          avatar_url?: string | null
          button_avatar_url?: string | null
          button_offset_x?: number | null
          button_offset_y?: number | null
          button_position?: string | null
          button_size?: number | null
          chat_height?: number | null
          chat_offset_x?: number | null
          chat_offset_y?: number | null
          chat_position?: string | null
          chat_width?: number | null
          colors?: Json | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          final_message?: string | null
          final_message_custom?: string | null
          id?: string
          is_active?: boolean | null
          minimum_question?: number | null
          name?: string
          position?: string | null
          show_whatsapp_button?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
          whatsapp?: string | null
          whatsapp_message_template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company_id: string | null
          completed: boolean | null
          created_at: string | null
          flow_id: string | null
          id: string
          ip_address: unknown | null
          responses: Json
          user_agent: string | null
        }
        Insert: {
          company_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          flow_id?: string | null
          id?: string
          ip_address?: unknown | null
          responses: Json
          user_agent?: string | null
        }
        Update: {
          company_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          flow_id?: string | null
          id?: string
          ip_address?: unknown | null
          responses?: Json
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string | null
          flow_id: string | null
          id: string
          options: Json | null
          order_index: number
          placeholder: string | null
          required: boolean | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          flow_id?: string | null
          id?: string
          options?: Json | null
          order_index: number
          placeholder?: string | null
          required?: boolean | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          flow_id?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          placeholder?: string | null
          required?: boolean | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_avatars: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_avatars_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          message: string
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_profile: {
        Args: {
          user_id: string
          user_email: string
          user_full_name: string
          user_role: string
          user_company_id: string
        }
        Returns: boolean
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_global_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      test_trigger_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          trigger_name: string
          event_manipulation: string
          action_statement: string
        }[]
      }
    }
    Enums: {
      company_status: "active" | "inactive" | "trial"
      user_role: "admin" | "manager" | "user"
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
    Enums: {
      company_status: ["active", "inactive", "trial"],
      user_role: ["admin", "manager", "user"],
    },
  },
} as const
