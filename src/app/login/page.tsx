"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { loginWithHemis } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [hemisLogin, setHemisLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hemisLogin.trim() || !password) {
      setError("Iltimos, HEMIS login va parolni kiriting.");
      return;
    }

    try {
      setLoading(true);
      await loginWithHemis(hemisLogin, password);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Tizimga kirishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-mist">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
        {/* Header with Logo */}
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
            HEMIS hisobingiz orqali platformaga kiring
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-danger-soft border border-danger-text/20 flex items-start gap-2.5 text-danger-text text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="leading-tight">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              HEMIS Login
            </label>
            <input
              type="text"
              placeholder="masalan: ali.valiyev"
              value={hemisLogin}
              onChange={(e) => setHemisLogin(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
            />
            <span className="text-[11px] text-muted-text mt-1 block">
              Universitet HEMIS tizimidagi login nomingiz
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Parol
              </label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 rounded-full bg-teal text-white font-semibold text-sm hover:bg-teal-hover transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <span>Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 pt-5 border-t border-black/5 text-center">
          <p className="text-sm text-muted-text">
            Profilingiz yo&apos;qmi?{" "}
            <Link
              href="/register"
              className="font-semibold text-teal hover:underline inline-flex items-center gap-1"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
