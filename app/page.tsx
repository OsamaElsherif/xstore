import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';
import HomeClient from '@/components/HomeClient';
import { getFeaturedProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <Hero />
      <Categories categories={categories} />
      
      <HomeClient 
        featuredProducts={featuredProducts} 
        categories={categories} 
      />

      <Footer />
    </main>
  );
}
