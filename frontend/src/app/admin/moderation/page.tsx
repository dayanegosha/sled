import ModerationQueue from '@/components/admin/ModerationQueue';

export default function AdminModerationPage() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight">Moderation</h2>
      <ModerationQueue />
    </div>
  );
}
