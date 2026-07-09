'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  MousePointer2, 
  Eye, 
  DollarSign, 
  Target, 
  Calendar,
  Loader2,
  RefreshCcw,
  ExternalLink
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { AccountOverview, DatePreset, getAdsOverview, getDailySpend } from '@/lib/actions/meta-analytics'

interface AdsAnalyticsProps {
  initialOverview: AccountOverview
  initialDailySpend: { date: string; spend: number }[]
  currency: string
}

export default function AdsAnalytics({ initialOverview, initialDailySpend, currency }: AdsAnalyticsProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d')
  const [overview, setOverview] = useState(initialOverview)
  const [dailySpend, setDailySpend] = useState(initialDailySpend)
  const [isLoading, setIsLoading] = useState(false)

  const handleDateChange = async (preset: DatePreset) => {
    setDatePreset(preset)
    setIsLoading(true)
    try {
      const [overRes, spendRes] = await Promise.all([
        getAdsOverview(preset),
        getDailySpend(preset)
      ])
      if (overRes.success && overRes.data) setOverview(overRes.data)
      if (spendRes.success && spendRes.data) setDailySpend(spendRes.data)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = [
    { label: 'Total Spend', value: `${currency} ${overview.total_spend.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Impressions', value: overview.total_impressions.toLocaleString(), icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Clicks', value: overview.total_clicks.toLocaleString(), icon: MousePointer2, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'CTR', value: `${overview.average_ctr.toFixed(2)}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Reach', value: overview.total_reach.toLocaleString(), icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Conversions', value: overview.conversions.toLocaleString(), icon: BarChart3, color: 'text-pink-600', bg: 'bg-pink-50' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Ads Analytics</h1>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full tracking-widest">
              Live from Meta
            </div>
          </div>
          <p className="text-gray-500 font-medium">{overview.account_name}</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm self-start">
          {(['last_7d', 'last_30d', 'this_month'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => handleDateChange(preset)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                datePreset === preset 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {preset.replace('_', ' ').toUpperCase()}
            </button>
          ))}
          <button 
            onClick={() => handleDateChange(datePreset)} 
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-gray-800 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Daily Spend Trend</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Advertising investment over time</p>
          </div>
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
            <Calendar size={16} />
            <span className="text-xs font-black uppercase tracking-widest">{datePreset.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="h-[350px] w-full pt-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-3xl animate-pulse">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySpend}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }}
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }}
                  tickFormatter={(val) => `${currency} ${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '16px', 
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSpend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Campaign Breakdown</h2>
          <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
            Meta Ads Manager
            <ExternalLink size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Spend</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Impressions</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">CTR</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">CPC</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Conv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overview.campaigns.map((camp) => (
                <tr key={camp.campaign_id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{camp.campaign_name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">ID: {camp.campaign_id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      camp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      camp.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-sm text-gray-800">
                    {currency} {camp.spend.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right text-sm text-gray-500 font-medium">
                    {camp.impressions.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right text-sm text-gray-800 font-bold">
                    {camp.ctr.toFixed(2)}%
                  </td>
                  <td className="px-8 py-6 text-right text-sm text-gray-500 font-medium">
                    {currency} {camp.cpc.toFixed(2)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 rounded-lg text-sm font-black">
                      {camp.conversions}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {overview.campaigns.length === 0 && (
            <div className="p-12 text-center text-gray-400 font-bold">
              No active campaigns found for this period.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
