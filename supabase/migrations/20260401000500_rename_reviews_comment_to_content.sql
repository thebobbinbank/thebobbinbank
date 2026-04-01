-- Rename 'comment' column to 'content' in reviews table to match application code
ALTER TABLE public.reviews RENAME COLUMN comment TO content;
