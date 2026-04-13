import { NavCard } from "@/components/NavCard";
import { PageHero } from "@/components/PageHero";

export default function TrainPage() {
  return (
    <div className="space-y-4">
      <PageHero image="/bg/squat.webp" title="シバキ上げ" desc="骨に刻め、限界を越えろ" />
      <div className="grid gap-3">
        <NavCard href="/train/squat" title="スクワット" desc="カメラで回数カウント / フォーム評価" />
        <NavCard href="/train/pushup" title="腕立て" desc="カメラで回数カウント" />
        <NavCard href="/train/plank" title="プランク" desc="カメラで保持秒数を計測" />
      </div>
    </div>
  );
}
