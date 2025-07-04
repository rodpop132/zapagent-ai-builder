export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_access_requests: {
        Row: {
          email: string
          id: string
          ip_address: string | null
          processed_at: string | null
          requested_at: string
          status: string
        }
        Insert: {
          email: string
          id?: string
          ip_address?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          processed_at: string | null
          status: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          processed_at?: string | null
          status?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          processed_at?: string | null
          status?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_logins: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          clicked_at: string
          id: string
          ip_address: string | null
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          affiliate_id: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          affiliate_id?: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_conversions: {
        Row: {
          affiliate_id: string
          click_id: string | null
          commission_amount: number | null
          conversion_type: string
          converted_at: string
          id: string
          order_value: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_id: string
          click_id?: string | null
          commission_amount?: number | null
          conversion_type: string
          converted_at?: string
          id?: string
          order_value?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_id?: string
          click_id?: string | null
          commission_amount?: number | null
          conversion_type?: string
          converted_at?: string
          id?: string
          order_value?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_conversions_click_id_fkey"
            columns: ["click_id"]
            isOneToOne: false
            referencedRelation: "affiliate_clicks"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          commission_rate: number | null
          created_at: string
          email: string
          id: string
          instagram_handle: string | null
          name: string
          other_social: string | null
          phone: string | null
          status: string | null
          total_earnings: number | null
          updated_at: string
          user_id: string
          youtube_channel: string | null
        }
        Insert: {
          affiliate_code: string
          commission_rate?: number | null
          created_at?: string
          email: string
          id?: string
          instagram_handle?: string | null
          name: string
          other_social?: string | null
          phone?: string | null
          status?: string | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          youtube_channel?: string | null
        }
        Update: {
          affiliate_code?: string
          commission_rate?: number | null
          created_at?: string
          email?: string
          id?: string
          instagram_handle?: string | null
          name?: string
          other_social?: string | null
          phone?: string | null
          status?: string | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          youtube_channel?: string | null
        }
        Relationships: []
      }
      agent_conversations: {
        Row: {
          agent_id: string | null
          agent_name: string
          bot_response: string
          created_at: string
          id: string
          phone_number: string
          updated_at: string
          user_id: string
          user_message: string
        }
        Insert: {
          agent_id?: string | null
          agent_name: string
          bot_response: string
          created_at?: string
          id?: string
          phone_number: string
          updated_at?: string
          user_id: string
          user_message: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string
          bot_response?: string
          created_at?: string
          id?: string
          phone_number?: string
          updated_at?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      agent_messages: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          numero: string
          pergunta: string | null
          resposta: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          numero: string
          pergunta?: string | null
          resposta?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          numero?: string
          pergunta?: string | null
          resposta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_statistics: {
        Row: {
          agent_name: string
          created_at: string
          id: string
          last_message_at: string | null
          phone_number: string
          total_messages: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_name: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          phone_number: string
          total_messages?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_name?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          phone_number?: string
          total_messages?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          business_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          personality_prompt: string | null
          phone_number: string
          training_data: string | null
          updated_at: string
          user_id: string
          whatsapp_status: string | null
        }
        Insert: {
          business_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          personality_prompt?: string | null
          phone_number: string
          training_data?: string | null
          updated_at?: string
          user_id: string
          whatsapp_status?: string | null
        }
        Update: {
          business_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          personality_prompt?: string | null
          phone_number?: string
          training_data?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_status?: string | null
        }
        Relationships: []
      }
      ai_messages_usage: {
        Row: {
          created_at: string
          id: string
          last_reset_date: string
          messages_generated: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reset_date?: string
          messages_generated?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reset_date?: string
          messages_generated?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          is_unlimited: boolean | null
          messages_limit: number
          messages_used: number
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_unlimited?: boolean | null
          messages_limit?: number
          messages_used?: number
          plan_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_unlimited?: boolean | null
          messages_limit?: number
          messages_used?: number
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          is_staff: boolean | null
          message: string
          ticket_id: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_staff?: boolean | null
          message: string
          ticket_id: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_staff?: boolean | null
          message?: string
          ticket_id?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_type: string
          active: boolean
          admin_note: string | null
          created_at: string
          expires_at: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          action_type: string
          active?: boolean
          admin_note?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          action_type?: string
          active?: boolean
          admin_note?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          email: string
          granted_at: string | null
          granted_by: string | null
          id: string
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string | null
          email: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string | null
          email?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_ai_messages_limit: {
        Args: { plan_type: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_staff: {
        Args: { user_id: string }
        Returns: boolean
      }
      reset_monthly_ai_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_type: "user" | "staff" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_type: ["user", "staff", "admin"],
    },
  },
} as const
