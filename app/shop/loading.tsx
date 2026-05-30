export default function ShopLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      {/* Navbar skeleton */}
      <div className="bg-brand-dark h-16 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 w-32 bg-brand-gray/30 rounded-lg animate-pulse" />
          <div className="h-5 w-48 bg-brand-gray/20 rounded animate-pulse" />
        </div>

        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-brand-gray/20 p-6 space-y-4">
              <div className="h-5 w-24 bg-brand-gray/30 rounded animate-pulse" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-brand-gray/20 animate-pulse" />
                  <div className="h-4 w-28 bg-brand-gray/20 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-brand-gray/20 p-6 space-y-4">
              <div className="h-5 w-28 bg-brand-gray/30 rounded animate-pulse" />
              <div className="flex gap-3">
                <div className="h-10 flex-1 bg-brand-gray/20 rounded-lg animate-pulse" />
                <div className="h-10 flex-1 bg-brand-gray/20 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-brand-gray/20 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-brand-gray/20 animate-pulse" />
                <div className="h-4 w-24 bg-brand-gray/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-11 w-full bg-brand-gray/30 rounded-xl animate-pulse" />
              <div className="h-11 w-full bg-brand-gray/20 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="flex-1">
            {/* Sort bar skeleton */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-10 w-40 bg-brand-gray/20 rounded-lg animate-pulse" />
              <div className="flex gap-2">
                <div className="h-10 w-10 bg-brand-gray/20 rounded-lg animate-pulse" />
                <div className="h-10 w-10 bg-brand-gray/20 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-brand-gray/20 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-brand-gray/20" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-16 bg-brand-gray/20 rounded" />
                    <div className="h-4 w-3/4 bg-brand-gray/30 rounded" />
                    <div className="h-4 w-1/2 bg-brand-gray/20 rounded" />
                    <div className="h-10 w-full bg-brand-gray/20 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
