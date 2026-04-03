-- Fix profile trigger to handle username uniqueness constraint
-- The previous version failed if a generated username already existed
-- This version generates unique usernames by appending numbers if needed

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  unique_username TEXT;
  counter INT := 0;
BEGIN
  -- Generate base username from email or metadata
  base_username := COALESCE(new.raw_user_meta_data ->> 'username', SPLIT_PART(new.email, '@', 1));
  unique_username := base_username;

  -- If username is taken, append a number suffix
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE username = unique_username) LOOP
    counter := counter + 1;
    unique_username := base_username || counter;
    IF counter > 1000 THEN
      -- Emergency fallback: use user ID as username (guaranteed unique)
      unique_username := new.id::TEXT;
      EXIT;
    END IF;
  END LOOP;

  BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
      new.id,
      unique_username,
      COALESCE(new.raw_user_meta_data ->> 'display_name', SPLIT_PART(new.email, '@', 1))
    );
  EXCEPTION WHEN OTHERS THEN
    -- If insertion fails, log the error but don't break signup
    -- User can complete signup and set username/profile later if needed
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$;
