"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserPlus, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { registerWithHemis } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    hemisLogin: "",
    university: "Samarqand Davlat Universiteti",
    faculty: "",
    groupName: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.name === "hemisLogin" ? e.target.value.toLowerCase() : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const username = formData.hemisLogin.trim().toLowerCase();

    if (
      !formData.fullName.trim() ||
      !username ||
      !formData.university.trim() ||
      !formData.faculty.trim() ||
      !formData.groupName.trim() ||
      !formData.password
    ) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError("Foydalanuvchi nomi 3 dan 20 tagacha belgidan iborat bo'lishi kerak.");
      return;
    }

    if (!/^[a-z]/.test(username)) {
      setError("Foydalanuvchi nomi faqat lotin harfi bilan boshlanishi kerak.");
      return;
    }

    if (!/^[a-z][a-z0-9._]*$/.test(username)) {
      setError("Foydalanuvchi nomida faqat kichik lotin harflari, raqamlar, nuqta va pastki chiziq ishlatilishi mumkin.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    try {
      setLoading(true);
      await registerWithHemis({
        ...formData,
        hemisLogin: username,
      });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 py-8 bg-mist">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Image
              src="/logo.svg"
              alt="UniverLife Logo"
              width={42}
              height={42}
              className="rounded-xl"
            />
            <span className="font-heading font-bold text-2xl tracking-tight">
              <span className="text-ink">Univer</span>
              <span className="text-teal">Life</span>
            </span>
          </div>
          <p className="text-sm text-muted-text font-normal">
            Talaba profili yaratish va tizimga a&apos;zo bo&apos;lish
          </p>
        </div>

        {/* Info Alert */}
        <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="leading-relaxed">
            Demo versiya. HEMIS parolingizni kiritmang, yangi parol o&apos;ylab toping.
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-danger-soft border border-danger-text/20 flex items-start gap-2.5 text-danger-text text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="leading-tight">{error}</div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              To&apos;liq ism-sharifingiz
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Masalan: Jasur Rahimov"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal text-sm transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Foydalanuvchi nomi
              </label>
              <input
                type="text"
                name="hemisLogin"
                placeholder="masalan: ali.valiyev"
                value={formData.hemisLogin}
                onChange={handleChange}
                required
                className="w-full h-10 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal text-sm transition"
              />
              {/* TODO: rename to username after launch */}
              <span className="text-[11px] text-muted-text mt-1 block">
                O&apos;zingiz o&apos;ylab topgan nom. Kichik harflar, raqam va nuqta.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Parol
              </label>
              <input
                type="password"
                name="password"
                placeholder="Kamida 8 belgi"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full h-10 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              Universitet
            </label>
            <input
              type="text"
              name="university"
              placeholder="Masalan: Samarqand Davlat Universiteti"
              value={formData.university}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal text-sm transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Fakultet
              </label>
              <input
                type="text"
                name="faculty"
                placeholder="Raqamli texnologiyalar"
                value={formData.faculty}
                onChange={handleChange}
                required
                className="w-full h-10 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Guruh
              </label>
              <input
                type="text"
                name="groupName"
                placeholder="Dasturiy injiniring 201"
                value={formData.groupName}
                onChange={handleChange}
                required
                className="w-full h-10 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-3 rounded-full bg-teal text-white font-semibold text-sm hover:bg-teal-hover transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yaratilmoqda...</span>
              </>
            ) : (
              <>
                <span>Ro&apos;yxatdan o&apos;tish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-black/5 text-center">
          <p className="text-sm text-muted-text">
            Profilingiz bormi?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal hover:underline inline-flex items-center gap-1"
            >
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
