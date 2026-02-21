import { ProfileContent } from "@/components/profile/ProfileContent";

export default function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-inter-tight)] mb-6">
        Profile
      </h1>
      <ProfileContent />
    </div>
  );
}
