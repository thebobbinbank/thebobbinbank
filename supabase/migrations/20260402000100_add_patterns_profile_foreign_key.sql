-- Add explicit foreign key from patterns.user_id to profiles.id
-- This allows PostgREST to properly join patterns with profiles via the profiles relationship
ALTER TABLE public.patterns
ADD CONSTRAINT patterns_user_id_fk
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
