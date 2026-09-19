import { getAllSessions } from '@/lib/actions/wasender-sessions'
import { getSetting } from '@/lib/actions/settings'
import { SessionsManager } from '@/components/admin/whatsapp/SessionsManager'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/auth'

export const metadata = {
  title: 'WhatsApp Sessions — XStore Admin',
  description: 'Manage all Wasender WhatsApp sessions',
}

export default async function WhatsAppSessionsPage() {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'ADMIN') redirect('/admin')

  const [sessionsResult, activeSessionId] = await Promise.all([
    getAllSessions(),
    getSetting('wasender_session_id'),
  ])

  return (
    <SessionsManager
      initialSessions={sessionsResult.sessions ?? []}
      activeSessionId={activeSessionId ?? null}
      error={sessionsResult.error}
    />
  )
}
