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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string
          id: string
          publish_at: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          publish_at?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          publish_at?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          approved: boolean
          body: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          approved?: boolean
          body: string
          created_at?: string
          id?: string
          name?: string
        }
        Update: {
          approved?: boolean
          body?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          address: string | null
          email: string
          facebook: string | null
          id: number
          instagram: string | null
          updated_at: string
          whatsapp_numbers: string[]
          youtube: string
        }
        Insert: {
          address?: string | null
          email?: string
          facebook?: string | null
          id?: number
          instagram?: string | null
          updated_at?: string
          whatsapp_numbers?: string[]
          youtube?: string
        }
        Update: {
          address?: string | null
          email?: string
          facebook?: string | null
          id?: number
          instagram?: string | null
          updated_at?: string
          whatsapp_numbers?: string[]
          youtube?: string
        }
        Relationships: []
      }
      devotionals: {
        Row: {
          application: string
          cover_url: string | null
          created_at: string
          id: string
          memory_verse: string
          message: string
          prayer: string
          publish_at: string
          published: boolean
          theme: string
          title: string
          updated_at: string
          verse: string
        }
        Insert: {
          application?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          memory_verse?: string
          message?: string
          prayer?: string
          publish_at?: string
          published?: boolean
          theme?: string
          title: string
          updated_at?: string
          verse?: string
        }
        Update: {
          application?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          memory_verse?: string
          message?: string
          prayer?: string
          publish_at?: string
          published?: boolean
          theme?: string
          title?: string
          updated_at?: string
          verse?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          link: string | null
          location: string
          published: boolean
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          link?: string | null
          location?: string
          published?: boolean
          starts_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          link?: string | null
          location?: string
          published?: boolean
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_live: boolean
          starts_at: string
          title: string
          updated_at: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_live?: boolean
          starts_at?: string
          title: string
          updated_at?: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_live?: boolean
          starts_at?: string
          title?: string
          updated_at?: string
          youtube_id?: string | null
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          kind: string
          name: string
          request: string
          status: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          kind?: string
          name?: string
          request: string
          status?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          kind?: string
          name?: string
          request?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teachings: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          id: string
          kind: string
          media_url: string | null
          publish_at: string
          published: boolean
          series: string | null
          speaker: string
          thumbnail_url: string | null
          title: string
          topic: string
          updated_at: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          kind?: string
          media_url?: string | null
          publish_at?: string
          published?: boolean
          series?: string | null
          speaker?: string
          thumbnail_url?: string | null
          title: string
          topic?: string
          updated_at?: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          kind?: string
          media_url?: string | null
          publish_at?: string
          published?: boolean
          series?: string | null
          speaker?: string
          thumbnail_url?: string | null
          title?: string
          topic?: string
          updated_at?: string
          youtube_id?: string | null
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          message: string
          name: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          message: string
          name?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
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
