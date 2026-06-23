import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  setFilter,
  resetFilters,
  setSort,
  setPage,
} from '../features/catalog/catalogSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Star, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { ProductGender, ProductSize } from '../constants/enums';
import { toast } from 'react-hot-toast';
import { getOptimizedImageUrl } from '../utils/image-optimizer';

// Helper to determine price range of a product
const getPriceRange = (product: any) => {
  if (!product.variants || product.variants.length === 0) return '₹0';
  const prices = product.variants.map((v: any) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
};

export const ProductListing: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    categories,
    brands,
    loading,
    filters,
    sort,
    pagination,
  } = useAppSelector((state) => state.catalog);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(filters.keyword);

  const isWishlisted = (id: string) => wishlistItems.some((item) => item._id === id);

  const handleToggleWishlist = (product: any) => {
    const wasWishlisted = isWishlisted(product._id);
    dispatch(toggleWishlist(product));
    toast.success(wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, filters, sort, pagination.page]);

  const handleFilterChange = (key: any, value: any) => {
    dispatch(setFilter({ key, value }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ key: 'keyword', value: searchVal }));
  };

  const handleReset = () => {
    setSearchVal('');
    dispatch(resetFilters());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
            Explore Collection
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {pagination.total} premium items found
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              placeholder="Search items..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            <select
              value={sort}
              onChange={(e) => dispatch(setSort(e.target.value))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-accent transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="ratings">Customer Rating</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-semibold bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0 bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Filters</h2>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-brand-accent hover:text-brand-accent/80 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</h3>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Brand</h3>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="">All Brands</option>
              {brands.map((br) => (
                <option key={br._id} value={br.slug}>
                  {br.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gender</h3>
            <div className="flex flex-col gap-2">
              {['', 'men', 'women', 'unisex', 'kids'].map((gen) => (
                <label key={gen} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.gender === gen}
                    onChange={() => handleFilterChange('gender', gen)}
                    className="accent-brand-accent"
                  />
                  <span>{gen ? gen.charAt(0).toUpperCase() + gen.slice(1) : 'All Genders'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleFilterChange('size', filters.size === sz ? '' : sz)}
                  className={`py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ₹{
                    filters.size === sz
                      ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                      : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Price Range (₹)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>
        </aside>

        {/* Products Grid & Results */}
        <div className="flex-1 space-y-8">
          {loading ? (
            // Skeleton Loading State
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-1/3" variant="text" />
                    <Skeleton className="h-5 w-2/3" variant="text" />
                    <Skeleton className="h-4 w-1/4" variant="text" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            // Empty State
            <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <SlidersHorizontal className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No products found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                We couldn't find matches matching your filter selection. Try adjusting filters or searching something else.
              </p>
              <button
                onClick={handleReset}
                className="mt-6 px-4 py-2 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            // Products List
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const discount = prod.variants[0]?.originalPrice 
                  ? Math.round(100 - (prod.variants[0].price / prod.variants[0].originalPrice) * 100)
                  : 0;

                return (
                  <Link
                    key={prod._id}
                    to={ROUTES.PRODUCT_DETAILS(prod.slug)}
                    className="group flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
                  >
                    {/* Image Box */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-4">
                      {prod.images && prod.images[0] ? (
                        <img
                          src={getOptimizedImageUrl(prod.images[0], 400)}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No Image
                        </div>
                      )}

                      {/* Badges */}
                      {discount > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                          {discount}% OFF
                        </span>
                      )}

                      {/* Wishlist Button Overlay */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleWishlist(prod);
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-rose-50 transition-all text-slate-500 hover:text-rose-500 z-10 cursor-pointer"
                        title={isWishlisted(prod._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart className={`h-4 w-4 ₹{isWishlisted(prod._id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                      </button>
                    </div>

                    {/* Meta info */}
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      {prod.brand?.name}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-accent transition-colors line-clamp-1 mt-0.5">
                      {prod.name}
                    </h3>
                    
                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold">{prod.averageRating || 'New'}</span>
                      <span className="text-slate-400 text-xs">({prod.numReviews || 0})</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                      <span className="font-black text-slate-900 dark:text-white text-base">
                        {getPriceRange(prod)}
                      </span>
                      {prod.variants[0]?.originalPrice && prod.variants[0].originalPrice > prod.variants[0].price && (
                        <span className="text-xs text-slate-400 line-through">₹{prod.variants[0].originalPrice}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Component */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={pagination.page === 1}
                onClick={() => dispatch(setPage(pagination.page - 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, pageIdx) => {
                const p = pageIdx + 1;
                return (
                  <button
                    key={p}
                    onClick={() => dispatch(setPage(p))}
                    className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer ₹{
                      pagination.page === p
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => dispatch(setPage(pagination.page + 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slider Overlay Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <aside className="relative flex flex-col w-full max-w-xs ml-auto h-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-black text-lg text-slate-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</h3>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Brand</h3>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="">All Brands</option>
                {brands.map((br) => (
                  <option key={br._id} value={br.slug}>
                    {br.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gender</h3>
              <div className="flex flex-col gap-2">
                {['', 'men', 'women', 'unisex', 'kids'].map((gen) => (
                  <label key={gen} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="radio"
                      name="gender-mobile"
                      checked={filters.gender === gen}
                      onChange={() => handleFilterChange('gender', gen)}
                      className="accent-brand-accent"
                    />
                    <span>{gen ? gen.charAt(0).toUpperCase() + gen.slice(1) : 'All Genders'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleFilterChange('size', filters.size === sz ? '' : sz)}
                    className={`py-1.5 border rounded-lg text-xs font-bold transition-all ₹{
                      filters.size === sz
                        ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                        : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Price Range (₹)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                handleReset();
                setMobileFiltersOpen(false);
              }}
              className="w-full text-sm mt-4"
            >
              Reset Filters
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
