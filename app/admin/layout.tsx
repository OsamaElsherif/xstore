import { getCurrentProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/layout/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()

  if (!profile) redirect('/login')
  if (profile.role === 'CUSTOMER') redirect('/')

  return <AdminShell profile={profile}>{children}</AdminShell>
}
