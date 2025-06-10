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
      custom_lists: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          privacy_setting: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          privacy_setting?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          privacy_setting?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      filter_presets: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      list_items: {
        Row: {
          added_at: string
          added_by_user_id: string | null
          id: string
          list_id: string
          media_id: string
          notes: string | null
          position: number
          updated_at: string | null
        }
        Insert: {
          added_at?: string
          added_by_user_id?: string | null
          id?: string
          list_id: string
          media_id: string
          notes?: string | null
          position?: number
          updated_at?: string | null
        }
        Update: {
          added_at?: string
          added_by_user_id?: string | null
          id?: string
          list_id?: string
          media_id?: string
          notes?: string | null
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "custom_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          notes: string | null
          rating: number | null
          start_date: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          rating?: number | null
          start_date?: string | null
          status: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          rating?: number | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_privacy: {
        Row: {
          allow_discovery: boolean | null
          id: number
          show_activity: boolean | null
          show_lists: boolean | null
          show_showcase: boolean | null
          show_social_links: boolean | null
          show_stats: boolean | null
          user_id: string
        }
        Insert: {
          allow_discovery?: boolean | null
          id?: number
          show_activity?: boolean | null
          show_lists?: boolean | null
          show_showcase?: boolean | null
          show_social_links?: boolean | null
          show_stats?: boolean | null
          user_id: string
        }
        Update: {
          allow_discovery?: boolean | null
          id?: number
          show_activity?: boolean | null
          show_lists?: boolean | null
          show_showcase?: boolean | null
          show_social_links?: boolean | null
          show_stats?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      profile_showcase: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          item_id: string
          item_type: string
          sort_order: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          item_id: string
          item_type: string
          sort_order?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          item_id?: string
          item_type?: string
          sort_order?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_social_links: {
        Row: {
          created_at: string
          id: number
          is_visible: boolean | null
          platform: string
          sort_order: number | null
          url: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_visible?: boolean | null
          platform: string
          sort_order?: number | null
          url: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: number
          is_visible?: boolean | null
          platform?: string
          sort_order?: number | null
          url?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          banner_url: string | null
          created_at: string
          custom_theme_settings: Json | null
          full_name: string | null
          id: number
          is_public: boolean | null
          location: string | null
          pronouns: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          website: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          custom_theme_settings?: Json | null
          full_name?: string | null
          id?: number
          is_public?: boolean | null
          location?: string | null
          pronouns?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          website?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          custom_theme_settings?: Json | null
          full_name?: string | null
          id?: number
          is_public?: boolean | null
          location?: string | null
          pronouns?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          website?: string | null
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
    Enums: {},
  },
} as const
