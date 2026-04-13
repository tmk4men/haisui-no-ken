export function TrainBanner({ src, title, desc }: { src: string; title: string; desc: string }) {
  return (
    <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden ring-1 ring-slate-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-4">
        <h2 className="font-brush text-2xl ink-title blood-stroke">{title}</h2>
        <p className="text-[11px] text-rose-200/80 font-kan tracking-widest mt-1">{desc}</p>
      </div>
    </div>
  );
}
