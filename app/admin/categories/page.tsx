import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import CategoriesManager from '@/components/admin/categories/CategoriesManager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function Page() {
  const profile = await getCurrentProfile()
  
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/admin')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count), subcategories(*)')
    .order('name_en')

  if (error) {
    console.error('Error fetching categories:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
          </div>
        </div>
        
        <CategoriesManager initialCategories={data || []} />
      </div>
    </div>
  )
}
