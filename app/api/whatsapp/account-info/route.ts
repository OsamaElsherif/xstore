import { NextResponse } from 'next/server'
import { getWasenderAccountInfo } from '@/lib/actions/settings'

/**
 * GET /api/whatsapp/account-info
 * Returns the connected WhatsApp phone number via Wasender.
 */
export async function GET() {
  const { phoneNumber } = await getWasenderAccountInfo()
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Not connected or not configured' }, { status: 400 })
  }
  return NextResponse.json({ phoneNumber })
}
