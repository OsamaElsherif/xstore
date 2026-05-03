import { getCurrentProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()

  if (!profile || profile.role === 'CUSTOMER') {
    redirect('/')
  }

  return <>{children}</>
}
