import { StatsContent } from "@/components/stats/StatsContent";

export default function StatsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-inter-tight)] mb-6">
        Stats
      </h1>
      <StatsContent />
    </div>
  );
}
