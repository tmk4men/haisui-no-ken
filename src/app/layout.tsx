import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { PwaRegister } from "@/components/PwaRegister";
import { AchievementToast } from "@/components/AchievementToast";
import { WeeklyReportModal } from "@/components/WeeklyReport";
import { ReminderScheduler } from "@/components/ReminderScheduler";
import { TITLE, TITLE_SUB, TITLE_MARK, TAGLINE } from "@/lib/ui/labels";

const SITE_URL = "https://haisui-no-ken.vercel.app";
const OG_TITLE = `${TITLE} -${TITLE_SUB}-`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${OG_TITLE} — ${TAGLINE}`, template: `%s | ${OG_TITLE}` },
  description: `${TAGLINE} 筋トレ・勉強・日々の鍛錬を刻むライフRPG。`,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: OG_TITLE,
    title: `${OG_TITLE} — ${TAGLINE}`,
    description: `${TAGLINE} 筋トレ・勉強・日々の鍛錬を刻むライフRPG。`,
    locale: "ja_JP",
    images: [{ url: "/chara/ogp.png", width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${OG_TITLE} — ${TAGLINE}`,
    description: TAGLINE,
    images: ["/chara/ogp.png"],
  },
  icons: { icon: "/chara/icon.png", apple: "/chara/icon.png" },
};

const NAV = [
  { href: "/train", label: "シバキ", icon: "拳" },
  { href: "/study", label: "読込", icon: "書" },
  { href: "/battle", label: "出入", icon: "刃" },
  { href: "/character", label: "漢", icon: "人" },
  { href: "/skills", label: "技", icon: "技" },
  { href: "/equipment", label: "装具", icon: "具" },
  { href: "/settings", label: "設定", icon: "卍" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <PwaRegister />
        <AchievementToast />
        <WeeklyReportModal />
        <ReminderScheduler />
        <div className="relative z-10 max-w-3xl mx-auto p-4">
          <header className="mb-6">
            <div className="flex items-end justify-between border-b border-slate-800/80 pb-3">
              <Link href="/" className="group inline-flex items-end gap-3">
                <span className="font-brush text-4xl leading-none ink-title blood-stroke">{TITLE}</span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[9px] text-slate-500 tracking-[0.35em] font-mono">- {TITLE_SUB} -</span>
                  <span className="text-[10px] text-rose-300/70 font-kan tracking-[0.2em] mt-0.5">{TAGLINE}</span>
                </span>
              </Link>
              <span
                aria-hidden
                className="font-brush text-rose-200 bg-rose-900/40 border-2 border-rose-700 w-9 h-9 grid place-items-center rounded-sm rotate-3 shadow-[inset_0_0_0_1px_rgba(220,38,38,0.5)]"
                style={{ textShadow: "0 0 6px rgba(254,202,202,0.3)" }}
              >
                {TITLE_MARK}
              </span>
            </div>
            <nav className="mt-3 flex gap-1.5 overflow-x-auto text-xs">
              {NAV.map(n => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="font-kan shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-slate-800 text-slate-300 hover:text-rose-200 hover:border-rose-900/60 hover:bg-rose-950/20 transition"
                >
                  <span className="text-slate-500">{n.icon}</span>
                  <span>{n.label}</span>
                </Link>
              ))}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
