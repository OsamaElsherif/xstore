'use client'

import { BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

export default function NotConfigured() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <BarChart3 size={40} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Analytics Not Configured</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Connect your Meta Business account in settings to view live ad performance, spend tracking, and campaign ROI.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/admin/settings" 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all"
          >
            <Settings size={20} />
            Go to Settings
          </Link>
        </div>
      </div>
    </div>
  )
}
