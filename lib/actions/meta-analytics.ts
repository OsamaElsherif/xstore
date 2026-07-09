import { getSettings } from '@/lib/actions/settings'

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7d'
  | 'last_30d'
  | 'this_month'
  | 'last_month'

export type CampaignInsight = {
  campaign_id: string
  campaign_name: string
  status: string
  impressions: number
  clicks: number
  spend: number
  reach: number
  ctr: number           // click-through rate
  cpc: number           // cost per click
  cpp: number           // cost per 1000 impressions (CPM)
  conversions: number
}

export type AccountOverview = {
  account_name: string
  currency: string
  total_spend: number
  total_impressions: number
  total_clicks: number
  total_reach: number
  average_ctr: number
  conversions: number
  campaigns: CampaignInsight[]
}

// Fetch account-level overview + campaign breakdown
export async function getAdsOverview(
  datePreset: DatePreset = 'last_30d'
): Promise<{ success: boolean; data?: AccountOverview; error?: string }> {
  const settings = await getSettings([
    'meta_access_token',
    'meta_ad_account_id',
  ])

  if (!settings.meta_access_token || !settings.meta_ad_account_id) {
    return { success: false, error: 'Meta credentials not configured' } as any
  }

  const token = settings.meta_access_token
  const accountId = settings.meta_ad_account_id
  const fields = 'impressions,clicks,spend,reach,ctr,cpc,cpp,actions'

  try {
    // Account-level insights
    const accountRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/insights` +
      `?fields=${fields}&date_preset=${datePreset}&access_token=${token}`
    )
    const accountData = await accountRes.json()
    if (accountData.error) return { success: false, error: accountData.error.message }

    // Campaign-level insights
    const campaignRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/campaigns` +
      `?fields=name,status,insights{${fields}}&date_preset=${datePreset}&access_token=${token}`
    )
    const campaignData = await campaignRes.json()

    // Account name
    const nameRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}?fields=name,currency&access_token=${token}`
    )
    const nameData = await nameRes.json()

    const insight = accountData.data?.[0] ?? {}
    const conversions = insight.actions?.find(
      (a: any) => a.action_type === 'purchase'
    )?.value ?? 0

    const campaigns: CampaignInsight[] = (campaignData.data ?? []).map(
      (c: any) => {
        const ci = c.insights?.data?.[0] ?? {}
        return {
          campaign_id: c.id,
          campaign_name: c.name,
          status: c.status,
          impressions: Number(ci.impressions ?? 0),
          clicks: Number(ci.clicks ?? 0),
          spend: Number(ci.spend ?? 0),
          reach: Number(ci.reach ?? 0),
          ctr: Number(ci.ctr ?? 0),
          cpc: Number(ci.cpc ?? 0),
          cpp: Number(ci.cpp ?? 0),
          conversions: Number(
            ci.actions?.find((a: any) => a.action_type === 'purchase')?.value ?? 0
          ),
        }
      }
    )

    return {
      success: true,
      data: {
        account_name: nameData.name ?? 'Unknown',
        currency: nameData.currency ?? 'EGP',
        total_spend: Number(insight.spend ?? 0),
        total_impressions: Number(insight.impressions ?? 0),
        total_clicks: Number(insight.clicks ?? 0),
        total_reach: Number(insight.reach ?? 0),
        average_ctr: Number(insight.ctr ?? 0),
        conversions: Number(conversions),
        campaigns,
      },
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// Fetch daily spend data for chart (last 30 days)
export async function getDailySpend(
  datePreset: DatePreset = 'last_30d'
): Promise<{ success: boolean; data?: { date: string; spend: number }[]; error?: string }> {
  const settings = await getSettings([
    'meta_access_token',
    'meta_ad_account_id',
  ])

  if (!settings.meta_access_token || !settings.meta_ad_account_id) {
    return { success: false, error: 'Meta credentials not configured' }
  }

  const token = settings.meta_access_token
  const accountId = settings.meta_ad_account_id

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/insights` +
      `?fields=spend&time_increment=1&date_preset=${datePreset}&access_token=${token}`
    )
    const data = await res.json()
    if (data.error) return { success: false, error: data.error.message }

    return {
      success: true,
      data: (data.data ?? []).map((d: any) => ({
        date: d.date_start,
        spend: Number(d.spend ?? 0),
      })),
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
