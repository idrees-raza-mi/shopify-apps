"use client";

import type { DashboardItem } from "@/lib/types";
import { EyeIcon } from "./Icons";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = h % 360;
  const b = (a + 40) % 360;
  return `linear-gradient(135deg, hsl(${a} 35% 78%) 0%, hsl(${b} 30% 62%) 100%)`;
}

type TemplateCardProps = {
  item: DashboardItem;
  onPreview: (item: DashboardItem) => void;
};

export function TemplateCard({ item, onPreview }: TemplateCardProps) {
  const { config } = item;
  const isTemplate = config.type === "template";
  const svgUrl = isTemplate ? config.svgUrl : "";
  const initials = initialsOf(config.productName);

  return (
    <div className="bg-white border border-card-border rounded-card overflow-hidden flex flex-col">
      <div
        className="h-[180px] flex items-center justify-center"
        style={
          svgUrl
            ? { background: "#f8f5f0" }
            : { background: gradientFor(config.productName) }
        }
      >
        {svgUrl ? (
          // Raw <img> intentional: the file is on Cloudinary and is an SVG/raw asset.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={svgUrl}
            alt={config.productName}
            className="max-w-[80%] max-h-[150px] object-contain"
          />
        ) : (
          <div className="text-white font-serif-display text-[44px] tracking-wider drop-shadow-sm">
            {initials}
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-3 flex-1">
        <div
          className="text-[14px] font-medium text-[#1a1a1a] truncate"
          title={config.productName}
        >
          {config.productName}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge
            tone={isTemplate ? "amber" : "blue"}
            label={isTemplate ? "Template" : "Canvas"}
          />
          <Badge
            tone={config.status === "published" ? "green" : "gray"}
            label={config.status === "published" ? "Published" : "Draft"}
          />
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={() => onPreview(item)}
          className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg border border-card-border text-[13px] hover:bg-form-surface transition-colors"
        >
          <EyeIcon size={15} />
          Preview
        </button>
      </div>
    </div>
  );
}

function Badge({
  tone,
  label,
}: {
  tone: "amber" | "blue" | "green" | "gray";
  label: string;
}) {
  const tones: Record<string, string> = {
    amber: "bg-[#fdf3e1] text-[#a06b1c] border-[#f1ddb3]",
    blue: "bg-[#e8f1fb] text-[#2a5b94] border-[#cbdcef]",
    green: "bg-[#e8f4ea] text-[#2a7a3c] border-[#c9e2cf]",
    gray: "bg-[#eeece6] text-[#6a6050] border-[#dcd6c8]",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] tracking-[0.06em] uppercase px-2 py-[3px] rounded-md border ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
