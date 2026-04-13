"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, PenIcon, SignOutIcon } from "./Icons";

type SidebarProps = {
  email: string;
  storeDomain: string;
  signOutAction: () => Promise<void>;
};

export function Sidebar({ email, storeDomain, signOutAction }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const active: "dashboard" | "builder" = pathname.startsWith("/admin/builder")
    ? "builder"
    : "dashboard";

  return (
    <aside className="w-[252px] shrink-0 bg-sidebar text-[#f5f0e8] flex flex-col h-screen sticky top-0">
      <div className="px-6 pt-7 pb-5">
        <div
          className="text-[22px] italic font-serif-display leading-none"
          style={{ color: "#f5f0e8" }}
        >
          Event Besties
        </div>
        <div
          className="mt-2 text-[10px] tracking-[0.18em]"
          style={{ color: "#6a6050" }}
        >
          ADMIN DASHBOARD
        </div>
      </div>

      <div className="mx-6 border-t border-white/[0.06]" />

      <nav className="flex-1 mt-5 flex flex-col">
        <NavLink
          href="/admin/dashboard"
          label="Templates & Canvases"
          icon={<GridIcon size={17} />}
          active={active === "dashboard"}
        />
        <NavLink
          href="/admin/builder"
          label="Template Builder"
          icon={<PenIcon size={17} />}
          active={active === "builder"}
        />
      </nav>

      <div className="px-6 py-5 border-t border-white/[0.06] text-[11px] space-y-1">
        <div style={{ color: "#8a8070" }}>{storeDomain}</div>
        {email && <div style={{ color: "#c0b8a8" }}>{email}</div>}
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-2 inline-flex items-center gap-2 text-[12px] hover:text-gold transition-colors"
            style={{ color: "#c0b8a8" }}
          >
            <SignOutIcon size={14} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-6 py-3 text-[13px] transition-colors ${
        active
          ? "bg-white/[0.07] border-l-[3px] border-gold pl-[21px]"
          : "border-l-[3px] border-transparent hover:bg-white/[0.04]"
      }`}
      style={{ color: active ? "#f5f0e8" : "#c0b8a8" }}
    >
      <span className="opacity-90">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
