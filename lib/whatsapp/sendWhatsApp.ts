import { getSettings } from '@/lib/actions/settings'
import { getTemplateByEvent } from '@/lib/actions/whatsapp-templates'
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
  // 1. Read Green API credentials from DB settings
  const settings = await getSettings([
    'greenapi_instance_id',
    'greenapi_api_token',
  ])

  const instanceId = settings.greenapi_instance_id
  const apiToken = settings.greenapi_api_token

  // Silently skip if not configured — never crash the main flow
  if (!instanceId || !apiToken) {
    console.warn(`Green API not configured — skipping message to ${options.to}`)
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

  // 4. Format phone number → Green API requires "{countryCode}{number}@c.us"
  const chatId = options.to.replace(/[\s\-+]/g, '') + '@c.us'

  // 5. Send via Green API sendMessage endpoint
  try {
    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message: messageBody }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Green API send failed:', err)
    }
  } catch (e) {
    console.error('Green API network error:', e)
  }
}
