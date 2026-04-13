import Link from "next/link";

export function NavCard({
  href, title, desc, icon, accent,
}: { href: string; title: string; desc: string; icon?: string; accent?: string }) {
  return (
    <Link
      href={href}
      className={`slash-on-hover group relative block rounded-lg p-4 pl-5 panel-washi hover:border-rose-800/60 transition ${accent ?? ""}`}
    >
      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-rose-700 via-rose-500 to-rose-800 rounded-full opacity-70 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.6)] transition" />
      <div className="flex items-start gap-2.5">
        {icon && (
          <span className="text-lg leading-none mt-0.5 text-rose-300/80 group-hover:text-rose-200 font-kan">
            {icon}
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
