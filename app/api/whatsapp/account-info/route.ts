import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/actions/settings'

export async function GET() {
  const settings = await getSettings([
    'greenapi_instance_id',
    'greenapi_api_token',
  ])

  if (!settings.greenapi_instance_id || !settings.greenapi_api_token) {
    return NextResponse.json({ error: 'Not configured' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.green-api.com/waInstance${settings.greenapi_instance_id}` +
      `/getWaSettings/${settings.greenapi_api_token}`
    )
    const data = await res.json()
    // data.wid = "201012345678@c.us" — strip @c.us for display
    const phoneNumber = data.wid?.replace('@c.us', '') ?? null
    return NextResponse.json({ wid: phoneNumber })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch account info' }, { status: 500 })
  }
}
