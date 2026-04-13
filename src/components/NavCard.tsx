import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type IconComp = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export function NavCard({
  href, title, desc, Icon, accent,
}: { href: string; title: string; desc: string; Icon?: IconComp; accent?: string }) {
  return (
    <Link
      href={href}
      className={`slash-on-hover group relative block rounded-lg p-4 pl-5 panel-washi hover:border-rose-800/60 transition ${accent ?? ""}`}
    >
      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-rose-700 via-rose-500 to-rose-800 rounded-full opacity-70 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.6)] transition" />
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="shrink-0 grid place-items-center w-9 h-9 rounded-sm border border-rose-900/40 bg-rose-950/20 text-rose-300/80 group-hover:text-rose-200 group-hover:border-rose-700/60 transition">
            <Icon size={20} />
          </span>
        )}
        <div className="min-w-0">
          <div className="font-kan font-bold tracking-wider text-slate-100 group-hover:text-white truncate">
            {title}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-kan tracking-wide">{desc}</div>
        </div>
      </div>
    </Link>
  );
}
