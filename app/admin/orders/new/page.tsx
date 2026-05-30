import { getCurrentProfile } from '@/lib/actions/auth';
import { getAdminProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { redirect } from 'next/navigation';
import CreateOrderForm from '@/components/admin/orders/CreateOrderForm';

export default async function NewOrderPage() {
  const profile = await getCurrentProfile();
  
  if (!profile || !['ADMIN', 'CASHIER'].includes(profile.role)) {
    redirect('/admin');
  }

  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getCategories()
  ]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Order</h1>
        <p className="text-gray-500 font-medium">Add a new manual order on behalf of a customer.</p>
      </div>
      
      <CreateOrderForm products={products} categories={categories} />
    </div>
  );
}
