-- Create enum type for processing status
CREATE TYPE processing_status_enum AS ENUM ('processing', 'completed', 'failed');

-- Create processing_history table for storing user's image processing records
CREATE TABLE IF NOT EXISTS processing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT,
  processed_image_url TEXT,
  original_filename TEXT NOT NULL,
  processing_status processing_status_enum NOT NULL DEFAULT 'failed',
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_processing_history_user_id ON processing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_history_created_at ON processing_history(created_at);
CREATE INDEX IF NOT EXISTS idx_processing_history_user_created ON processing_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_history_status ON processing_history(processing_status);
CREATE INDEX IF NOT EXISTS idx_processing_history_user_status ON processing_history(user_id, processing_status);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_processing_history_updated_at
    BEFORE UPDATE ON processing_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Policy: Users can update their own processing history
CREATE POLICY "Users can update own processing history"
  ON processing_history
  FOR UPDATE
  USING (auth.uid() = user_id)
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
COMMENT ON COLUMN processing_history.processing_status IS 'Status of the processing (enum): processing, completed, failed';
COMMENT ON COLUMN processing_history.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN processing_history.processing_time_ms IS 'Processing time in milliseconds';
COMMENT ON COLUMN processing_history.updated_at IS 'Timestamp when the record was last updated';
