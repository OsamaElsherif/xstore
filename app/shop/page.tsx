import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopPage from '@/components/shop/ShopPage';
import { getAllProductsForShop } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';

export const metadata = {
  title: 'Shop — XStore',
  description: 'Browse all products at XStore. Filter by category, price, and more.',
};

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    q?: string
    page?: string
  }>
}) {
  const params = await searchParams;

  const options = {
    categorySlug: params.category || undefined,
    sortBy: (params.sort as 'newest' | 'price_asc' | 'price_desc' | 'rating') || undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    inStockOnly: params.inStock === 'true' || undefined,
    searchQuery: params.q || undefined,
    page: params.page ? Number(params.page) : 1,
  };

  const [shopData, categories] = await Promise.all([
    getAllProductsForShop(options),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <ShopPage
        initialProducts={shopData.products}
        categories={categories}
        totalCount={shopData.totalCount}
        totalPages={shopData.totalPages}
        currentPage={shopData.currentPage}
        currentFilters={{
          categorySlug: options.categorySlug,
          sortBy: options.sortBy,
          minPrice: options.minPrice,
          maxPrice: options.maxPrice,
          inStockOnly: options.inStockOnly,
          searchQuery: options.searchQuery,
        }}
      />
      <Footer />
    </main>
  );
}
