import { getSettings } from '@/lib/actions/settings'
import { getTemplateByEvent } from '@/lib/actions/whatsapp-templates'
import { toE164Egypt } from '@/lib/utils/phone'
import { EventKey } from '@/types'

type SendWhatsAppOptions = {
  to: string           // phone number e.g. "201012345678"
  eventKey: EventKey   // which template to use
  variables: string[]  // ordered values matching template.variables
  locale?: 'ar' | 'en' // which language body to use, default 'ar'
}

export async function sendWhatsAppMessage(
  options: SendWhatsAppOptions
): Promise<void> {
  // 1. Read Wasender Session API Key from DB settings
  const settings = await getSettings(['wasender_api_key'])
  const apiKey = settings.wasender_api_key

  // Silently skip if not configured — never crash the main flow
  if (!apiKey) {
    console.warn(`Wasender not configured — skipping message to ${options.to}`)
    return
  }

  // 2. Fetch the active template for this event
  const template = await getTemplateByEvent(options.eventKey)
  if (!template) {
    console.warn(`No active template found for event: ${options.eventKey}`)
    return
  }

  // 3. Build the message body by replacing {0}, {1}, {2}... with variables
  const bodyTemplate = options.locale === 'en' ? template.body_en : template.body_ar
  const messageBody = options.variables.reduce(
    (body, value, index) => body.replaceAll(`{${index}}`, value),
    bodyTemplate
  )

  // 4. Format phone to E.164 — Wasender requires a leading "+"
  const phone = toE164Egypt(options.to)

  // 5. Send via Wasender send-message endpoint
  try {
    const response = await fetch('https://www.wasenderapi.com/api/send-message', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: phone, text: messageBody }),
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      console.error('Wasender send failed:', result)
    }
  } catch (e) {
    console.error('Wasender network error:', e)
  }
}
