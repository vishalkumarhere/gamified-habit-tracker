"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Swords, BarChart3, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useSupabaseEnabled } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quests", label: "Control Room", icon: Swords },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const useSupabase = useSupabaseEnabled() && !!user;

  const handleSignOut = async () => {
    if (!useSupabase) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="flex flex-col gap-1 p-2 w-48 flex-1 min-h-0">
      {useSupabase && user && (
        <div className="mb-3 px-3 py-2 text-xs text-muted-foreground truncate">
          {user.email ?? user.user_metadata?.name ?? "Signed in"}
        </div>
      )}
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-[#0A0A0A] border border-[#1F1F1F] text-[#0FA958] ring-1 ring-[#0FA958]/30"
                : "text-[#C7C7C7] hover:bg-[#0A0A0A] hover:text-[#0FA958]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      {useSupabase && (
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#C7C7C7] hover:bg-[#0A0A0A] hover:text-destructive transition-colors mt-auto"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      )}
    </nav>
  );
}
