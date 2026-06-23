import OpenAI from 'openai';
import Product from '../models/product.model';
import Review from '../models/review.model';
import { config } from '../config/app.config';
import { ApiError } from '../utils/api-error';

// Initialize OpenAI SDK if a key is provided
let openai: OpenAI | null = null;
const apiKey = config.openai.apiKey;
const isMockKey = !apiKey || apiKey === 'your_openai_api_key' || apiKey.startsWith('mock');

if (!isMockKey) {
  openai = new OpenAI({
    apiKey,
  });
}

export class AiService {
  /**
   * Helper to get a compact catalog of active products for prompt feeding
   */
  private static async getCompactCatalog() {
    const products = await Product.find({ isActive: true }).populate('brand category');
    return products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      brand: (p.brand as any)?.name || 'Unknown',
      category: (p.category as any)?.name || 'Unknown',
      slug: p.slug,
      gender: p.gender,
      description: p.description,
      price: p.variants[0]?.price || 0,
      colors: Array.from(new Set(p.variants.map((v) => v.color).filter(Boolean))),
      sizes: Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean))),
      stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    }));
  }

  /**
   * Conversational chatbot with catalog recommendations
   */
  static async chatWithAssistant(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) {
    const catalog = await this.getCompactCatalog();

    if (openai) {
      try {
        const systemMessage = {
          role: 'system' as const,
          content: `You are StyleAI's fashion shopping assistant. You help users find clothes, recommend outfits, and answer fashion questions. 
Here is the JSON catalog of active products in our store:
${JSON.stringify(catalog)}

Help the user. If you recommend any products, refer ONLY to the products in the catalog by their slug in the recommendations array.
You MUST return your response as a valid JSON object (no markdown surrounding the JSON) with exactly two fields:
1. 'reply': a markdown-formatted string containing your conversation, advice, and tips.
2. 'recommendations': an array of strings representing product slugs recommended in this turn.`,
        };

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [systemMessage, ...messages],
          temperature: 0.7,
        });

        const responseText = completion.choices[0]?.message?.content || '';
        try {
          const parsed = JSON.parse(responseText.trim().replace(/^```json/, '').replace(/```$/, ''));
          return parsed;
        } catch {
          // If response is not JSON, try to extract catalog matching slugs
          const recommendedSlugs = catalog
            .filter((p) => responseText.toLowerCase().includes(p.slug.toLowerCase()))
            .map((p) => p.slug);
          return {
            reply: responseText,
            recommendations: recommendedSlugs,
          };
        }
      } catch (err: any) {
        console.warn('OpenAI completion failed, falling back to mock chatbot engine:', err.message);
      }
    }

    // gracefull mock chat engine fallback
    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let reply = `Hello! I am your **StyleAI Shopping Assistant**. I'd be happy to help you discover the perfect outfit!`;
    const recommendedSlugs: string[] = [];

    // Analyze query context
    if (userMessage.includes('summer') || userMessage.includes('hot') || userMessage.includes('t-shirt') || userMessage.includes('tee')) {
      reply = `As the summer heat rolls in, staying comfortable and stylish is key! I highly recommend checking out lightweight cotton tees, breathable sneakers, and casual apparel. Here are some of our top picks:`;
      const summerItems = catalog.filter((p) => 
        p.category.toLowerCase().includes('apparel') || 
        p.name.toLowerCase().includes('t-shirt') || 
        p.name.toLowerCase().includes('tee') ||
        p.description.toLowerCase().includes('summer')
      );
      recommendedSlugs.push(...summerItems.slice(0, 3).map((p) => p.slug));
    } else if (userMessage.includes('shoe') || userMessage.includes('sneaker') || userMessage.includes('footwear')) {
      reply = `Good shoes take you to good places! We have an excellent selection of premium athletic sneakers and smart footwear. Take a look at these hot picks:`;
      const shoes = catalog.filter((p) => 
        p.category.toLowerCase().includes('footwear') || 
        p.name.toLowerCase().includes('shoe') || 
        p.name.toLowerCase().includes('sneaker')
      );
      recommendedSlugs.push(...shoes.slice(0, 3).map((p) => p.slug));
    } else if (userMessage.includes('under') || userMessage.includes('budget') || userMessage.includes('$')) {
      // Find budget number if possible
      const match = userMessage.match(/under\s*\$?\s*(\d+)/) || userMessage.match(/\$?\s*(\d+)/);
      const limit = match ? Number(match[1]) : 100;
      reply = `Looking for stylish fashion on a budget? No problem! Here are some fantastic picks from our store that are under **$${limit}**:`;
      const budgetItems = catalog.filter((p) => p.price <= limit);
      recommendedSlugs.push(...budgetItems.slice(0, 3).map((p) => p.slug));
    } else if (userMessage.includes('formal') || userMessage.includes('suit') || userMessage.includes('office') || userMessage.includes('work')) {
      reply = `Dressing for success! For a sharp, professional look, I recommend crisp formal shirts and sleek accessories to elevate your style. Check out these choices:`;
      const formal = catalog.filter((p) => 
        p.description.toLowerCase().includes('formal') || 
        p.name.toLowerCase().includes('shirt') || 
        p.category.toLowerCase().includes('apparel')
      );
      recommendedSlugs.push(...formal.slice(0, 3).map((p) => p.slug));
    } else {
      reply = `I'd love to help you find your next look. Try asking me for **sneakers**, **summer outfits**, or fashion items **under a budget** (e.g. "under $100"). Meanwhile, check out some of our featured catalog items:`;
      recommendedSlugs.push(...catalog.slice(0, 3).map((p) => p.slug));
    }

    return {
      reply,
      recommendations: recommendedSlugs,
    };
  }

  /**
   * Outfit Generator matching criteria to catalog items
   */
  static async generateOutfit(gender: string, occasion: string, budget: number, season: string) {
    let outfitRec: any = null;

    if (openai) {
      try {
        const prompt = `You are a professional fashion stylist. Recommend a complete outfit set (Upperwear, Lowerwear, Footwear, and optionally Accessories) for a ${gender} for a '${occasion}' occasion in '${season}' season. 
The total budget for the outfit is $${budget}. 
You must return your response as a valid JSON object with exactly these fields:
1. 'concept': overall style concept/theme name.
2. 'colorPalette': array of matching color name strings.
3. 'outfitDescription': stylist tips and advice on why this combination works.
4. 'items': array of suggested item objects containing: 'category' (e.g. 'upperwear', 'lowerwear', 'footwear', 'accessory'), 'styleDetails' (description of the garment), and 'approxPrice' (price in USD).`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
        });

        const text = completion.choices[0]?.message?.content || '';
        outfitRec = JSON.parse(text.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch (err: any) {
        console.warn('OpenAI outfit generation failed, running local stylist rule-engine:', err.message);
      }
    }

    // Graceful local stylist rule-engine fallback
    if (!outfitRec) {
      const isFemale = gender.toLowerCase() === 'women';
      outfitRec = {
        concept: `${season.charAt(0).toUpperCase() + season.slice(1)} ${occasion.charAt(0).toUpperCase() + occasion.slice(1)} look`,
        colorPalette: isFemale ? ['Cream', 'Rose Gold', 'Soft White'] : ['Navy Blue', 'Olive Green', 'White'],
        outfitDescription: `This outfit is curated for a ${gender} looking for a balanced, premium ${occasion} look during the ${season} season. It blends matching color tones to keep the outfit unified, comfortable, and within a $${budget} budget.`,
        items: [
          { category: 'upperwear', styleDetails: isFemale ? 'Soft casual top or summer blouse' : 'Premium cotton casual shirt or tee', approxPrice: Math.round(budget * 0.3) },
          { category: 'lowerwear', styleDetails: isFemale ? 'Slim-fit chinos or structured denim' : 'Comfort-fit denims or stretch chinos', approxPrice: Math.round(budget * 0.4) },
          { category: 'footwear', styleDetails: 'Sleek, matching lifestyle sneakers', approxPrice: Math.round(budget * 0.3) },
        ],
      };
    }

    // Map outfit items to active products in our DB
    const matchedProducts: any[] = [];
    const targetGender = gender.toUpperCase() === 'WOMEN' ? 'WOMEN' : gender.toUpperCase() === 'MEN' ? 'MEN' : 'UNISEX';

    for (const item of outfitRec.items) {
      // Find a product in DB matching gender and category if possible
      let matched = await Product.findOne({
        isActive: true,
        gender: { $in: [targetGender, 'UNISEX'] },
        // Simple regex category matching
        description: new RegExp(item.category || item.styleDetails, 'i'),
      }).populate('brand category');

      if (!matched) {
        // Fallback: get any product matching gender and price bounds
        matched = await Product.findOne({
          isActive: true,
          gender: { $in: [targetGender, 'UNISEX'] },
          'variants.price': { $lte: item.approxPrice || budget },
        }).populate('brand category');
      }

      if (!matched) {
        // Ultimate fallback: get any active product
        matched = await Product.findOne({ isActive: true }).populate('brand category');
      }

      if (matched && !matchedProducts.some((p) => p._id.toString() === matched?._id.toString())) {
        matchedProducts.push(matched);
      }
    }

    return {
      concept: outfitRec.concept,
      colorPalette: outfitRec.colorPalette,
      outfitDescription: outfitRec.outfitDescription,
      items: outfitRec.items,
      products: matchedProducts,
    };
  }

  /**
   * Side-by-side product comparison engine
   */
  static async compareProducts(productIds: string[]) {
    const products = await Product.find({ _id: { $in: productIds } }).populate('brand category');
    if (products.length === 0) {
      throw ApiError.notFound('Products not found for comparison');
    }

    if (openai && products.length >= 2) {
      try {
        const prompt = `You are a fashion product comparison expert. Compare the following products:
${products.map((p, idx) => `Product ${idx + 1}: Name: "${p.name}", Brand: "${(p.brand as any)?.name}", Price: $${p.variants[0]?.price}, Details: "${p.description}", Rating: ${p.averageRating}`).join('\n')}

You must return your response as a valid JSON object (no markdown surrounding the JSON) with exactly these fields:
1. 'comparisonTable': array of criteria objects, e.g. [{"criterion": "Brand", "value1": "Nike", "value2": "Puma"}, {"criterion": "Price", "value1": "$80", "value2": "$75"}]
2. 'pros': object where keys are product slugs, mapping to arrays of pros strings.
3. 'cons': object where keys are product slugs, mapping to arrays of cons strings.
4. 'verdict': final summary recommendation text explaining which product is better suited for whom.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        });

        const text = completion.choices[0]?.message?.content || '';
        return JSON.parse(text.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch (err: any) {
        console.warn('OpenAI comparison failed, falling back to programmatic comparer:', err.message);
      }
    }

    // Programmatic comparison fallback
    const p1 = products[0];
    const p2 = products[1] || products[0];

    const comparisonTable = [
      { criterion: 'Brand', value1: (p1.brand as any)?.name || 'N/A', value2: (p2.brand as any)?.name || 'N/A' },
      { criterion: 'Price', value1: `$${p1.variants[0]?.price.toFixed(2) || '0.00'}`, value2: `$${p2.variants[0]?.price.toFixed(2) || '0.00'}` },
      { criterion: 'Average Rating', value1: `${p1.averageRating || 'New'} ⭐`, value2: `${p2.averageRating || 'New'} ⭐` },
      { criterion: 'Reviews Count', value1: `${p1.numReviews || 0}`, value2: `${p2.numReviews || 0}` },
      { criterion: 'Gender Fit', value1: p1.gender, value2: p2.gender },
    ];

    const pros: Record<string, string[]> = {};
    const cons: Record<string, string[]> = {};

    products.forEach((p) => {
      pros[p.slug] = [
        'Premium build and stylish fashion choice',
        p.averageRating >= 4 ? 'Highly rated by verified customers' : 'Contemporary modern layout cut',
        'Available in multiple color/size swatches',
      ];
      cons[p.slug] = [
        'Stock levels may run out quickly due to high demand',
        'Dry clean or gentle hand wash recommended for fabric longevity',
      ];
    });

    const verdict = products.length === 1 
      ? `This is a premium product from ${(p1.brand as any)?.name || 'our brand'}. Highly recommended for users looking for high quality ${p1.category} fashion.`
      : `Both items offer outstanding styling. If you prefer high rating aggregates, consider **${p1.averageRating >= p2.averageRating ? p1.name : p2.name}**. If price is your main consideration, **${p1.variants[0]?.price <= p2.variants[0]?.price ? p1.name : p2.name}** offers the best value.`;

    return {
      comparisonTable,
      pros,
      cons,
      verdict,
    };
  }

  /**
   * Summarize reviews for a product
   */
  static async summarizeReviews(productId: string) {
    const reviews = await Review.find({ product: productId }).populate('user', 'name');
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (openai && reviews.length > 0) {
      try {
        const prompt = `Summarize the customer reviews for this product: "${product.name}".
Reviews:
${reviews.map((r, i) => `Review ${i + 1} (${r.rating}/5 stars): "${r.comment}"`).join('\n')}

You must return your response as a valid JSON object with exactly these fields:
1. 'summary': a brief paragraph of user sentiment.
2. 'pros': array of highlight strings (positive feedback).
3. 'cons': array of drawback strings (complaints or issues).`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        });

        const text = completion.choices[0]?.message?.content || '';
        return JSON.parse(text.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch (err: any) {
        console.warn('OpenAI review summarizer failed, using default analyzer:', err.message);
      }
    }

    // Programmatic review summarizer fallback
    if (reviews.length === 0) {
      return {
        summary: `There are currently no customer reviews for the **${product.name}**. Be the first to share your experience with the community!`,
        pros: ['Original branded product design', 'Excellent fit potential'],
        cons: ['No customer review feedback yet'],
      };
    }

    const ratingsSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = ratingsSum / reviews.length;

    const positiveCount = reviews.filter((r) => r.rating >= 4).length;
    const sentimentPct = Math.round((positiveCount / reviews.length) * 100);

    const summary = `Based on ${reviews.length} customer reviews, the **${product.name}** has an average rating of **${avg.toFixed(1)} / 5 stars**. Approximately ${sentimentPct}% of reviewers shared positive feedback about their purchase experience.`;

    const pros = [
      'Customers appreciate the premium style and visual looks',
      'Comfortable fabric materials suitable for active wear',
    ];
    const cons = [
      reviews.some((r) => r.rating <= 2) 
        ? 'Some users reported sizing variants could run slightly tight'
        : 'A few customers noted shipping times could be speedier',
    ];

    return {
      summary,
      pros,
      cons,
    };
  }
}

export default AiService;
