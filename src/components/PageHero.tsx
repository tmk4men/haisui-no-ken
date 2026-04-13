export function PageHero({
  image, title, desc,
}: {
  image: string;
  title: string;
  desc?: string;
}) {
  return (
    <section
      className="relative rounded-xl overflow-hidden panel-washi h-32 sm:h-40 flex items-end"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 pointer-events-none" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />
      <div className="relative px-5 pb-3 pt-6">
        <h2 className="font-brush text-3xl ink-title blood-stroke leading-none">{title}</h2>
        {desc && <div className="mt-1 text-[11px] text-rose-200/80 font-kan tracking-widest">{desc}</div>}
      </div>
    </section>
  );
}
