export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return todayKey(dt);
}

export function diffDays(aKey: string, bKey: string): number {
  const [ya, ma, da] = aKey.split("-").map(Number);
  const [yb, mb, db] = bKey.split("-").map(Number);
  const a = new Date(ya, ma - 1, da).getTime();
  const b = new Date(yb, mb - 1, db).getTime();
  return Math.round((a - b) / 86400000);
}

export function lastNDates(n: number, from: Date = new Date()): string[] {
  const base = todayKey(from);
  return Array.from({ length: n }, (_, i) => addDays(base, -(n - 1 - i)));
}
