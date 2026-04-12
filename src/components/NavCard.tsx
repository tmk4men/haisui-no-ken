import Link from "next/link";

export function NavCard({ href, title, desc, accent }: { href: string; title: string; desc: string; accent?: string }) {
  return (
    <Link
      href={href}
      className={`block rounded-xl p-4 ring-1 ring-slate-800 bg-slate-900 hover:bg-slate-800 transition ${accent ?? ""}`}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-400 mt-1">{desc}</div>
    </Link>
  );
}
