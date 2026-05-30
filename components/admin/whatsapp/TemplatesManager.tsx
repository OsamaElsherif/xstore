'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, XCircle, Tag } from 'lucide-react'
import { WhatsAppTemplate } from '@/types'
import TemplateForm from './TemplateForm'
import TemplatePreviewModal from './TemplatePreviewModal'

interface TemplatesManagerProps {
  initialTemplates: WhatsAppTemplate[]
}

const SYSTEM_KEYS = ['order_placed', 'maintenance_received', 'maintenance_status_update', 'account_created']

export default function TemplatesManager({ initialTemplates }: TemplatesManagerProps) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(initialTemplates)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null)

  // ── Page-swap: show form instead of list ────────────────────────────────
  if (showForm) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
        <TemplateForm
          template={editingTemplate ?? undefined}
          onSuccess={(t) => {
            setTemplates(prev =>
              editingTemplate
                ? prev.map(x => x.id === t.id ? t : x)
                : [...prev, t]
            )
            setShowForm(false)
            setEditingTemplate(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingTemplate(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setEditingTemplate(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-100 transition-all"
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      {/* Template cards */}
      <div className="space-y-4">
        {templates.map(t => (
          <div
            key={t.id}
            className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Card header */}
            <div className="px-6 py-4 flex items-start justify-between gap-4 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-wrap">
                {t.is_active
                  ? <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  : <XCircle size={18} className="text-gray-300 shrink-0" />
                }
                <span className="font-black text-slate-800">{t.name}</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold font-mono">
                  {t.event_key}
                </span>
                {SYSTEM_KEYS.includes(t.event_key) && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold">
                    system
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPreviewTemplate(t)}
                  className="px-4 py-1.5 text-sm font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-200 hover:border-indigo-200"
                >
                  Preview
                </button>
                <button
                  onClick={() => { setEditingTemplate(t); setShowForm(true) }}
                  className="px-4 py-1.5 text-sm font-bold text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-gray-200 hover:border-green-200"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Variables row */}
            {t.variables.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 flex-wrap">
                <Tag size={13} className="text-gray-400" />
                {t.variables.map((v, i) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-600"
                  >
                    <span className="text-gray-400">{'{' + i + '}'}</span> {v}
                  </span>
                ))}
              </div>
            )}

            {/* Body preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="px-6 py-4">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Arabic</p>
                <p dir="rtl" className="text-sm text-gray-700 whitespace-pre-line line-clamp-4 font-medium leading-relaxed">
                  {t.body_ar}
                </p>
              </div>
              <div className="px-6 py-4">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">English</p>
                <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-4 font-medium leading-relaxed">
                  {t.body_en}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  )
}
