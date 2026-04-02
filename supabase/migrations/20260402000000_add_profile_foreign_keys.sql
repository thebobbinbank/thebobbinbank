-- Add explicit foreign key constraints from comments and reviews to profiles
-- This allows PostgREST to properly join these tables via the profiles relationship

ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fk
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_fk
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
