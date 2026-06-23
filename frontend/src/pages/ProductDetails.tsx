import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchProductBySlug, fetchRelatedProducts } from '../features/catalog/catalogSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { fetchReviewSummary } from '../features/ai/aiSlice';
import { fetchProductReviews } from '../features/review/reviewSlice';
import { fetchProductQuestions } from '../features/qa/qaSlice';
import RatingStats from '../components/reviews/RatingStats';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';
import QuestionList from '../components/qa/QuestionList';
import { Star, Shield, ArrowLeft, ShoppingBag, Heart, Check, HelpCircle, Scale, MessageSquare, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../constants';
import Skeleton from '../components/ui/Skeleton';
import { Review } from '../types';
import { getOptimizedImageUrl } from '../utils/image-optimizer';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { product, relatedProducts, loading, error } = useAppSelector((state) => state.catalog);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  
  // Review selectors
  const { reviews, distribution, loading: reviewsLoading, pagination } = useAppSelector((state) => state.review);
  const { reviewSummary, reviewSummaryLoading } = useAppSelector((state) => state.ai);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Q&A selectors
  const { questions, pagination: qaPagination, loading: qaLoading } = useAppSelector((state) => state.qa);

  // User selections state
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');

  // Local state for comparison
  const [isInCompare, setIsInCompare] = useState<boolean>(false);

  // Local state for reviews filtering & form
  const [reviewFilters, setReviewFilters] = useState<{
    sort: 'newest' | 'helpful' | 'ratingHigh' | 'ratingLow';
    rating: number;
    verifiedOnly: boolean;
  }>({
    sort: 'newest',
    rating: 0,
    verifiedOnly: false,
  });
  const [reviewPage, setReviewPage] = useState<number>(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  // Local state for Q&A System
  const [activeTab, setActiveTab] = useState<'reviews' | 'qa'>('reviews');
  const [qaPage, setQaPage] = useState<number>(1);
  const [qaSearch, setQaSearch] = useState<string>('');

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
  }, [dispatch, slug]);

  // Once product details load, set default selections & query related products
  useEffect(() => {
    if (product) {
      // Find all unique sizes and colors in variants
      const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];
      const colors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[];

      if (sizes.length > 0) setSelectedSize(sizes[0]);
      if (colors.length > 0) setSelectedColor(colors[0]);

      // Set active preview image
      if (product.images && product.images[0]) {
        setActiveImage(product.images[0]);
      } else if (product.variants[0]?.images && product.variants[0].images[0]) {
        setActiveImage(product.variants[0].images[0]);
      }

      dispatch(fetchRelatedProducts(product._id));
      
      // Check if product is in compare list
      const slugs = JSON.parse(localStorage.getItem('styleai_compare_slugs') || '[]');
      setIsInCompare(slugs.includes(product.slug));
    }
  }, [product, dispatch]);

  // Fetch reviews when product or reviewFilters/reviewPage change
  useEffect(() => {
    if (product) {
      dispatch(
        fetchProductReviews({
          productId: product._id,
          params: {
            page: reviewPage,
            limit: 5,
            sort: reviewFilters.sort,
            rating: reviewFilters.rating || undefined,
            verifiedOnly: reviewFilters.verifiedOnly,
          },
        })
      );
    }
  }, [product, reviewFilters, reviewPage, dispatch]);

  // Fetch questions when product or qaPage/qaSearch change
  useEffect(() => {
    if (product) {
      dispatch(
        fetchProductQuestions({
          productId: product._id,
          params: {
            page: qaPage,
            limit: 5,
            search: qaSearch || undefined,
          },
        })
      );
    }
  }, [product, qaPage, qaSearch, dispatch]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <Skeleton className="h-6 w-1/4" variant="text" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" variant="text" />
            <Skeleton className="h-10 w-2/3" variant="text" />
            <Skeleton className="h-6 w-1/4" variant="text" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <HelpCircle className="h-16 w-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-slate-500 text-sm">
          {error || 'The product you are looking for does not exist or has been removed.'}
        </p>
        <Link
          to={ROUTES.PRODUCTS}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to catalog</span>
        </Link>
      </div>
    );
  }

  // Identify all unique sizes and colors available
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];
  const availableColors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[];

  // Find variant matching current selections
  const matchingVariant = product.variants.find((v) => {
    const sizeMatches = !selectedSize || v.size === selectedSize;
    const colorMatches = !selectedColor || v.color === selectedColor;
    return sizeMatches && colorMatches;
  }) || product.variants[0];

  const price = matchingVariant?.price || 0;
  const originalPrice = matchingVariant?.originalPrice;
  const stock = matchingVariant?.stock || 0;

  const discount = originalPrice && originalPrice > price 
    ? Math.round(100 - (price / originalPrice) * 100)
    : 0;

  const isWishlisted = product ? wishlistItems.some((item) => item._id === product._id) : false;

  const handleAddToCart = () => {
    if (stock === 0) {
      toast.error('This variant is currently out of stock');
      return;
    }
    
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        sku: matchingVariant.sku,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        price,
        originalPrice,
        image: activeImage || product.images[0] || undefined,
        quantity: 1,
        stock,
      })
    );
    toast.success(`${product.name} (${selectedSize} / ₹{selectedColor}) added to bag!`);
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCompare = () => {
    if (!product) return;
    const slugs = JSON.parse(localStorage.getItem('styleai_compare_slugs') || '[]');
    if (slugs.includes(product.slug)) {
      const updated = slugs.filter((s: string) => s !== product.slug);
      localStorage.setItem('styleai_compare_slugs', JSON.stringify(updated));
      setIsInCompare(false);
      toast.success('Removed from comparison list');
    } else {
      if (slugs.length >= 3) {
        toast.error('You can compare a maximum of 3 products at a time');
        return;
      }
      slugs.push(product.slug);
      localStorage.setItem('styleai_compare_slugs', JSON.stringify(slugs));
      setIsInCompare(true);
      toast.success('Added to comparison list! Go to /compare to view');
    }
  };

  const handleReviewSuccess = () => {
    if (slug && product) {
      dispatch(fetchProductBySlug(slug));
      dispatch(
        fetchProductReviews({
          productId: product._id,
          params: {
            page: 1,
            limit: 5,
            sort: reviewFilters.sort,
            rating: reviewFilters.rating || undefined,
            verifiedOnly: reviewFilters.verifiedOnly,
          },
        })
      );
    }
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleEditReviewClick = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
    setTimeout(() => {
      const formElement = document.getElementById('review-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSummarizeReviews = () => {
    if (!product) return;
    dispatch(fetchReviewSummary(product._id));
  };

  // Build a list of all images (root images + variant images combined)
  const allImages = Array.from(
    new Set([
      ...(product.images || []),
      ...product.variants.flatMap((v) => v.images || [])
    ])
  ).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        to={ROUTES.PRODUCTS}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-accent transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to collection</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
        {/* Left Column: Image Box & Swatches */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {activeImage ? (
              <img
                src={getOptimizedImageUrl(activeImage, 800)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                No Preview Available
              </div>
            )}
            
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-xl shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative flex-shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 bg-slate-50 transition-all cursor-pointer ₹{
                    activeImage === img ? 'border-brand-accent shadow-sm' : 'border-transparent'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img, 150)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Meta details, pricing and buttons */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-bold tracking-widest text-brand-accent uppercase">
              {product.brand?.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            
            {/* Reviews / Rating info */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ₹{
                      i < Math.round(product.averageRating || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {product.averageRating || 'New'} ({product.numReviews || 0} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="py-4 border-y border-slate-100 dark:border-slate-800 flex items-baseline gap-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white">₹{price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-lg text-slate-400 line-through">₹{originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Dynamic Variant Selectors */}
          <div className="space-y-4">
            {/* Color selection */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer ₹{
                        selectedColor === color
                          ? 'border-brand-accent bg-brand-accent/5 text-brand-accent font-bold'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl text-xs font-black border-2 transition-all cursor-pointer ₹{
                        selectedSize === size
                          ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock Notification */}
          <div className="flex items-center gap-2 text-sm">
            {stock === 0 ? (
              <span className="text-rose-500 font-semibold">Out of stock</span>
            ) : stock < 5 ? (
              <span className="text-amber-500 font-semibold">Only {stock} items left in stock!</span>
            ) : (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>In Stock ({stock} available)</span>
              </span>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-950 text-white rounded-2xl py-4 font-bold hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Add to Shopping Bag</span>
            </button>
            
            <button
              onClick={handleAddToWishlist}
              className={`flex items-center justify-center border rounded-2xl p-4 transition-all cursor-pointer ₹{
                isWishlisted
                  ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 dark:border-rose-950/30 dark:bg-rose-950/10 dark:hover:bg-rose-950/20'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              <Heart
                className={`h-5 w-5 ₹{
                  isWishlisted
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              />
            </button>

            <button
              onClick={handleAddToCompare}
              className={`flex items-center justify-center border rounded-2xl p-4 transition-all cursor-pointer ₹{
                isInCompare
                  ? 'border-brand-accent bg-brand-accent/5 hover:bg-brand-accent/10 dark:border-brand-accent/30'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
              title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
            >
              <Scale
                className={`h-5 w-5 ₹{
                  isInCompare
                    ? 'text-brand-accent'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              />
            </button>
          </div>

          {/* Description & Specs */}
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Product Info</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-slate-500 text-xs dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>100% Original Products</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Easy 15 Days Returns</span>
            </div>
          </div>
        </div>
      </div>

  {/* Tabbed Reviews & Q&A Sections */}
  <section className="border-t border-slate-100 dark:border-slate-800 pt-16 mb-16">
    {/* Tab Selector Header */}
    <div className="border-b border-slate-200 dark:border-slate-800 mb-8 flex gap-8">
      <button
        onClick={() => setActiveTab('reviews')}
        className={`pb-4 text-lg sm:text-xl font-serif font-black tracking-tight cursor-pointer transition-all border-b-2 ₹{
          activeTab === 'reviews'
            ? 'border-indigo-600 text-slate-900 dark:text-white'
            : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-205'
        }`}
      >
        Customer Reviews ({product.numReviews || 0})
      </button>
      <button
        onClick={() => setActiveTab('qa')}
        className={`pb-4 text-lg sm:text-xl font-serif font-black tracking-tight cursor-pointer transition-all border-b-2 ₹{
          activeTab === 'qa'
            ? 'border-indigo-600 text-slate-900 dark:text-white'
            : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-205'
        }`}
      >
        Product Q&A ({qaPagination?.total || 0})
      </button>
    </div>

    {activeTab === 'reviews' ? (
      <>
        {/* Existing Reviews block controls and items */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
              Customer Reviews
            </h3>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Read what other customers say or submit your own feedback
            </p>
          </div>

          <div className="flex gap-3">
            {reviews.length > 0 && (
              <button
                onClick={handleSummarizeReviews}
                disabled={reviewSummaryLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-850 dark:text-white bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-brand-accent animate-pulse" />
                <span>AI Reviews Summary</span>
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => {
                  setEditingReview(null);
                  setShowReviewForm(!showReviewForm);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Write a Review</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Summary Card */}
        {reviewSummaryLoading && (
          <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-8 text-center animate-pulse">
            <RefreshCw className="h-6 w-6 text-slate-350 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-bold">Generating review aggregates summary...</p>
          </div>
        )}

        {reviewSummary && (
          <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand-accent" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Verdict Summary</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                {reviewSummary.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-1">
              <div>
                <span className="text-[9px] font-black text-emerald-600 block uppercase tracking-widest mb-1.5">Pros</span>
                <ul className="text-xs text-slate-650 dark:text-slate-350 space-y-1 list-disc pl-4 leading-relaxed font-semibold">
                  {reviewSummary.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[9px] font-black text-rose-600 block uppercase tracking-widest mb-1.5">Cons</span>
                <ul className="text-xs text-slate-650 dark:text-slate-350 space-y-1 list-disc pl-4 leading-relaxed font-semibold">
                  {reviewSummary.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 mb-8">
          <RatingStats
            averageRating={product.averageRating || 0}
            numReviews={product.numReviews || 0}
            distribution={distribution}
          />

          {showReviewForm && (
            <div id="review-form-container" className="scroll-mt-20">
              <ReviewForm
                productId={product._id}
                existingReview={editingReview}
                onSuccess={handleReviewSuccess}
              />
            </div>
          )}
        </div>

        {reviewsLoading && reviews.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-450">Loading reviews...</div>
        ) : (
          <ReviewList
            productId={product._id}
            reviews={reviews}
            pagination={pagination}
            currentUserId={user?.id}
            isAdmin={user?.roles?.includes('ADMIN') || user?.roles?.includes('admin')}
            onEditReview={handleEditReviewClick}
            onPageChange={(page) => setReviewPage(page)}
            onFilterChange={(newFilters) => {
              setReviewFilters((prev) => ({ ...prev, ...newFilters }));
              setReviewPage(1);
            }}
            filters={reviewFilters}
          />
        )}
      </>
    ) : (
      <>
        {/* Q&A Tab View */}
        <div className="mb-6">
          <h3 className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
            Customer Questions & Answers
          </h3>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Find answers or ask a new question about this product.
          </p>
        </div>

        {qaLoading && questions.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-450">Loading questions...</div>
        ) : (
          <QuestionList
            productId={product._id}
            questions={questions}
            pagination={qaPagination}
            currentUserId={user?.id}
            isAdmin={user?.roles?.includes('ADMIN') || user?.roles?.includes('admin')}
            onPageChange={(page) => setQaPage(page)}
            onSearchChange={(search) => {
              setQaSearch(search);
              setQaPage(1);
            }}
          />
        )}
      </>
    )}
  </section>

  {/* Bottom Section: Related Products */}
  {relatedProducts && relatedProducts.length > 0 && (
        <section className="border-t border-slate-100 dark:border-slate-800 pt-16">
          <h2 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white mb-8">
            You May Also Like
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => {
              const relDiscount = prod.variants[0]?.originalPrice 
                ? Math.round(100 - (prod.variants[0].price / prod.variants[0].originalPrice) * 100)
                : 0;

              return (
                <Link
                  key={prod._id}
                  to={ROUTES.PRODUCT_DETAILS(prod.slug)}
                  className="group flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3">
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
                    
                    {relDiscount > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-lg">
                        {relDiscount}% OFF
                      </span>
                    )}
                  </div>
                  
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {prod.brand?.name}
                  </span>
                  
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-accent transition-colors line-clamp-1 text-sm mt-0.5">
                    {prod.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mt-1 text-slate-500">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold">{prod.averageRating || 'New'}</span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                    <span className="font-black text-slate-900 dark:text-white text-sm">₹{prod.variants[0]?.price}
                    </span>
                    {prod.variants[0]?.originalPrice && prod.variants[0].originalPrice > prod.variants[0].price && (
                      <span className="text-[10px] text-slate-400 line-through">₹{prod.variants[0].originalPrice}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
