"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit, DollarSign, Check, X, Search } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Product Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("WEIGHT");
  const [priceRupees, setPriceRupees] = useState("");
  const [variantName, setVariantName] = useState("1 kg Pack");
  const [quantityValue, setQuantityValue] = useState("1000");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts(d.products || []);
      }
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.categories || []);
        if (c.categories?.length) setCategoryId(c.categories[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStock = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle-availability`, {
        method: "POST",
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch {
      alert("Error toggling stock");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          categoryId,
          description,
          productType,
          priceMinor: Math.round(parseFloat(priceRupees) * 100),
          variantName,
          quantityValue: parseInt(quantityValue, 10),
          imageUrl: imageUrl || undefined,
        }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setName("");
        setSlug("");
        setDescription("");
        setPriceRupees("");
        setImageUrl("");
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create product");
      }
    } catch {
      alert("Error creating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Products Catalog
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Manage your cuts, chicken portions, eggs, beverages, and daily prices.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="text-xs self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add New Product</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
        <input
          type="text"
          placeholder="Filter by product or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-amberGold-400"
        />
      </div>

      {/* Products Table */}
      <div className="bg-cream-50 rounded-2xl border border-cream-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-100/50 text-[11px] uppercase text-charcoal-500 font-semibold">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Variants / Price</th>
                  <th className="py-3 px-4 text-center">In-Stock Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredProducts.map((p) => {
                  const firstVariant = p.variants[0];
                  const priceRs = firstVariant ? (firstVariant.priceMinor / 100).toFixed(0) : "0";

                  return (
                    <tr key={p.id} className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0 border border-cream-200">
                            {p.imageUrl ? (
                              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-charcoal-400">
                                None
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-charcoal-800 text-sm">{p.name}</p>
                            <p className="text-[10px] text-charcoal-400 font-mono">/{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-charcoal-600 font-medium">
                        {p.category?.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cream-200 text-charcoal-700">
                          {p.productType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold font-mono text-sm text-charcoal-800 block">
                          ₹{priceRs}
                        </span>
                        <span className="text-[10px] text-charcoal-400">
                          {firstVariant?.name} ({p.variants.length} variant{p.variants.length > 1 ? "s" : ""})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStock(p.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                            p.isAvailable
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300"
                          }`}
                        >
                          {p.isAvailable ? "IN STOCK" : "OUT OF STOCK"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Product"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fresh Chicken Curry Cut 1kg"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                }}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                required
                placeholder="e.g. chicken-curry-cut-1kg"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Product Type
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none"
              >
                <option value="WEIGHT">WEIGHT (Grams/Kg)</option>
                <option value="PIECE">PIECE (Per Piece/Pack)</option>
                <option value="FIXED">FIXED (Beverage / Unit)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Variant Name
              </label>
              <input
                type="text"
                required
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Meat Weight / Value (g)
              </label>
              <input
                type="number"
                required
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Price (₹ Rupees)
              </label>
              <input
                type="number"
                required
                placeholder="250"
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl text-charcoal-700 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full"
            >
              Save Product to Catalog
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
