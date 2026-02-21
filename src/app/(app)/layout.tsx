import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/SidebarNav";
import { WeeklyEvolutionModal } from "@/components/WeeklyEvolutionModal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      redirect("/login");
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="border-r border-[#1F1F1F] bg-[#050505] shrink-0">
        <SidebarNav />
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
      <WeeklyEvolutionModal />
    </div>
  );
}
