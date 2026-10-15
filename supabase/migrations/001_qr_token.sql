-- Migration: QR Token support for UniverLife
-- Run this in the Supabase SQL editor or via the Supabase CLI.

-- 1. Add qr_token column to profiles (safe to re-run)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qr_token text;

-- 2. Generate random tokens for any existing users who don't have one yet
UPDATE profiles
SET qr_token = encode(gen_random_bytes(16), 'hex')
WHERE qr_token IS NULL;

-- 3. Auto-assign a token on new profile creation via trigger
CREATE OR REPLACE FUNCTION assign_qr_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.qr_token IS NULL THEN
    NEW.qr_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_qr_token ON profiles;
CREATE TRIGGER trg_assign_qr_token
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_qr_token();

-- 4. RPC: return the current user's personal QR token
CREATE OR REPLACE FUNCTION my_qr_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT qr_token FROM profiles WHERE id = auth.uid();
$$;
