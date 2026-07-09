import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/auth'
import { getAllTemplates } from '@/lib/actions/whatsapp-templates'
import TemplatesManager from '@/components/admin/whatsapp/TemplatesManager'

export default async function WhatsAppTemplatesPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/admin')
  }

  const templates = await getAllTemplates()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">WhatsApp Message Templates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the messages sent to customers via WhatsApp. Variables use <code className="bg-gray-100 px-1 rounded text-xs">{'{0}'}</code>, <code className="bg-gray-100 px-1 rounded text-xs">{'{1}'}</code>… placeholders.
        </p>
      </div>
      <TemplatesManager initialTemplates={templates} />
    </div>
  )
}
