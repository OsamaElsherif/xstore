'use client';

import { useState, useEffect } from 'react';
import { SubSubcategory, Product } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { assignProductsToSubSubcategory, removeProductFromSubSubcategory } from '@/lib/actions/sub-subcategories';
import { Search, Loader2, Plus, Minus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SubSubcategoryProductsPanelProps {
  subSubcategory: SubSubcategory;
  onClose: () => void;
}

export default function SubSubcategoryProductsPanel({ subSubcategory, onClose }: SubSubcategoryProductsPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('subcategory_id', subSubcategory.subcategory_id)
        .order('name_en');
      
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [subSubcategory.subcategory_id]);

  const handleAssign = async (productId: string) => {
    setActionId(productId);
    try {
      const res = await assignProductsToSubSubcategory(subSubcategory.id, [productId]);
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, sub_subcategory_id: subSubcategory.id } : p));
      } else {
        alert(res.error || 'Failed to assign product');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setActionId(productId);
    try {
      const res = await removeProductFromSubSubcategory(productId);
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, sub_subcategory_id: null } : p));
      } else {
        alert(res.error || 'Failed to remove product');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setActionId(null);
    }
  };

  const assignedProducts = products.filter(p => p.sub_subcategory_id === subSubcategory.id);
  const availableProducts = products.filter(
    p => p.sub_subcategory_id !== subSubcategory.id && 
    (p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.name_ar.includes(searchQuery))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Assigned Products */}
        <div className="flex flex-col bg-gray-50 rounded-xl p-4 border border-gray-150 h-[50vh]">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
            <span>Assigned Products</span>
            <span className="px-2 py-0.5 bg-indigo-150 text-indigo-700 rounded-full text-xs">
              {assignedProducts.length}
            </span>
          </h4>

          <div className="flex-1 overflow-y-auto space-y-2">
            {assignedProducts.length > 0 ? (
              assignedProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:shadow-sm transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{product.name_en}</p>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{product.id}</p>
                    <p className="text-xs text-indigo-600 font-bold mt-1">EGP {product.price.toLocaleString()}</p>
                  </div>
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleRemove(product.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors ms-4 flex-shrink-0 disabled:opacity-50"
                    title="Remove assignment"
                  >
                    {actionId === product.id ? <Loader2 className="animate-spin" size={16} /> : <Minus size={16} />}
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <p className="text-sm italic">No products assigned to this series yet.</p>
                <p className="text-xs mt-1">Assign products from the list on the right.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Available Products */}
        <div className="flex flex-col bg-gray-50 rounded-xl p-4 border border-gray-150 h-[50vh]">
          <h4 className="text-sm font-bold text-gray-700 mb-3">
            Available Products (Parent Subcategory)
          </h4>

          {/* Search bar */}
          <div className="relative mb-3 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search available products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {availableProducts.length > 0 ? (
              availableProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:shadow-sm transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-800 truncate">{product.name_en}</p>
                      {product.sub_subcategory_id && (
                        <span className="bg-amber-50 text-amber-700 text-[9px] px-1 rounded font-bold border border-amber-100 flex-shrink-0">
                          In other series
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{product.id}</p>
                    <p className="text-xs text-indigo-600 font-bold mt-1">EGP {product.price.toLocaleString()}</p>
                  </div>
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleAssign(product.id)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ms-4 flex-shrink-0 disabled:opacity-50"
                    title="Assign to series"
                  >
                    {actionId === product.id ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <p className="text-sm italic">No available products found.</p>
                <p className="text-xs mt-1">Make sure products exist in this subcategory.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Link
          href="/admin/products"
          target="_blank"
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-bold"
          onClick={onClose}
        >
          Create new product in products manager
          <ExternalLink size={12} />
        </Link>

        <button
          onClick={onClose}
          className="px-5 py-2 bg-gray-800 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
