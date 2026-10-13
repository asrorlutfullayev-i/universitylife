-- Security Patch: Fix RLS policies to prevent student privilege escalation
-- and unauthorized application / registration states.

-- 1) PROFILES INSERT: Ensure new profile can only be created with role = 'student'
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id AND role = 'student');

-- 2) PROFILES UPDATE: Students can update their profile but can never change their role to 'admin'
DROP POLICY IF EXISTS "Users can update their own profile or admin can update" ON public.profiles;
CREATE POLICY "Users can update their own profile or admin can update"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (public.is_admin() OR (auth.uid() = id AND role = 'student'));

-- 3) APPLICATIONS INSERT: Student cannot create an already-approved application
DROP POLICY IF EXISTS "Users submit their own applications" ON public.applications;
CREATE POLICY "Users submit their own applications"
ON public.applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 4) EVENT_REGISTRATIONS INSERT: Student cannot register as already checked in
DROP POLICY IF EXISTS "Users register for events" ON public.event_registrations;
CREATE POLICY "Users register for events"
ON public.event_registrations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND is_checked_in = false);

-- 5) POINTS_LOG UNIQUE CONSTRAINT: Prevent duplicate points for the same user and event
ALTER TABLE public.points_log DROP CONSTRAINT IF EXISTS points_log_user_event_unique;
ALTER TABLE public.points_log ADD CONSTRAINT points_log_user_event_unique UNIQUE (user_id, event_id);

-- 6) CHECK_IN FUNCTION: Add SET search_path = public and FOR UPDATE row locking
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

  -- Find registration with row-level lock (FOR UPDATE prevents simultaneous scan race condition)
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
