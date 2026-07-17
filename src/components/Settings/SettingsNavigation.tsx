"use client";

import {
  Bell,
  Building2,
  LogOut,
  ShieldCheck,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Personal",
    items: [
      { href: "/settings/profile", label: "Profile", icon: UserCircle2 },
      { href: "/settings/notifications", label: "Notifications", icon: Bell },
      { href: "/settings/security", label: "Security", icon: ShieldCheck },
      { href: "/settings/account", label: "Account", icon: Trash2 },
    ],
  },
  {
    label: "Brewery",
    items: [
      {
        href: "/settings/breweries",
        label: "Brewery settings",
        icon: Building2,
      },
    ],
  },
];

export default function SettingsNavigation() {
  const pathname = usePathname();
  const isActive = (path: string) =>
    path === "/settings/breweries"
      ? pathname.startsWith(path)
      : pathname === path;

  const handleSignOut = () => {
    signOut({ callbackUrl: `${window.location.origin}/` });
  };

  return (
    <aside className="space-y-4 lg:sticky lg:top-8">
      <div>
        <h2 className="text-2xl font-semibold">Personal settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, notifications, security, and account status.
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <nav
            className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0"
            aria-label={`${group.label} settings`}
          >
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors lg:shrink ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="rounded-md border border-border bg-background p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Brewery operations
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Staff management remains in each brewery dashboard.
        </p>
      </div>

      <button
        className="flex min-h-11 flex-row items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={handleSignOut}
        type="button"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </aside>
  );
}
