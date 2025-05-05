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
      api_usage: {
        Row: {
          completion_tokens: number
          endpoint: string
          estimated_cost_usd: number
          id: string
          model: string
          prompt_tokens: number
          timestamp: string
          total_tokens: number
          user_id: string | null
        }
        Insert: {
          completion_tokens?: number
          endpoint: string
          estimated_cost_usd?: number
          id?: string
          model: string
          prompt_tokens?: number
          timestamp?: string
          total_tokens?: number
          user_id?: string | null
        }
        Update: {
          completion_tokens?: number
          endpoint?: string
          estimated_cost_usd?: number
          id?: string
          model?: string
          prompt_tokens?: number
          timestamp?: string
          total_tokens?: number
          user_id?: string | null
        }
        Relationships: []
      }
      bible_assistants: {
        Row: {
          active: boolean
          assistant_id: string
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          assistant_id: string
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          assistant_id?: string
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bible_books: {
        Row: {
          book_category: Database["public"]["Enums"]["book_category"]
          category_id: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          book_category: Database["public"]["Enums"]["book_category"]
          category_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          book_category?: Database["public"]["Enums"]["book_category"]
          category_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "bible_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bible_favorites: {
        Row: {
          book_id: number
          book_name: string | null
          book_slug: string | null
          chapter: number
          created_at: string
          id: string
          text: string | null
          user_id: string
          verse: number
        }
        Insert: {
          book_id: number
          book_name?: string | null
          book_slug?: string | null
          chapter: number
          created_at?: string
          id?: string
          text?: string | null
          user_id: string
          verse: number
        }
        Update: {
          book_id?: number
          book_name?: string | null
          book_slug?: string | null
          chapter?: number
          created_at?: string
          id?: string
          text?: string | null
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
      bible_prompts: {
        Row: {
          book_slug: string
          created_at: string | null
          id: string
          prompt_text: string
          updated_at: string | null
        }
        Insert: {
          book_slug: string
          created_at?: string | null
          id?: string
          prompt_text: string
          updated_at?: string | null
        }
        Update: {
          book_slug?: string
          created_at?: string | null
          id?: string
          prompt_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bible_suggestions: {
        Row: {
          book_slug: string
          created_at: string | null
          display_order: number
          icon: string | null
          id: string
          label: string
          prompt_override: string | null
          updated_at: string | null
          user_message: string
        }
        Insert: {
          book_slug: string
          created_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          label: string
          prompt_override?: string | null
          updated_at?: string | null
          user_message: string
        }
        Update: {
          book_slug?: string
          created_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          label?: string
          prompt_override?: string | null
          updated_at?: string | null
          user_message?: string
        }
        Relationships: []
      }
      biblia_buttons: {
        Row: {
          button_icon: string | null
          button_name: string | null
          created_at: string
          id: number
          order_buttons: number | null
          prompt_ai: string | null
          slug: string | null
        }
        Insert: {
          button_icon?: string | null
          button_name?: string | null
          created_at?: string
          id?: number
          order_buttons?: number | null
          prompt_ai?: string | null
          slug?: string | null
        }
        Update: {
          button_icon?: string | null
          button_name?: string | null
          created_at?: string
          id?: number
          order_buttons?: number | null
          prompt_ai?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          book_slug: string | null
          created_at: string
          id: string
          is_accessible: boolean | null
          is_deleted: boolean | null
          last_accessed: string
          last_message: string | null
          messages: Json | null
          pinned: boolean | null
          slug: string
          subscription_required: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          book_slug?: string | null
          created_at?: string
          id?: string
          is_accessible?: boolean | null
          is_deleted?: boolean | null
          last_accessed?: string
          last_message?: string | null
          messages?: Json | null
          pinned?: boolean | null
          slug?: string
          subscription_required?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          book_slug?: string | null
          created_at?: string
          id?: string
          is_accessible?: boolean | null
          is_deleted?: boolean | null
          last_accessed?: string
          last_message?: string | null
          messages?: Json | null
          pinned?: boolean | null
          slug?: string
          subscription_required?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "bible_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lexicon_queries: {
        Row: {
          created_at: string
          id: string
          response: Json
          user_id: string
          word: string
        }
        Insert: {
          created_at?: string
          id?: string
          response: Json
          user_id: string
          word: string
        }
        Update: {
          created_at?: string
          id?: string
          response?: Json
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      message_counts: {
        Row: {
          count: number
          created_at: string
          id: string
          last_reset_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          last_reset_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          last_reset_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      popular_questions: {
        Row: {
          created_at: string
          id: string
          is_predefined: boolean
          question: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_predefined?: boolean
          question: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_predefined?: boolean
          question?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          image_url: string | null
          page_id: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          page_id?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          page_id?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "bible_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "custom_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          terms_accepted: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          terms_accepted?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          terms_accepted?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          message_limit: number
          name: string
          price_amount: number
          price_currency: string
          stripe_price_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          message_limit: number
          name: string
          price_amount: number
          price_currency?: string
          stripe_price_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          message_limit?: number
          name?: string
          price_amount?: number
          price_currency?: string
          stripe_price_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          end_date: string | null
          id: string
          plan_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          plan_id: string
          start_date: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_stats: {
        Row: {
          created_at: string
          date: string
          id: string
          total_messages: number
          unique_users: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_messages?: number
          unique_users?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_messages?: number
          unique_users?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age_range: string | null
          avatar_url: string | null
          baptized: boolean | null
          christian_time: string | null
          church_participation: string | null
          created_at: string | null
          denomination: string | null
          display_name: string | null
          goals: string[] | null
          id: string
          leadership_role: string | null
          ministry_service: string[] | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          preferred_language: string | null
          updated_at: string | null
          wants_plan: string | null
        }
        Insert: {
          age_range?: string | null
          avatar_url?: string | null
          baptized?: boolean | null
          christian_time?: string | null
          church_participation?: string | null
          created_at?: string | null
          denomination?: string | null
          display_name?: string | null
          goals?: string[] | null
          id: string
          leadership_role?: string | null
          ministry_service?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_language?: string | null
          updated_at?: string | null
          wants_plan?: string | null
        }
        Update: {
          age_range?: string | null
          avatar_url?: string | null
          baptized?: boolean | null
          christian_time?: string | null
          church_participation?: string | null
          created_at?: string | null
          denomination?: string | null
          display_name?: string | null
          goals?: string[] | null
          id?: string
          leadership_role?: string | null
          ministry_service?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_language?: string | null
          updated_at?: string | null
          wants_plan?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verses: {
        Row: {
          abbrev: string | null
          book_id: number | null
          book_name: string | null
          book_slug: string | null
          chapter: number | null
          id: number
          text_acf: string | null
          text_ara: string | null
          text_arc: string | null
          text_naa: string | null
          text_ntlh: string | null
          text_nvi: string | null
          text_nvt: string | null
          verse: number | null
        }
        Insert: {
          abbrev?: string | null
          book_id?: number | null
          book_name?: string | null
          book_slug?: string | null
          chapter?: number | null
          id: number
          text_acf?: string | null
          text_ara?: string | null
          text_arc?: string | null
          text_naa?: string | null
          text_ntlh?: string | null
          text_nvi?: string | null
          text_nvt?: string | null
          verse?: number | null
        }
        Update: {
          abbrev?: string | null
          book_id?: number | null
          book_name?: string | null
          book_slug?: string | null
          chapter?: number | null
          id?: number
          text_acf?: string | null
          text_ara?: string | null
          text_arc?: string | null
          text_naa?: string | null
          text_ntlh?: string | null
          text_nvi?: string | null
          text_nvt?: string | null
          verse?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      books_mv: {
        Row: {
          abbrev: string | null
          chapter_count: number | null
          id: number | null
          name: string | null
          slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_chat_history_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      increment_message_count: {
        Args: { uid: string }
        Returns: undefined
      }
      map_country_to_language: {
        Args: { country_code: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      book_category:
        | "pentateuco"
        | "historico"
        | "poetico"
        | "profetico"
        | "novo_testamento"
        | "cartas_paulinas"
        | "cartas_gerais"
        | "apocalipse"
        | "temas"
        | "teologia"
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
      app_role: ["admin", "moderator", "user"],
      book_category: [
        "pentateuco",
        "historico",
        "poetico",
        "profetico",
        "novo_testamento",
        "cartas_paulinas",
        "cartas_gerais",
        "apocalipse",
        "temas",
        "teologia",
      ],
    },
  },
} as const
