import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-inter-tight)] mb-6">
        Dashboard
      </h1>
      <DashboardContent />
    </div>
  );
}
