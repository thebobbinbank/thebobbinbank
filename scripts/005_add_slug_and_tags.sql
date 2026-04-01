-- Add slug and tags columns to patterns table
ALTER TABLE public.patterns
ADD COLUMN slug TEXT UNIQUE,
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS patterns_slug_idx ON public.patterns(slug);
