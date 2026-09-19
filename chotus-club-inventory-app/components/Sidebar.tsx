"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";
import {
  LayoutDashboard,
  Shirt,
  Store,
  Warehouse,
  ArrowLeftRight,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "store_staff"] },
  { href: "/products", label: "Products", icon: Shirt, roles: ["owner", "store_staff"] },
  { href: "/store-stock", label: "Store Stock", icon: Store, roles: ["owner", "store_staff"] },
  { href: "/warehouse-stock", label: "Warehouse Stock", icon: Warehouse, roles: ["owner"] },
  { href: "/transfers", label: "Transfers", icon: ArrowLeftRight, roles: ["owner", "store_staff"] },
] as const;

export function Sidebar({
  role,
  name,
}: {
  role: Role;
  name: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-[var(--color-primary)] text-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center font-display text-lg">
            CC
          </div>
          <div>
            <p className="font-display text-base leading-tight">Chotu&apos;s Club</p>
            <p className="text-[11px] text-white/60 leading-tight">Inventory</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.filter((item) => (item.roles as readonly string[]).includes(role)).map(
          (item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-white text-[var(--color-primary-dark)] font-medium"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </Link>
            );
          }
        )}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate">{name ?? "User"}</p>
          <p className="text-[11px] text-white/60">
            {role === "owner" ? "Owner" : "Store staff"}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={17} strokeWidth={2} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
