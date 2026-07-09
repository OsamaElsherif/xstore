export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full space-y-12 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>

        {/* Banner skeleton */}
        <div className="h-64 md:h-80 rounded-3xl bg-gray-200" />

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="h-6 w-20 bg-gray-200 rounded" />
            <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Products skeleton */}
          <div className="flex-1 space-y-8">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-40 bg-gray-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                    <div className="h-12 w-full bg-gray-200 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
