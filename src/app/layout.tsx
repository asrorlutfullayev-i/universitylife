import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "UniverLife - Talabalar portali",
  description: "O'zbekiston talabalari uchun stipendiyalar, tadbirlar, to'garaklar va faollik reytingi",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A3D3A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="min-h-dvh bg-mist text-ink antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
