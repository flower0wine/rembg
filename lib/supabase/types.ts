export interface Database {
  public: {
    Tables: {
      usage_records: {
        Row: {
          id: string;
          user_id: string | null;
          fingerprint: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          fingerprint?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          fingerprint?: string | null;
          created_at?: string;
        };
      };
      processing_history: {
        Row: {
          id: string;
          user_id: string;
          original_image_url: string;
          processed_image_url: string;
          original_filename: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_image_url: string;
          processed_image_url: string;
          original_filename: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_image_url?: string;
          processed_image_url?: string;
          original_filename?: string;
          file_size?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type UsageRecord = Database["public"]["Tables"]["usage_records"]["Row"];
export type ProcessingHistory = Database["public"]["Tables"]["processing_history"]["Row"];
export type UsageRecordInsert = Database["public"]["Tables"]["usage_records"]["Insert"];
export type ProcessingHistoryInsert = Database["public"]["Tables"]["processing_history"]["Insert"];
