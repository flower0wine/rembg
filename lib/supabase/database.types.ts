export type Json
  = | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      processing_history: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          original_filename: string;
          original_image_url: string | null;
          processed_image_url: string | null;
          processing_status: Database["public"]["Enums"]["processing_status_enum"];
          processing_time_ms: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          original_filename: string;
          original_image_url?: string | null;
          processed_image_url?: string | null;
          processing_status?: Database["public"]["Enums"]["processing_status_enum"];
          processing_time_ms?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          original_filename?: string;
          original_image_url?: string | null;
          processed_image_url?: string | null;
          processing_status?: Database["public"]["Enums"]["processing_status_enum"];
          processing_time_ms?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      subscription_plans_config: {
        Row: {
          created_at: string;
          currency: string;
          description: string | null;
          display_name: string;
          display_order: number;
          features_json: Json | null;
          has_advanced_analytics: boolean;
          has_priority_support: boolean;
          id: string;
          is_featured: boolean;
          is_visible: boolean;
          max_concurrent: number;
          max_file_size_kb: number;
          max_usage_limit: number;
          metadata: Json | null;
          plan: Database["public"]["Enums"]["subscription_plan"];
          price_monthly: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          display_name: string;
          display_order?: number;
          features_json?: Json | null;
          has_advanced_analytics?: boolean;
          has_priority_support?: boolean;
          id?: string;
          is_featured?: boolean;
          is_visible?: boolean;
          max_concurrent: number;
          max_file_size_kb: number;
          max_usage_limit: number;
          metadata?: Json | null;
          plan: Database["public"]["Enums"]["subscription_plan"];
          price_monthly?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          display_name?: string;
          display_order?: number;
          features_json?: Json | null;
          has_advanced_analytics?: boolean;
          has_priority_support?: boolean;
          id?: string;
          is_featured?: boolean;
          is_visible?: boolean;
          max_concurrent?: number;
          max_file_size_kb?: number;
          max_usage_limit?: number;
          metadata?: Json | null;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          price_monthly?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      usage_reservations: {
        Row: {
          confirmed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          metadata: Json | null;
          released_at: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          confirmed_at?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          metadata?: Json | null;
          released_at?: string | null;
          status: string;
          user_id: string;
        };
        Update: {
          confirmed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          metadata?: Json | null;
          released_at?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          created_at: string;
          has_advanced_analytics: boolean;
          has_priority_support: boolean;
          id: string;
          is_active: boolean;
          max_concurrent: number;
          max_file_size_kb: number;
          max_usage_limit: number;
          plan: Database["public"]["Enums"]["subscription_plan"];
          subscription_end_date: string;
          subscription_start_date: string;
          updated_at: string;
          usage_count: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          has_advanced_analytics?: boolean;
          has_priority_support?: boolean;
          id?: string;
          is_active?: boolean;
          max_concurrent?: number;
          max_file_size_kb?: number;
          max_usage_limit: number;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          subscription_end_date: string;
          subscription_start_date?: string;
          updated_at?: string;
          usage_count?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          has_advanced_analytics?: boolean;
          has_priority_support?: boolean;
          id?: string;
          is_active?: boolean;
          max_concurrent?: number;
          max_file_size_kb?: number;
          max_usage_limit?: number;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          subscription_end_date?: string;
          subscription_start_date?: string;
          updated_at?: string;
          usage_count?: number;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      cleanup_expired_reservations: {
        Args: never;
        Returns: {
          cleaned_count: number;
        }[];
      };
      confirm_usage_reservation: {
        Args: { p_reservation_id: string; p_user_id: string };
        Returns: {
          new_usage_count: number;
          success: boolean;
        }[];
      };
      release_usage_reservation: {
        Args: { p_reservation_id: string; p_user_id: string };
        Returns: {
          success: boolean;
        }[];
      };
      reserve_usage_quota: {
        Args: { p_timeout_seconds?: number; p_user_id: string };
        Returns: {
          current_usage: number;
          max_limit: number;
          plan: Database["public"]["Enums"]["subscription_plan"];
          reservation_id: string;
        }[];
      };
    };
    Enums: {
      processing_status_enum: "processing" | "completed" | "failed";
      subscription_plan: "free" | "starter" | "pro";
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
      ? R
      : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"]
    & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"]
      & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
        ? R
        : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      processing_status_enum: ["processing", "completed", "failed"],
      subscription_plan: ["free", "starter", "pro"],
    },
  },
} as const;
