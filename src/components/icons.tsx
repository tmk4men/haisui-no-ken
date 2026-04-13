import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...p }: IconProps) {
  return {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    ...p,
  };
}

// 拳 → ダンベル
export function IconDumbbell(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="2" y="9" width="2.2" height="6" rx="0.4" />
      <rect x="4.5" y="7" width="2.4" height="10" rx="0.4" />
      <path d="M7 12h10" />
      <rect x="17.2" y="7" width="2.4" height="10" rx="0.4" />
      <rect x="19.8" y="9" width="2.2" height="6" rx="0.4" />
    </svg>
  );
}

// 書 → 開いた巻物/本
export function IconBook(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 5c3-1 6-1 9 0v14c-3-1-6-1-9 0V5z" />
      <path d="M21 5c-3-1-6-1-9 0v14c3-1 6-1 9 0V5z" />
      <path d="M7 9h3M7 12h3M14 9h3M14 12h3" />
    </svg>
  );
}

// 刃 → 交差した刀
export function IconCrossBlades(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 4l10 10" />
      <path d="M12 12l8 8" />
      <path d="M3 5l2-2" />
      <path d="M18 19l2 2" />
      <path d="M20 4L10 14" />
      <path d="M12 12l-8 8" />
      <path d="M21 5l-2-2" />
      <path d="M6 19l-2 2" />
    </svg>
  );
}

// 技 → 四方手裏剣/紋様
export function IconTechnique(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

// 具 → 兜/鎧
export function IconHelmet(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 14c0-5 3.5-9 8-9s8 4 8 9v3H4v-3z" />
      <path d="M2 17h20" />
      <path d="M12 5v5" />
      <path d="M8 10l-1 4M16 10l1 4" />
    </svg>
  );
}

// 人 → 立ち姿
export function IconPerson(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="5.5" r="2.6" />
      <path d="M6 21v-5c0-3.3 2.7-6 6-6s6 2.7 6 6v5" />
    </svg>
  );
}

// 設定 → 歯車
export function IconGear(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  );
}

export const NAV_ICONS = {
  train: IconDumbbell,
  study: IconBook,
  battle: IconCrossBlades,
  skills: IconTechnique,
  equipment: IconHelmet,
  character: IconPerson,
  settings: IconGear,
} as const;
