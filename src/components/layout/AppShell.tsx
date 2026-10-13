"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  GraduationCap, 
  Calendar, 
  Users, 
  Newspaper, 
  User, 
  LogOut, 
  ShieldCheck, 
  Trophy,
  Search
} from "lucide-react";
import { getCurrentProfile, signOut } from "@/lib/auth";
import type { Profile } from "@/types/database";

const NAV_ITEMS = [
  { href: "/", label: "Bosh", icon: Home },
  { href: "/opportunities", label: "Stipendiya", icon: GraduationCap },
  { href: "/events", label: "Tadbir", icon: Calendar },
  { href: "/groups", label: "To'garaklar", icon: Users },
  { href: "/media", label: "Media", icon: Newspaper },
  { href: "/profile", label: "Profil", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!isAuthRoute) {
      getCurrentProfile().then((data) => {
        setProfile(data);
      }).catch(() => {
        // Ignored if user not loaded yet
      });
    }
  }, [pathname, isAuthRoute]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isAuthRoute) {
    return <main className="min-h-dvh bg-mist">{children}</main>;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-mist text-ink">
      {/* DESKTOP TOP BAR (>=768px) */}
      <header className="hidden md:block sticky top-0 z-50 bg-ink text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="UniverLife"
              width={34}
              height={34}
              className="rounded-lg shadow-sm"
            />
            <span className="font-heading font-bold text-xl tracking-tight">
              <span className="text-white">Univer</span>
              <span className="text-teal-light">Life</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-saffron text-ink font-semibold shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Leaderboard nav item */}
            <Link
              href="/leaderboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                pathname === "/leaderboard"
                  ? "bg-saffron text-ink font-semibold shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Trophy className="w-4 h-4 stroke-[1.8]" />
              <span>Reyting</span>
            </Link>

            {/* Admin panel link if user is admin */}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ml-2 ${
                  pathname.startsWith("/admin")
                    ? "bg-coral text-white"
                    : "bg-teal text-white hover:bg-teal-hover"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Section: User & Logout */}
          <div className="flex items-center gap-3">
            {profile && (
              <Link
                href="/profile"
                className="flex items-center gap-2 text-xs text-white/90 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-saffron text-ink font-bold flex items-center justify-center text-xs">
                  {profile.full_name?.charAt(0).toUpperCase() || "T"}
                </span>
                <span className="font-medium max-w-[120px] truncate">
                  {profile.full_name?.split(" ")[0]}
                </span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Tizimdan chiqish"
              aria-label="Tizimdan chiqish"
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE TOP BAR (<768px) */}
      <header className="md:hidden sticky top-0 z-40 bg-ink text-white px-4 h-14 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="UniverLife"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="font-heading font-bold text-lg">
            <span className="text-white">Univer</span>
            <span className="text-teal-light">Life</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal text-white flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          )}

          <Link
            href="/leaderboard"
            title="Reyting"
            className="p-2 text-white/80 hover:text-white"
          >
            <Trophy className="w-5 h-5 stroke-[1.8]" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Chiqish"
            aria-label="Chiqish"
            className="p-2 text-white/80 hover:text-white"
          >
            <LogOut className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 md:py-8 pb-28 md:pb-12">
        {children}
      </main>

      {/* MOBILE FLOATING BOTTOM NAV (<768px) */}
      <div className="md:hidden fixed bottom-3 left-0 right-0 z-50 px-4 pointer-events-none">
        <nav className="pointer-events-auto max-w-md mx-auto bg-ink/95 backdrop-blur-md text-white rounded-full p-1.5 shadow-xl border border-white/10 flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] rounded-full transition-all ${
                  isActive
                    ? "bg-saffron text-ink font-semibold px-3 py-1 shadow-sm"
                    : "text-white/70 hover:text-white px-2 py-1"
                }`}
              >
                <Icon className={`w-5 h-5 stroke-[1.8] ${isActive ? "text-ink" : "text-white/80"}`} />
                <span className={`text-[10px] tracking-tight mt-0.5 leading-none ${isActive ? "font-bold text-ink" : "font-normal"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
