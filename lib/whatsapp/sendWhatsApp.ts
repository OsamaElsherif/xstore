import { getSettings } from '@/lib/actions/settings'

type WhatsAppTemplateMessage = {
  to: string           // phone number with country code e.g. "201012345678"
  templateKey:         // which template setting key to read
    | 'whatsapp_template_order'
    | 'whatsapp_template_maintenance'
    | 'whatsapp_template_status'
    | 'whatsapp_template_credentials'
  parameters: string[] // ordered list of {{1}}, {{2}} template variables
}

export async function sendWhatsAppMessage(
  msg: WhatsAppTemplateMessage
): Promise<void> {
  // Read credentials from DB settings
  const settings = await getSettings([
    'whatsapp_phone_number_id',
    'whatsapp_access_token',
    'whatsapp_template_language',
    msg.templateKey,
  ])

  const phoneId = settings.whatsapp_phone_number_id
  const token = settings.whatsapp_access_token
  const templateName = settings[msg.templateKey]
  const language = settings.whatsapp_template_language ?? 'ar'

  // Silently skip if not configured — never crash the main flow
  if (!phoneId || !token || !templateName) {
    console.warn(`WhatsApp not configured — skipping message to ${msg.to}`)
    return
  }

  // Sanitize phone number — remove spaces, dashes, leading +
  const phone = msg.to.replace(/[\s\-+]/g, '')

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            components: [
              {
                type: 'body',
                parameters: msg.parameters.map(p => ({
                  type: 'text',
                  text: p,
                })),
              },
            ],
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      console.error('WhatsApp send failed:', err.error?.message)
    }
  } catch (e) {
    console.error('WhatsApp network error:', e)
  }
}
