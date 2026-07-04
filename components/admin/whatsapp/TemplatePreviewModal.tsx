'use client'

import { useState } from 'react'
import { X, Send, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { WhatsAppTemplate } from '@/types'
import { testWasenderConnection } from '@/lib/actions/settings'

interface Props {
  template: WhatsAppTemplate
  onClose: () => void
}

const SAMPLE_DEFAULTS = ['Ahmed', '#1042', 'EGP 1,500', 'Samsung', 'Galaxy S24', 'قيد الإصلاح / In Progress']

function buildPreview(body: string, samples: string[]): string {
  return samples.reduce((b, val, i) => b.replaceAll(`{${i}}`, val || `{${i}}`), body)
}

export default function TemplatePreviewModal({ template, onClose }: Props) {
  const [samples, setSamples] = useState<string[]>(
    template.variables.map((_, i) => SAMPLE_DEFAULTS[i] ?? '')
  )
  const [locale, setLocale] = useState<'ar' | 'en'>('ar')
  const [testPhone, setTestPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null)

  const body = locale === 'ar' ? template.body_ar : template.body_en
  const renderedMessage = buildPreview(body, samples)

  const handleSendTest = async () => {
    if (!testPhone) return
    setSending(true)
    setSendResult(null)
    const result = await testWasenderConnection(testPhone)
    setSending(false)
    setSendResult({
      success: result.success,
      message: result.success ? 'Message sent!' : result.error ?? 'Failed to send',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-slate-800">📱 Preview: {template.name}</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{template.event_key}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Sample variable inputs */}
          {template.variables.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-600">Sample Values</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {template.variables.map((v, i) => (
                  <div key={v} className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 font-mono">{'{' + i + '}'} — {v}</label>
                    <input
                      type="text"
                      value={samples[i] ?? ''}
                      onChange={e => {
                        const next = [...samples]
                        next[i] = e.target.value
                        setSamples(next)
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language toggle */}
          <div className="flex gap-2">
            {(['ar', 'en'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  locale === l
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {l === 'ar' ? 'Arabic' : 'English'}
              </button>
            ))}
          </div>

          {/* Message bubble */}
          <div className="bg-[#e5ddd5] rounded-2xl p-6">
            <div className="max-w-xs ms-auto">
              <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                <p
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  className="text-sm text-gray-800 whitespace-pre-line leading-relaxed"
                >
                  {renderedMessage}
                </p>
                <p className="text-right text-xs text-gray-400 mt-1.5">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                </p>
              </div>
            </div>
          </div>

          {/* Test send */}
          <div className="space-y-3 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-sm font-bold text-gray-700">Send Test Message</p>
            <div className="flex gap-3">
              <input
                type="tel"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                placeholder="+201012345678"
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                onClick={handleSendTest}
                disabled={sending || !testPhone}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-green-100"
              >
                {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Send
              </button>
            </div>
            {sendResult && (
              <div className={`flex items-center gap-2 text-sm font-bold ${sendResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {sendResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {sendResult.message}
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
