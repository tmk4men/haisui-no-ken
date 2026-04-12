import { NavCard } from "@/components/NavCard";

export default function TrainPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">シバキ上げ</h2>
      <div className="grid gap-3">
        <NavCard href="/train/squat" title="スクワット" desc="カメラで回数カウント / フォーム評価" />
        <NavCard href="/train/pushup" title="腕立て" desc="カメラで回数カウント" />
        <NavCard href="/train/plank" title="プランク" desc="カメラで保持秒数を計測" />
      </div>
    </div>
  );
}
