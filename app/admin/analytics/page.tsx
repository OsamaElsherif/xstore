import { getCurrentProfile } from '@/lib/actions/auth'
import { getSetting } from '@/lib/actions/settings'
import { getAdsOverview, getDailySpend } from '@/lib/actions/meta-analytics'
import { redirect } from 'next/navigation'
import AdsAnalytics from '@/components/admin/analytics/AdsAnalytics'
import NotConfigured from '@/components/admin/analytics/NotConfigured'

export default async function Page() {
  const profile = await getCurrentProfile()
  
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/admin')
  }

  const token = await getSetting('meta_access_token')
  const accountId = await getSetting('meta_ad_account_id')

  if (!token || !accountId) {
    return <NotConfigured />
  }

  const [overviewResult, dailySpendResult] = await Promise.all([
    getAdsOverview('last_30d'),
    getDailySpend('last_30d')
  ])

  if (!overviewResult.success || !overviewResult.data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-600">
          <h2 className="text-xl font-bold mb-2">Meta API Error</h2>
          <p>{overviewResult.error || 'Failed to fetch ads data'}</p>
          <a href="/admin/settings" className="inline-block mt-4 text-sm font-bold underline">Check Settings</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <AdsAnalytics 
        initialOverview={overviewResult.data}
        initialDailySpend={dailySpendResult.data || []}
        currency={overviewResult.data.currency}
      />
    </div>
  )
}
