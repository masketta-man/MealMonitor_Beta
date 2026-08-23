-- Create bookmark collections table
CREATE TABLE IF NOT EXISTS public.bookmark_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'bookmark',
  color TEXT DEFAULT '#22c55e',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user bookmarks table
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.bookmark_collections(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, recipe_id, collection_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookmark_collections_user_id ON public.bookmark_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_recipe_id ON public.user_bookmarks(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_collection_id ON public.user_bookmarks(collection_id);

-- Enable RLS
ALTER TABLE public.bookmark_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookmark_collections
CREATE POLICY "Users can view their own collections"
  ON public.bookmark_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections"
  ON public.bookmark_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.bookmark_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.bookmark_collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.user_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.user_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.user_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Create default "Saved" collection for existing users
INSERT INTO public.bookmark_collections (user_id, name, description, icon, color)
SELECT DISTINCT u.id, 'Saved Recipes', 'My bookmarked recipes', 'bookmark', '#22c55e'
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.bookmark_collections bc WHERE bc.user_id = u.id
);
