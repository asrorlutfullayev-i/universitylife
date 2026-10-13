-- Supabase Schema for UniverLife Prototype
-- Architecture & tables as defined in PROJECT_SPEC.md

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  hemis_login TEXT UNIQUE NOT NULL,
  university TEXT NOT NULL,
  faculty TEXT NOT NULL,
  group_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. OPPORTUNITIES TABLE (scholarship | international)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('scholarship', 'international')),
  deadline TIMESTAMPTZ NOT NULL,
  requirements TEXT,
  contact TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Umumiy',
  location TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. GROUPS TABLE (sport | science)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sport', 'science')),
  schedule TEXT,
  leader_name TEXT,
  contact TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. NEWS TABLE
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

-- 7. EVENT_REGISTRATIONS TABLE (with qr_token)
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  qr_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

-- 8. GROUP_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, group_id)
);

-- 9. POINTS_LOG TABLE
CREATE TABLE IF NOT EXISTS public.points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT points_log_user_event_unique UNIQUE (user_id, event_id)
);

-- 10. LEADERBOARD VIEW
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id AS user_id,
  p.full_name,
  p.university,
  p.faculty,
  p.group_name,
  COALESCE(SUM(pl.points), 0)::INTEGER AS total_points,
  DENSE_RANK() OVER (ORDER BY COALESCE(SUM(pl.points), 0) DESC) AS rank
FROM public.profiles p
LEFT JOIN public.points_log pl ON p.id = pl.user_id
GROUP BY p.id, p.full_name, p.university, p.faculty, p.group_name;

-- 11. CHECK_IN FUNCTION (points awarded ONLY via check_in RPC)
CREATE OR REPLACE FUNCTION public.check_in(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registration RECORD;
  v_event RECORD;
  v_caller_role TEXT;
  v_awarded_points INTEGER;
BEGIN
  -- Verify caller is admin
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Faqat adminlar check-in qila oladi');
  END IF;

  -- Find registration with row-level lock
  SELECT * INTO v_registration 
  FROM public.event_registrations 
  WHERE qr_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'QR kod yoki token topilmadi');
  END IF;

  IF v_registration.is_checked_in THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu talaba allaqachon ro''yxatdan o''tgan (check-in qilingan)');
  END IF;

  -- Get event points
  SELECT * INTO v_event FROM public.events WHERE id = v_registration.event_id;
  v_awarded_points := COALESCE(v_event.points, 10);

  -- Update registration
  UPDATE public.event_registrations
  SET is_checked_in = true, checked_in_at = now()
  WHERE id = v_registration.id;

  -- Insert into points_log
  INSERT INTO public.points_log (user_id, event_id, points, reason)
  VALUES (
    v_registration.user_id, 
    v_registration.event_id, 
    v_awarded_points, 
    'Tadbir ishtiroki: ' || COALESCE(v_event.title, 'Tadbir')
  );

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Muvaffaqiyatli check-in qilindi!', 
    'points', v_awarded_points,
    'user_id', v_registration.user_id,
    'event_title', v_event.title
  );
END;
$$;

-- 12. RLS SETUP
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id AND role = 'student');

DROP POLICY IF EXISTS "Users can update their own profile or admin can update" ON public.profiles;
CREATE POLICY "Users can update their own profile or admin can update"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (public.is_admin() OR (auth.uid() = id AND role = 'student'));

-- OPPORTUNITIES POLICIES
DROP POLICY IF EXISTS "Published opportunities visible to authenticated" ON public.opportunities;
CREATE POLICY "Published opportunities visible to authenticated"
ON public.opportunities FOR SELECT TO authenticated
USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manages opportunities" ON public.opportunities;
CREATE POLICY "Admin manages opportunities"
ON public.opportunities FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- EVENTS POLICIES
DROP POLICY IF EXISTS "Published events visible to authenticated" ON public.events;
CREATE POLICY "Published events visible to authenticated"
ON public.events FOR SELECT TO authenticated
USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manages events" ON public.events;
CREATE POLICY "Admin manages events"
ON public.events FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- GROUPS POLICIES
DROP POLICY IF EXISTS "Published groups visible to authenticated" ON public.groups;
CREATE POLICY "Published groups visible to authenticated"
ON public.groups FOR SELECT TO authenticated
USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manages groups" ON public.groups;
CREATE POLICY "Admin manages groups"
ON public.groups FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- NEWS POLICIES
DROP POLICY IF EXISTS "Published news visible to authenticated" ON public.news;
CREATE POLICY "Published news visible to authenticated"
ON public.news FOR SELECT TO authenticated
USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manages news" ON public.news;
CREATE POLICY "Admin manages news"
ON public.news FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- APPLICATIONS POLICIES
DROP POLICY IF EXISTS "Users view own applications or admin views all" ON public.applications;
CREATE POLICY "Users view own applications or admin views all"
ON public.applications FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users submit their own applications" ON public.applications;
CREATE POLICY "Users submit their own applications"
ON public.applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
CREATE POLICY "Admins can update applications"
ON public.applications FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- EVENT REGISTRATIONS POLICIES
DROP POLICY IF EXISTS "Users view own registrations or admin views all" ON public.event_registrations;
CREATE POLICY "Users view own registrations or admin views all"
ON public.event_registrations FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users register for events" ON public.event_registrations;
CREATE POLICY "Users register for events"
ON public.event_registrations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND is_checked_in = false);

DROP POLICY IF EXISTS "Users cancel unverified registrations" ON public.event_registrations;
CREATE POLICY "Users cancel unverified registrations"
ON public.event_registrations FOR DELETE TO authenticated
USING (auth.uid() = user_id AND is_checked_in = false);

-- GROUP MEMBERS POLICIES
DROP POLICY IF EXISTS "Authenticated users view group members" ON public.group_members;
CREATE POLICY "Authenticated users view group members"
ON public.group_members FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users join groups" ON public.group_members;
CREATE POLICY "Users join groups"
ON public.group_members FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users leave groups" ON public.group_members;
CREATE POLICY "Users leave groups"
ON public.group_members FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- POINTS LOG POLICIES
DROP POLICY IF EXISTS "Authenticated users view points" ON public.points_log;
CREATE POLICY "Authenticated users view points"
ON public.points_log FOR SELECT TO authenticated
USING (true);
-- Direct insert/update/delete on points_log is disabled for all users (only RPC check_in can insert)
