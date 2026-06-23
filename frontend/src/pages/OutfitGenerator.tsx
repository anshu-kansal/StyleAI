import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { generateOutfit, clearOutfit } from '../features/ai/aiSlice';
import { addToCart } from '../features/cart/cartSlice';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import { Sparkles, Sliders, ShoppingBag, Shirt, Heart, RefreshCw, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';

export const OutfitGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { outfit, outfitLoading, error } = useAppSelector((state) => state.ai);

  // Form states
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>('men');
  const [occasion, setOccasion] = useState('Casual Weekend');
  const [season, setSeason] = useState('summer');
  const [budget, setBudget] = useState(150);

  // Clean outfit state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearOutfit());
    };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(generateOutfit({ gender, occasion, budget, season }));
  };

  const handleAddOutfitToBag = () => {
    if (!outfit || !outfit.products || outfit.products.length === 0) {
      toast.error('No matching products to add');
      return;
    }

    let addedCount = 0;
    outfit.products.forEach((product) => {
      const defaultVariant = product.variants[0];
      if (defaultVariant && defaultVariant.stock > 0) {
        dispatch(
          addToCart({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            sku: defaultVariant.sku,
            size: defaultVariant.size,
            color: defaultVariant.color,
            price: defaultVariant.price,
            originalPrice: defaultVariant.originalPrice,
            image: product.images[0] || defaultVariant.images[0],
            quantity: 1,
            stock: defaultVariant.stock,
          })
        );
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} outfit items to your shopping bag!`);
    } else {
      toast.error('All items in this outfit are currently out of stock');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
        <div className="p-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-2xl shadow-sm">
          <Shirt className="h-6 w-6 text-brand-accent animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
            AI Outfit Generator
          </h1>
          <p className="text-slate-400 text-xs font-semibold">Generate a styled wardrobe lookup customized for your occasion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Parameters Form */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-brand-accent" />
            <span>Styling Filters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gender Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gender Target</label>
              <div className="grid grid-cols-3 gap-2">
                {(['men', 'women', 'unisex'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 rounded-xl text-xs font-bold border capitalize transition-all cursor-pointer ${
                      gender === g
                        ? 'border-brand-dark bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="Casual Weekend">Casual Weekend</option>
                <option value="Formal Business Meeting">Formal Office Meeting</option>
                <option value="Date Night Out">Date Night Dinner</option>
                <option value="Gym Training Workout">Gym Workout</option>
                <option value="Club Party Night">Cocktail Party Night</option>
              </select>
            </div>

            {/* Season select */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="summer">Summer Season</option>
                <option value="winter">Winter Season</option>
                <option value="spring/autumn">Spring / Autumn</option>
              </select>
            </div>

            {/* Budget range */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Total Budget</span>
                <span className="text-brand-accent font-black">${budget}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-slate-900 dark:accent-white"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                <span>$50</span>
                <span>$500</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              isLoading={outfitLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Outfit</span>
            </Button>
          </form>
        </div>

        {/* Right Side: Outfit Grid & Stylist Summary */}
        <div className="lg:col-span-2 space-y-6">
          {outfitLoading ? (
            <div className="bg-white border rounded-3xl p-10 dark:bg-slate-900 text-center space-y-4 shadow-sm animate-pulse">
              <RefreshCw className="h-10 w-10 text-slate-350 animate-spin mx-auto" />
              <p className="text-sm text-slate-400 font-bold">Curating matching outfit pieces for you...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 dark:bg-rose-950/15 dark:border-rose-950/20 text-center space-y-2 text-rose-800 dark:text-rose-350">
              <h3 className="font-bold text-base">Generation Failed</h3>
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          ) : outfit ? (
            <div className="space-y-6">
              {/* Concept & Advice Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Style Concept</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{outfit.concept}</h3>
                  </div>
                  
                  {/* Palette Swatches */}
                  {outfit.colorPalette && (
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                      <Palette className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-1">Colors:</span>
                      <div className="flex gap-1">
                        {outfit.colorPalette.map((col, i) => (
                          <span
                            key={i}
                            className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-sm inline-block"
                            style={{ backgroundColor: col }}
                            title={col}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm text-slate-650 leading-relaxed dark:text-slate-300">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Stylist Notes</h4>
                  <p className="font-medium text-slate-600 dark:text-slate-300">{outfit.outfitDescription}</p>
                </div>

                {outfit.products && outfit.products.length > 0 && (
                  <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-slate-800">
                    <Button
                      variant="primary"
                      onClick={handleAddOutfitToBag}
                      className="flex items-center gap-1.5 rounded-2xl cursor-pointer"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add Outfit to bag</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Outfit components grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {outfit.items.map((item, idx) => {
                  // Resolve matching product if exists
                  const matchedProd = outfit.products?.[idx];

                  return (
                    <div
                      key={idx}
                      className="bg-white border border-slate-100 rounded-3xl p-4 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Component Item Type info */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">
                            {item.category}
                          </span>
                          <span className="text-xs font-black text-slate-400">${item.approxPrice}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed h-8">
                          {item.styleDetails}
                        </p>
                      </div>

                      {/* Matched Product Widget Card */}
                      {matchedProd ? (
                        <div className="border-t border-slate-50 dark:border-slate-800 pt-4 mt-4 space-y-3">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800 relative group">
                            {matchedProd.images && matchedProd.images[0] ? (
                              <img
                                src={matchedProd.images[0]}
                                alt={matchedProd.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-450 text-xs">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider">
                              {matchedProd.brand?.name}
                            </span>
                            <Link
                              to={ROUTES.PRODUCT_DETAILS(matchedProd.slug)}
                              className="font-bold text-xs text-slate-900 dark:text-white hover:text-brand-accent transition-colors line-clamp-1 block"
                            >
                              {matchedProd.name}
                            </Link>
                            <span className="font-black text-xs text-slate-950 dark:text-white block mt-0.5">
                              ${matchedProd.variants[0]?.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-dashed border-slate-200 dark:border-slate-850 pt-6 mt-4 text-center text-xs text-slate-400 font-bold">
                          No database match found
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-4 dark:bg-slate-900/10 dark:border-slate-800 h-full">
              <Shirt className="h-12 w-12 text-slate-300" />
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-350 text-sm">No Outfit Generated</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed mt-1">
                  Adjust target gender, occasion and budget filters on the left panel, and click "Generate Outfit" to begin.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitGenerator;
