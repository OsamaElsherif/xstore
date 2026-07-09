import { getCurrentProfile } from '@/lib/actions/auth'
import { getAllStaffAccounts, getAllUsers } from '@/lib/actions/users'
import { redirect } from 'next/navigation'
import UserManagement from '@/components/admin/users/UserManagement'

export default async function UserManagementPage() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'ADMIN') {
    redirect('/admin')
  }

  // Fetch initial data
  const staffAccounts = await getAllStaffAccounts()
  const allUsers = await getAllUsers()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-500 text-sm">Manage staff accounts and customer profiles.</p>
      </div>

      <UserManagement 
        initialStaff={staffAccounts} 
        initialAll={allUsers}
        currentUserProfile={profile}
      />
    </div>
  )
}
