
-- First, drop all existing policies that depend on privacy_setting
DROP POLICY IF EXISTS "Users can view their own lists and public lists" ON custom_lists;
DROP POLICY IF EXISTS "Users can view list items for their lists or public lists" ON list_items;
DROP POLICY IF EXISTS "Users can view their own lists" ON custom_lists;
DROP POLICY IF EXISTS "Users can insert their own lists" ON custom_lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON custom_lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON custom_lists;

-- Now safely remove the privacy_setting column
ALTER TABLE custom_lists DROP COLUMN IF EXISTS privacy_setting;

-- Add the new is_public column
ALTER TABLE custom_lists ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Ensure description and image_url columns exist
ALTER TABLE custom_lists ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE custom_lists ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing records to set default privacy
UPDATE custom_lists SET is_public = FALSE WHERE is_public IS NULL;

-- Create new RLS policies for custom_lists
CREATE POLICY "Users can view own lists" ON custom_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public lists" ON custom_lists
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own lists" ON custom_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON custom_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON custom_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Recreate the list_items policy with the new structure
CREATE POLICY "Users can view list items for their lists or public lists" ON list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_lists 
      WHERE custom_lists.id = list_items.list_id 
      AND (custom_lists.user_id = auth.uid() OR custom_lists.is_public = true)
    )
  );
