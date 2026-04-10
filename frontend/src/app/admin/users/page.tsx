import UserTable from '@/components/admin/UserTable';

export default function AdminUsersPage() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
      <UserTable />
    </div>
  );
}
