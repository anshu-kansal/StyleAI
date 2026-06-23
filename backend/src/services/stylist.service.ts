import OpenAI from 'openai';
import Product from '../models/product.model';
import { config } from '../config/app.config';
import { logger } from '../utils/logger';

export class StylistService {
  /**
   * Generates styling recommendation and selects corresponding products.
   * Gracefully falls back to a rules-based matching engine if OpenAI is unavailable.
   */
  static async generateRecommendation(
    occasion: string,
    gender: string,
    budget: number,
    aesthetic: string
  ) {
    // 1. Fetch all active products populated with category and brand
    const activeProducts = await Product.find({ isActive: true })
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .lean();

    // 2. Try calling OpenAI if API key is present and not placeholder
    const isApiKeyPlaceholder =
      !config.openai.apiKey ||
      config.openai.apiKey === 'your_openai_api_key' ||
      config.openai.apiKey.includes('your_');

    if (!isApiKeyPlaceholder) {
      try {
        const openai = new OpenAI({
          apiKey: config.openai.apiKey,
        });

        // Format compact catalog for OpenAI prompt to save tokens
        const compactCatalog = activeProducts.map((p: any) => {
          const prices = p.variants.map((v: any) => v.price);
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
          return {
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            brand: p.brand?.name || 'Unknown',
            category: p.category?.name || 'Unknown',
            gender: p.gender,
            price: minPrice,
          };
        });

        const prompt = `You are a professional AI fashion stylist for StyleAI, a premium e-commerce platform.
A client has requested outfit suggestions based on these options:
- Occasion: ${occasion}
- Style/Gender: ${gender}
- Budget: $${budget > 0 ? budget : 'No limit'}
- Aesthetic keyword(s): ${aesthetic || 'Any'}

Here are the products currently available in our catalog:
${JSON.stringify(compactCatalog, null, 2)}

Recommend a complete, cohesive outfit matching their criteria (select between 1 to 3 items).
You must respond with a raw JSON object only. Do not wrap it in markdown block tags or include backticks. The JSON structure must match this format:
{
  "advice": "Write a 3-4 sentence detailed styling advice. Explain how these products complement each other, fit the occasion, and match their aesthetic.",
  "recommendedProductIds": ["list of product ID strings chosen from the catalog"]
}`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 400,
        });

        const content = completion.choices[0]?.message?.content?.trim();
        if (content) {
          const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
          if (parsed.advice && Array.isArray(parsed.recommendedProductIds)) {
            // Retrieve full products from database
            const matchedProducts = activeProducts.filter((p) =>
              parsed.recommendedProductIds.includes(p._id.toString())
            );
            return {
              advice: parsed.advice,
              products: matchedProducts,
            };
          }
        }
      } catch (err: any) {
        logger.error('OpenAI styling request failed. Falling back to local engine.', err);
      }
    }

    // 3. Fallback to Local Recommendation Engine
    logger.info('Running local stylist fallback engine...');
    return this.runLocalFallback(occasion, gender, budget, aesthetic, activeProducts);
  }

  /**
   * Local rules-based and keyword scoring recommendation engine
   */
  private static runLocalFallback(
    occasion: string,
    gender: string,
    budget: number,
    aesthetic: string,
    products: any[]
  ) {
    const formattedGender = gender.toLowerCase();
    const formattedOccasion = occasion.toLowerCase();
    const aestheticTokens = (aesthetic || '')
      .toLowerCase()
      .split(/[\s,.-]+/)
      .filter((t) => t.length > 2);

    // Filter by Gender
    let filtered = products.filter((p) => {
      const prodGender = p.gender.toLowerCase();
      if (formattedGender === 'men') {
        return prodGender === 'men' || prodGender === 'unisex';
      }
      if (formattedGender === 'women') {
        return prodGender === 'women' || prodGender === 'unisex';
      }
      if (formattedGender === 'unisex') {
        return prodGender === 'unisex';
      }
      if (formattedGender === 'kids') {
        return prodGender === 'kids' || prodGender === 'unisex';
      }
      return true;
    });

    // Filter by Budget (Check if min price is <= budget)
    if (budget > 0) {
      filtered = filtered.filter((p) => {
        const prices = p.variants.map((v: any) => v.price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        return minPrice <= budget;
      });
    }

    // Occasion categorization maps to boost specific product types
    const isFormal = ['formal', 'business', 'interview', 'work', 'meeting'].some((o) =>
      formattedOccasion.includes(o)
    );
    const isSporty = ['sports', 'workout', 'gym', 'active', 'run', 'casual'].some((o) =>
      formattedOccasion.includes(o)
    );
    const isVacation = ['vacation', 'beach', 'summer', 'holiday', 'travel'].some((o) =>
      formattedOccasion.includes(o)
    );
    const isParty = ['party', 'club', 'celebration', 'wedding', 'date'].some((o) =>
      formattedOccasion.includes(o)
    );

    // Score and rank products
    const scoredProducts = filtered.map((p) => {
      let score = 0;
      const name = p.name.toLowerCase();
      const description = p.description.toLowerCase();
      const catName = p.category?.name?.toLowerCase() || '';
      const brandName = p.brand?.name?.toLowerCase() || '';

      // 1. Boost by occasion affinity
      if (isFormal) {
        if (name.includes('blazer') || name.includes('coat') || name.includes('dress') || catName.includes('apparel')) {
          score += 15;
        }
        if (brandName.includes('zara')) {
          score += 5;
        }
      }
      if (isSporty) {
        if (name.includes('sneaker') || name.includes('shoes') || name.includes('hoodie') || name.includes('tracksuit') || name.includes('backpack') || name.includes('cap') || catName.includes('footwear') || catName.includes('accessories')) {
          score += 15;
        }
        if (brandName.includes('nike') || brandName.includes('adidas')) {
          score += 8;
        }
      }
      if (isVacation) {
        if (name.includes('dress') || name.includes('cap') || name.includes('bag') || name.includes('linen')) {
          score += 15;
        }
        if (brandName.includes('zara')) {
          score += 5;
        }
      }
      if (isParty) {
        if (name.includes('blazer') || name.includes('dress') || name.includes('bag') || name.includes('coat')) {
          score += 15;
        }
      }

      // 2. Match aesthetic tokens
      for (const token of aestheticTokens) {
        if (name.includes(token)) score += 10;
        if (description.includes(token)) score += 5;
        if (catName.includes(token)) score += 5;
        if (brandName.includes(token)) score += 5;
      }

      // 3. Featured boost
      if (p.isFeatured) {
        score += 3;
      }

      return { product: p, score };
    });

    // Sort descending by score
    scoredProducts.sort((a, b) => b.score - a.score);

    // Take top 3 matching products (or top 1-2 if catalog is small)
    const topScored = scoredProducts.slice(0, Math.min(3, scoredProducts.length));
    const recommendedProducts = topScored.map((item) => item.product);

    // 4. Construct personalized advice based on selected products and occasion
    let advice = `For your ${occasion} request, we have curated a premium outfit setup designed around a cohesive look. `;
    if (recommendedProducts.length > 0) {
      const productNames = recommendedProducts.map((p) => p.name);
      if (recommendedProducts.length === 1) {
        advice += `We recommend anchoring your look with the elegant ${productNames[0]}. It stands out as a focal piece that pairs effortlessly with standard wardrobe staples.`;
      } else if (recommendedProducts.length === 2) {
        advice += `We styled the structural ${productNames[0]} alongside the highly matching ${productNames[1]}. This pairing creates a modern, balanced silhouette that suits your active lifestyle.`;
      } else {
        advice += `This outfit combines the tailored styling of the ${productNames[0]}, the functional comfort of the ${productNames[1]}, and the visual accent of the ${productNames[2]}. Together, they achieve a sophisticated, layered style perfect for the occasion.`;
      }

      if (aesthetic) {
        advice += ` The selections draw heavily on your desired "${aesthetic}" aesthetic, blending classic color blockings with high-quality materials.`;
      }
      if (budget > 0) {
        const totalEstimate = recommendedProducts.reduce((sum, p) => {
          const prices = p.variants.map((v: any) => v.price);
          return sum + (prices.length > 0 ? Math.min(...prices) : 0);
        }, 0);
        advice += ` The total estimated cost is around $${totalEstimate.toFixed(2)}, matching perfectly within your $${budget} limit.`;
      }
    } else {
      advice = `We couldn't find any items matching your precise filters (gender: ${gender}${budget > 0 ? `, budget: $${budget}` : ''}). Try expanding your budget range or selecting alternative gender preferences to explore style combinations!`;
    }

    return {
      advice,
      products: recommendedProducts,
    };
  }
}
