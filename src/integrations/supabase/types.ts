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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      email_campaigns: {
        Row: {
          audience_type: string
          batches_total: number
          brevo_campaign_id: string | null
          click_count: number
          created_at: string
          created_by: string | null
          error_summary: string | null
          html_content: string
          id: string
          image_url: string | null
          include_image: boolean
          include_video: boolean
          last_sent_at: string | null
          media_preview: Json
          name: string
          open_count: number
          plain_text: string
          preheader: string
          provider: string
          scheduled_at: string | null
          source_prompt: string
          status: string
          subject: string
          updated_at: string
          updated_by: string | null
          video_url: string | null
        }
        Insert: {
          audience_type?: string
          batches_total?: number
          brevo_campaign_id?: string | null
          click_count?: number
          created_at?: string
          created_by?: string | null
          error_summary?: string | null
          html_content?: string
          id?: string
          image_url?: string | null
          include_image?: boolean
          include_video?: boolean
          last_sent_at?: string | null
          media_preview?: Json
          name: string
          open_count?: number
          plain_text?: string
          preheader?: string
          provider?: string
          scheduled_at?: string | null
          source_prompt?: string
          status?: string
          subject: string
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
        }
        Update: {
          audience_type?: string
          batches_total?: number
          brevo_campaign_id?: string | null
          click_count?: number
          created_at?: string
          created_by?: string | null
          error_summary?: string | null
          html_content?: string
          id?: string
          image_url?: string | null
          include_image?: boolean
          include_video?: boolean
          last_sent_at?: string | null
          media_preview?: Json
          name?: string
          open_count?: number
          plain_text?: string
          preheader?: string
          provider?: string
          scheduled_at?: string | null
          source_prompt?: string
          status?: string
          subject?: string
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      newsletter_sends: {
        Row: {
          audience_type: string | null
          batches_completed: number
          batches_total: number
          campaign_id: string | null
          click_count: number
          completed_at: string | null
          created_at: string
          error_summary: string | null
          failed_recipients: Json | null
          html_content: string | null
          html_preview: string | null
          id: string
          media_preview: Json
          open_count: number
          preheader: string
          provider: string
          scheduled_at: string | null
          sent_by: string | null
          started_at: string | null
          status: string
          subject: string
          total_failed: number
          total_recipients: number
          total_sent: number
        }
        Insert: {
          audience_type?: string | null
          batches_completed?: number
          batches_total?: number
          campaign_id?: string | null
          click_count?: number
          completed_at?: string | null
          created_at?: string
          error_summary?: string | null
          failed_recipients?: Json | null
          html_content?: string | null
          html_preview?: string | null
          id?: string
          media_preview?: Json
          open_count?: number
          preheader?: string
          provider?: string
          scheduled_at?: string | null
          sent_by?: string | null
          started_at?: string | null
          status?: string
          subject: string
          total_failed?: number
          total_recipients?: number
          total_sent?: number
        }
        Update: {
          audience_type?: string | null
          batches_completed?: number
          batches_total?: number
          campaign_id?: string | null
          click_count?: number
          completed_at?: string | null
          created_at?: string
          error_summary?: string | null
          failed_recipients?: Json | null
          html_content?: string | null
          html_preview?: string | null
          id?: string
          media_preview?: Json
          open_count?: number
          preheader?: string
          provider?: string
          scheduled_at?: string | null
          sent_by?: string | null
          started_at?: string | null
          status?: string
          subject?: string
          total_failed?: number
          total_recipients?: number
          total_sent?: number
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          category: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          source: string
          subscribed_at: string
          tag: string
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          category?: string
          email: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          source?: string
          subscribed_at?: string
          tag?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          category?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          source?: string
          subscribed_at?: string
          tag?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_comments: {
        Row: {
          author_id: string | null
          author_name: string | null
          comment: string
          created_at: string
          id: string
          order_id: number
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          comment: string
          created_at?: string
          id?: string
          order_id: number
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          comment?: string
          created_at?: string
          id?: string
          order_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_comments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_history: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          order_id: number
          performed_by: string | null
          performer_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          order_id: number
          performed_by?: string | null
          performer_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          order_id?: number
          performed_by?: string | null
          performer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          id: number
          is_paid: boolean
          items: Json
          manager_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          ticket_number: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone?: string
          id?: number
          is_paid?: boolean
          items?: Json
          manager_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          ticket_number?: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: number
          is_paid?: boolean
          items?: Json
          manager_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          ticket_number?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          domain: string | null
          id: string
          latitude: number | null
          longitude: number | null
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_counters: {
        Row: {
          id: string
          total_visitors: number
          updated_at: string
          week_started_at: string
          weekly_visitors: number
        }
        Insert: {
          id: string
          total_visitors?: number
          updated_at?: string
          week_started_at?: string
          weekly_visitors?: number
        }
        Update: {
          id?: string
          total_visitors?: number
          updated_at?: string
          week_started_at?: string
          weekly_visitors?: number
        }
        Relationships: []
      }
      waitlist_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          desired_area_hectares: number | null
          email: string
          full_name: string
          id: string
          land_area_hectares: number | null
          land_status: string
          message: string | null
          phone: string | null
          residence: string | null
          source_page: string | null
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          desired_area_hectares?: number | null
          email: string
          full_name: string
          id?: string
          land_area_hectares?: number | null
          land_status?: string
          message?: string | null
          phone?: string | null
          residence?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          desired_area_hectares?: number | null
          email?: string
          full_name?: string
          id?: string
          land_area_hectares?: number | null
          land_status?: string
          message?: string | null
          phone?: string | null
          residence?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_orders_by_phone: {
        Args: { _phone: string }
        Returns: {
          created_at: string
          customer_name: string
          customer_phone: string
          id: number
          is_paid: boolean
          items: Json
          manager_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          ticket_number: string
          total: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_visitor_count: { Args: never; Returns: number }
      get_public_visitor_stats: {
        Args: never
        Returns: {
          total_visitors: number
          weekly_visitors: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager"
      order_status: "pending" | "ready" | "collected"
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
      app_role: ["admin", "manager"],
      order_status: ["pending", "ready", "collected"],
    },
  },
} as const
