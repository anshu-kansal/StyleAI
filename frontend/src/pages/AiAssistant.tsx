import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { chatWithAssistant, addLocalMessage, clearChat } from '../features/ai/aiSlice';
import { addToCart } from '../features/cart/cartSlice';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import { Send, Sparkles, Trash2, Bot, User, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';

const SUGGESTIONS = [
  'Show me casual summer styles under $100',
  'Recommend the best sneakers for running',
  'What goes well with formal shirts?',
  'Suggest office wear styles for men',
];

export const AiAssistant: React.FC = () => {
  const dispatch = useAppDispatch();
  const { chatMessages, chatLoading } = useAppSelector((state) => state.ai);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message locally
    dispatch(addLocalMessage({ role: 'user', content: textToSend }));
    setInput('');

    // Prepare message history to send to backend API
    const history = [...chatMessages, { role: 'user' as const, content: textToSend }].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await dispatch(chatWithAssistant(history)).unwrap();
    } catch (err: any) {
      toast.error(err || 'Failed to generate response');
    }
  };

  const handleAddToCart = (product: any) => {
    const defaultVariant = product.variants[0];
    if (!defaultVariant || defaultVariant.stock === 0) {
      toast.error('Out of stock');
      return;
    }

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
    toast.success(`${product.name} added to shopping bag!`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-2xl shadow-sm">
            <Sparkles className="h-6 w-6 text-brand-accent animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
              AI Shopping Assistant
            </h1>
            <p className="text-slate-400 text-xs font-semibold">Your personal AI stylist for fashion & outfits</p>
          </div>
        </div>

        {chatMessages.length > 0 && (
          <button
            onClick={() => dispatch(clearChat())}
            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3 py-1.5 rounded-xl border border-transparent hover:border-rose-100 dark:hover:border-rose-900 transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-850">
              <Bot className="h-12 w-12 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Ask StyleAI Assistant</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Describe the styles you are looking for, ask for outfit advice, or search using natural language.
              </p>
            </div>

            <div className="w-full space-y-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="w-full text-left text-xs font-bold text-slate-700 hover:text-brand-accent bg-white hover:bg-slate-55 border border-slate-150 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm hover:translate-x-1 transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {/* Avatar Icon */}
                {!isUser && (
                  <div className="h-8 w-8 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className="space-y-3 max-w-[80%]">
                  <div className={`p-4 rounded-2xl shadow-sm border ${
                    isUser
                      ? 'bg-slate-950 border-slate-950 text-white rounded-br-none'
                      : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-slate-850 dark:text-slate-200 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </p>
                  </div>

                  {/* Recommendation Card attachments */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {msg.recommendations.map((prod) => (
                        <div
                          key={prod._id}
                          className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex gap-3 group relative hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800 flex-shrink-0">
                            {prod.images && prod.images[0] ? (
                              <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">No Img</div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                                {prod.brand?.name}
                              </span>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate line-clamp-1">
                                {prod.name}
                              </h4>
                              <span className="font-black text-xs text-slate-900 dark:text-white mt-1 block">
                                ${prod.variants[0]?.price.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex gap-2 items-center pt-2">
                              <Link
                                to={ROUTES.PRODUCT_DETAILS(prod.slug)}
                                className="text-[10px] font-bold text-slate-500 hover:text-brand-accent flex items-center gap-0.5"
                              >
                                <span>Details</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                              
                              <button
                                onClick={() => handleAddToCart(prod)}
                                className="text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-0.5 ml-auto cursor-pointer"
                              >
                                <ShoppingBag className="h-3 w-3" />
                                <span>Add to bag</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Spinner bubble */}
        {chatLoading && (
          <div className="flex gap-4 justify-start">
            <div className="h-8 w-8 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-50 border border-slate-100 dark:bg-slate-905 dark:border-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
              <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input panel block */}
      <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatLoading}
            placeholder="Type style description, fashion query or budget..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-brand-accent"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={!input.trim() || chatLoading}
            className="px-6 flex items-center gap-1.5 rounded-2xl cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
