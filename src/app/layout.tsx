import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { PwaRegister } from "@/components/PwaRegister";
import { AchievementToast } from "@/components/AchievementToast";
import { WeeklyReportModal } from "@/components/WeeklyReport";
import { ReminderScheduler } from "@/components/ReminderScheduler";
import { TITLE, TAGLINE } from "@/lib/ui/labels";

export const metadata: Metadata = {
  title: `${TITLE} — ${TAGLINE}`,
  description: TAGLINE,
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <PwaRegister />
        <AchievementToast />
        <WeeklyReportModal />
        <ReminderScheduler />
        <div className="max-w-3xl mx-auto p-4">
          <header className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <Link href="/" className="text-xl font-bold tracking-widest" style={{ fontFamily: "serif" }}>{TITLE}</Link>
            <nav className="flex gap-3 text-sm text-slate-400 flex-wrap">
              <Link href="/train">シバキ</Link>
              <Link href="/study">読み込み</Link>
              <Link href="/battle">出入り</Link>
              <Link href="/character">漢</Link>
              <Link href="/skills">技</Link>
              <Link href="/equipment">装具</Link>
              <Link href="/settings">設定</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
