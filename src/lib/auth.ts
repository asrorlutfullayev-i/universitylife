import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const DEMO_DOMAIN = "@univerlife.demo";

export function hemisToEmail(hemisLogin: string): string {
  const cleanLogin = hemisLogin.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${cleanLogin}${DEMO_DOMAIN}`;
}

export function emailToHemis(email: string): string {
  if (email.endsWith(DEMO_DOMAIN)) {
    return email.replace(DEMO_DOMAIN, "");
  }
  return email;
}

export interface RegisterParams {
  fullName: string;
  hemisLogin: string;
  university: string;
  faculty: string;
  groupName: string;
  password: string;
}

export async function registerWithHemis(params: RegisterParams) {
  const supabase = createClient();
  const email = hemisToEmail(params.hemisLogin);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        hemis_login: params.hemisLogin.trim().toLowerCase(),
      },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered") || authError.message.includes("User already exists")) {
      throw new Error("Ushbu HEMIS login allaqachon ro'yxatdan o'tgan.");
    }
    throw new Error(authError.message);
  }

  const user = authData.user;
  if (!user) {
    throw new Error("Foydalanuvchi yaratilmadi. Qaytadan urinib ko'ring.");
  }

  // Insert student profile into profiles table
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: params.fullName.trim(),
    hemis_login: params.hemisLogin.trim().toLowerCase(),
    university: params.university.trim(),
    faculty: params.faculty.trim(),
    group_name: params.groupName.trim(),
    role: "student",
  });

  if (profileError) {
    throw new Error("Profilni yaratishda xatolik: " + profileError.message);
  }

  return user;
}

export async function loginWithHemis(hemisLogin: string, password: string) {
  const supabase = createClient();
  const email = hemisToEmail(hemisLogin);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("HEMIS login yoki parol noto'g'ri.");
    }
    throw new Error(error.message);
  }

  return data.user;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}
