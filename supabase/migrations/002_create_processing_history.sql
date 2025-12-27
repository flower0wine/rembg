-- ====================
-- processing_history 表定义
-- ====================
-- Create enum type for processing status
CREATE TYPE processing_status_enum AS ENUM ('processing', 'completed', 'failed');

-- Create processing_history table
CREATE TABLE IF NOT EXISTS public.processing_history (
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

-- 索引
CREATE INDEX IF NOT EXISTS idx_processing_history_user_id ON public.processing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_history_created_at ON public.processing_history(created_at);
CREATE INDEX IF NOT EXISTS idx_processing_history_user_created ON public.processing_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_history_status ON public.processing_history(processing_status);
CREATE INDEX IF NOT EXISTS idx_processing_history_user_status ON public.processing_history(user_id, processing_status);

-- ====================
-- updated_at 触发器
-- ====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_processing_history_updated_at ON public.processing_history;
CREATE TRIGGER update_processing_history_updated_at
    BEFORE UPDATE ON public.processing_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ====================
-- Row-Level Security
-- ====================
ALTER TABLE public.processing_history
  ENABLE ROW LEVEL SECURITY;

-- Select 自己的记录
CREATE POLICY "Allow users to select own processing history"
  ON public.processing_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert 限制 user_id 必须是 auth.uid()
CREATE POLICY "Allow users to insert own processing history"
  ON public.processing_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ====================
-- Doc Comments 保留
-- ====================
COMMENT ON TABLE public.processing_history IS 'Stores processing history for authenticated users';
COMMENT ON COLUMN public.processing_history.user_id IS 'Reference to the user who processed the image';
COMMENT ON COLUMN public.processing_history.original_image_url IS 'URL to the original image in storage';
COMMENT ON COLUMN public.processing_history.processed_image_url IS 'URL to the processed image in storage';
COMMENT ON COLUMN public.processing_history.original_filename IS 'Original filename of the uploaded image';
COMMENT ON COLUMN public.processing_history.processing_status IS 'Status of the processing (enum): processing, completed, failed';
COMMENT ON COLUMN public.processing_history.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN public.processing_history.processing_time_ms IS 'Processing time in milliseconds';
COMMENT ON COLUMN public.processing_history.updated_at IS 'Timestamp when the record was last updated';
