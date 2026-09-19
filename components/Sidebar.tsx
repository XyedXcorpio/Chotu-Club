"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/lib/types";
import {
  LayoutDashboard,
  Shirt,
  Store,
  Warehouse,
  ArrowLeftRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "store_staff"] },
  { href: "/products", label: "Products", icon: Shirt, roles: ["owner", "store_staff"] },
  { href: "/store-stock", label: "Store Stock", icon: Store, roles: ["owner", "store_staff"] },
  { href: "/warehouse-stock", label: "Warehouse Stock", icon: Warehouse, roles: ["owner"] },
  { href: "/transfers", label: "Transfers", icon: ArrowLeftRight, roles: ["owner", "store_staff"] },
] as const;

/**
 * Renders both the mobile top bar (hamburger trigger, shown < md) and the
 * sidebar itself. On desktop (md+) the sidebar is a permanent fixed column.
 * On mobile it's an off-canvas drawer: hidden by default, slides in over a
 * backdrop when opened, and closes automatically on navigation or backdrop
 * tap so it never gets left open by accident.
 */
export function Sidebar({
  role,
  name,
}: {
  role: Role;
  name: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Tracks the pathname the drawer's open-state was last set for. When the
  // route changes mid-render we reset `open` to false here (render-phase,
  // not an effect) so navigating always closes the drawer without a
  // cascading-render effect call.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  const navItems = NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  return (
    <>
      {/* Mobile-only top bar with hamburger trigger */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-[var(--color-primary)] text-white px-4 h-14 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center font-display text-sm">
            CC
          </div>
          <span className="font-display text-sm">Chotu&apos;s Club</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 rounded-lg hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Backdrop, mobile only, shown while drawer is open */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 z-50 md:z-auto
          w-64 md:w-60 shrink-0 h-screen
          bg-[var(--color-primary)] text-white flex flex-col
          transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center font-display text-lg">
              CC
            </div>
            <div>
              <p className="font-display text-base leading-tight">Chotu&apos;s Club</p>
              <p className="text-[11px] text-white/60 leading-tight">Inventory</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-1.5 -mr-1.5 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 md:py-2 text-sm transition-colors ${
                  active
                    ? "bg-white text-[var(--color-primary-dark)] font-medium"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
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
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 md:py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={17} strokeWidth={2} />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
