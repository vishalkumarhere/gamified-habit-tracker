import { QuestsContent } from "@/components/quests/QuestsContent";

export default function QuestsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-inter-tight)] mb-6">
        Control Room
      </h1>
      <QuestsContent />
    </div>
  );
}
