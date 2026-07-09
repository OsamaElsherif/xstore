import { getCurrentProfile } from '@/lib/actions/auth'
import { getAllSettings } from '@/lib/actions/settings'
import { redirect } from 'next/navigation'
import AppSettings from '@/components/admin/settings/AppSettings'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function Page() {
  const profile = await getCurrentProfile()
  
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/admin')
  }

  const settings = await getAllSettings()
  
  // Build a settings map object from the array
  const initialSettings: Record<string, string | null> = {}
  settings.forEach(s => {
    initialSettings[s.key] = s.value
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">App Settings</h1>
          </div>
        </div>
        
        <AppSettings initialSettings={initialSettings} />
      </div>
    </div>
  )
}
