"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Bell,
  Building2,
  LogOut,
  ShieldCheck,
  Trash2,
  UserCircle2,
} from "lucide-react";

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/settings/profile", label: "Profile", icon: UserCircle2 },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/security", label: "Security", icon: ShieldCheck },
  { href: "/settings/account", label: "Account", icon: Trash2 },
  { href: "/settings/breweries", label: "Brewery settings", icon: Building2 },
];

const SettingTabs = ({ children }: Props) => {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: `${window.location.origin}/` });
  };

  const isActive = (path: string) => {
    if (
      path === "/settings/breweries" &&
      pathname.startsWith("/settings/breweries")
    ) {
      return true;
    }

    return pathname === path;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Personal settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, notifications, security, and account status.
          </p>
        </div>

        <nav
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
          aria-label="Personal settings"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Brewery operations
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Staff management remains in each brewery dashboard.
          </p>
        </div>

        <button
          className="flex flex-row items-center gap-2 text-sm"
          onClick={handleSignOut}
          type="button"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
};

export default SettingTabs;
