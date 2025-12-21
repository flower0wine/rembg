-- Create processing_history table for storing user's image processing records
CREATE TABLE IF NOT EXISTS processing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  processed_image_url TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_processing_history_user_id ON processing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_history_created_at ON processing_history(created_at);
CREATE INDEX IF NOT EXISTS idx_processing_history_user_created ON processing_history(user_id, created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE processing_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own processing history
CREATE POLICY "Users can view own processing history"
  ON processing_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own processing history
CREATE POLICY "Users can insert own processing history"
  ON processing_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own processing history
CREATE POLICY "Users can delete own processing history"
  ON processing_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE processing_history IS 'Stores processing history for authenticated users';
COMMENT ON COLUMN processing_history.user_id IS 'Reference to the user who processed the image';
COMMENT ON COLUMN processing_history.original_image_url IS 'URL to the original image in storage';
COMMENT ON COLUMN processing_history.processed_image_url IS 'URL to the processed image in storage';
COMMENT ON COLUMN processing_history.original_filename IS 'Original filename of the uploaded image';
COMMENT ON COLUMN processing_history.file_size IS 'File size in bytes';
