-- Trigger to auto-create profile on user signup
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

  -- If username is taken, append a random suffix
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE username = unique_username) LOOP
    counter := counter + 1;
    unique_username := base_username || counter;
    IF counter > 1000 THEN
      -- Emergency fallback: use user ID as username
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
    -- If insertion still fails, log it but don't break signup
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
