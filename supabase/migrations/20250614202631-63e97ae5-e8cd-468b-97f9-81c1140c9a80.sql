
-- Create seasons table to track individual seasons
CREATE TABLE public.seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  total_episodes INTEGER NOT NULL DEFAULT 1,
  watched_episodes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not-started',
  rating INTEGER NULL CHECK (rating >= 1 AND rating <= 5),
  start_date TIMESTAMP WITH TIME ZONE NULL,
  completion_date TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  UNIQUE(media_id, season_number)
);

-- Add RLS policies for seasons
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own seasons" 
  ON public.seasons 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own seasons" 
  ON public.seasons 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seasons" 
  ON public.seasons 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seasons" 
  ON public.seasons 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add columns to media_items for overall show tracking
ALTER TABLE public.media_items 
ADD COLUMN total_seasons INTEGER NULL,
ADD COLUMN current_season INTEGER NULL,
ADD COLUMN current_episode INTEGER NULL,
ADD COLUMN overall_progress_percentage DECIMAL(5,2) NULL;
