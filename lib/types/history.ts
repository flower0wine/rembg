/**
 * Processing history related type definitions
 */

export interface ProcessingHistory {
  id: string;
  user_id: string;
  original_image_url: string;
  processed_image_url: string;
  original_filename: string;
  file_size: number;
  created_at: string;
}
