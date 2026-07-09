'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { WhatsAppTemplate, EventKey } from '@/types'
import { createTemplate, updateTemplate } from '@/lib/actions/whatsapp-templates'

const SYSTEM_EVENT_KEYS: EventKey[] = [
  'order_placed',
  'maintenance_received',
  'maintenance_status_update',
  'account_created',
]

const SAMPLE_VALUES: Record<string, string> = {
  customer_name:      'Ahmed Mohamed',
  order_number:       '#1042',
  total_price:        '1,500',
  request_number:     'MR-1001',
  device_brand:       'Apple',
  device_type:        'iPhone 13 Pro',
  status_label:       'جاهز للاستلام ✅',
  customer_notes:     'الجهاز جاهز، تواصل معنا',
  email:              'ahmed@example.com',
  temporary_password: 'Jacob-4829-Store',
}

function getSampleValue(name: string): string {
  return SAMPLE_VALUES[name] ?? `{${name}}`
}

function buildPreview(body: string, vars: string[]): string {
  return vars.reduce(
    (text, varName, index) => text.replaceAll(`{${index}}`, getSampleValue(varName)),
    body
  )
}

interface TemplateFormProps {
  template?: WhatsAppTemplate
  onSuccess: (t: WhatsAppTemplate) => void
  onCancel: () => void
}

export default function TemplateForm({ template, onSuccess, onCancel }: TemplateFormProps) {
  const isEdit = !!template
  const isSystemTemplate = isEdit && SYSTEM_EVENT_KEYS.includes(template.event_key as EventKey)

  const [name, setName] = useState(template?.name ?? '')
  const [eventKey, setEventKey] = useState(template?.event_key ?? '')
  const [variables, setVariables] = useState<string[]>(template?.variables ?? [])
  const [bodyAr, setBodyAr] = useState(template?.body_ar ?? '')
  const [bodyEn, setBodyEn] = useState(template?.body_en ?? '')
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [variableInput, setVariableInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePreviewLang, setActivePreviewLang] = useState<'ar' | 'en'>('ar')

  const inputRef = useRef<HTMLInputElement>(null)

  // ── Variable tag input ───────────────────────────────────────────────────
  const addVariable = () => {
    const trimmed = variableInput.trim().replace(/,/g, '').replace(/\s+/g, '_')
    if (trimmed && !variables.includes(trimmed)) {
      setVariables(prev => [...prev, trimmed])
    }
    setVariableInput('')
  }

  const handleVariableKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addVariable()
    }
    if (e.key === 'Backspace' && variableInput === '' && variables.length > 0) {
      setVariables(prev => prev.slice(0, -1))
    }
  }

  const removeVariable = (index: number) => {
    setVariables(prev => prev.filter((_, i) => i !== index))
  }

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!name.trim()) return 'Template name is required'
    if (!eventKey.trim()) return 'Event key is required'
    if (variables.length === 0) return 'At least one variable is required'
    if (!bodyAr.trim()) return 'Arabic body is required'
    if (!bodyEn.trim()) return 'English body is required'

    const arPlaceholders = (bodyAr.match(/\{(\d+)\}/g) ?? []).map(p => parseInt(p.replace(/[{}]/g, '')))
    const enPlaceholders = (bodyEn.match(/\{(\d+)\}/g) ?? []).map(p => parseInt(p.replace(/[{}]/g, '')))
    const allIndexes = [...new Set([...arPlaceholders, ...enPlaceholders])]
    const maxIndex = allIndexes.length > 0 ? Math.max(...allIndexes) : -1

    if (maxIndex >= variables.length) {
      return `You used {${maxIndex}} in the body but only have ${variables.length} variable(s) defined`
    }
    return null
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setIsLoading(true)
    setError(null)

    const payload = {
      name,
      event_key: eventKey,
      body_ar: bodyAr,
      body_en: bodyEn,
      variables,
      is_active: isActive,
    }

    if (isEdit) {
      const result = await updateTemplate(template.id, payload)
      setIsLoading(false)
      if (!result.success) { setError(result.error ?? 'Something went wrong'); return }
      onSuccess({ ...template, ...payload })
    } else {
      const result = await createTemplate(payload)
      setIsLoading(false)
      if (!result.success) { setError(result.error ?? 'Something went wrong'); return }
      if (result.template) onSuccess(result.template)
    }
  }

  const previewBody = activePreviewLang === 'ar' ? bodyAr : bodyEn

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h2 className="text-xl font-black text-slate-800">
          {isEdit ? `Edit: ${template.name}` : 'Create New Template'}
        </h2>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

        {/* ── Left: Form ─────────────────────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-6">

          {/* Name + Event Key */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">
                Template Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Order Confirmation"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                Event Key <span className="text-red-400">*</span>
                {isSystemTemplate && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-bold">
                    locked
                  </span>
                )}
              </label>
              <input
                type="text"
                value={eventKey}
                readOnly={isEdit}
                onChange={e => setEventKey(e.target.value)}
                placeholder="e.g. order_placed"
                className={`w-full px-4 py-3 border rounded-2xl outline-none text-sm font-mono transition-all ${
                  isEdit
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-indigo-400'
                }`}
              />
            </div>
          </div>

          {/* Variables tag input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">
              Variables <span className="text-red-400">*</span>
            </label>
            <div
              className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl min-h-[52px] focus-within:border-indigo-400 cursor-text bg-gray-50 transition-colors"
              onClick={() => inputRef.current?.focus()}
            >
              {variables.map((v, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-mono border border-indigo-100"
                >
                  <span className="text-indigo-400 text-xs">{'{' + i + '}'}</span>
                  {v}
                  <button
                    type="button"
                    onClick={() => removeVariable(i)}
                    className="text-indigo-400 hover:text-indigo-700 ms-1 leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                value={variableInput}
                onChange={e => setVariableInput(e.target.value)}
                onKeyDown={handleVariableKeyDown}
                onBlur={addVariable}
                placeholder={variables.length === 0 ? 'Type variable name + Enter…' : ''}
                className="flex-1 min-w-[140px] outline-none text-sm bg-transparent"
              />
            </div>
            <p className="text-xs text-gray-400 ps-1">
              Press Enter or comma to add. Backspace to remove last. Variables become {'{0}'}, {'{1}'}… in the message body.
            </p>
          </div>

          {/* Arabic Body */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">
              Arabic Body <span className="text-red-400">*</span>
            </label>
            {variables.length > 0 && (
              <p className="text-xs text-gray-400 font-mono ps-1">
                {variables.map((v, i) => `{${i}} = ${v}`).join('  •  ')}
              </p>
            )}
            <textarea
              dir="rtl"
              rows={7}
              value={bodyAr}
              onChange={e => setBodyAr(e.target.value)}
              placeholder={'مرحباً {0} 👋\n\nتم تأكيد طلبك رقم {1}'}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm resize-none leading-relaxed transition-all"
            />
          </div>

          {/* English Body */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">
              English Body <span className="text-red-400">*</span>
            </label>
            {variables.length > 0 && (
              <p className="text-xs text-gray-400 font-mono ps-1">
                {variables.map((v, i) => `{${i}} = ${v}`).join('  •  ')}
              </p>
            )}
            <textarea
              rows={7}
              value={bodyEn}
              onChange={e => setBodyEn(e.target.value)}
              placeholder={'Hello {0} 👋\n\nYour order {1} has been confirmed!'}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm resize-none leading-relaxed transition-all"
            />
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="relative" onClick={() => setIsActive(a => !a)}>
              <div className={`w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-bold text-gray-700">Active</span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              {isEdit ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </div>

        {/* ── Right: Live Preview ─────────────────────────────────────────── */}
        <div className="xl:col-span-2">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-600">📱 Message Preview</p>
              <div className="flex gap-1">
                {(['ar', 'en'] as const).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setActivePreviewLang(l)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activePreviewLang === l
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {l === 'ar' ? 'Arabic' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp-style chat bubble */}
            <div className="bg-[#e5ddd5] rounded-2xl p-5 min-h-[200px]">
              <div className="flex justify-end">
                <div
                  className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-[85%]"
                  dir={activePreviewLang === 'ar' ? 'rtl' : 'ltr'}
                >
                  {previewBody ? (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {buildPreview(previewBody, variables)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Start typing to see preview…</p>
                  )}
                  <p className="text-right text-xs text-gray-400 mt-1.5">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </p>
                </div>
              </div>
            </div>

            {/* Variable hints */}
            {variables.length > 0 && (
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                <p className="text-xs font-bold text-gray-500 mb-2">Variable substitutions:</p>
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-indigo-500 w-8">{'{' + i + '}'}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-gray-600 font-medium">{getSampleValue(v)}</span>
                    <span className="text-gray-400">({v})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
