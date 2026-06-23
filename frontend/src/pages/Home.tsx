import React from 'react';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

export const Home: React.FC = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl py-24 px-8 sm:px-16 lg:px-24 max-w-7xl mx-auto my-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Fashion Platform</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Redefining Style with <span className="text-brand-accent font-sans italic">Artificial</span> Intelligence.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-lg">
            Experience the future of fashion. Personalized AI recommendations, smart outfit generators, and a seamless luxury shopping experience.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to={ROUTES.PRODUCTS}>
              <Button variant="secondary" size="lg" className="group cursor-pointer">
                <span>Explore Collection</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to={ROUTES.STYLIST}>
              <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800 cursor-pointer">
                Try AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Features Built For Scale</h2>
          <p className="text-slate-500 text-sm">Every element of this platform is engineered using industry-best design patterns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            to={ROUTES.STYLIST}
            className="block group p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200 transition-all dark:bg-slate-900 dark:border-slate-800 space-y-4"
          >
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6 text-brand-accent" />
            </div>
            <h3 className="text-lg font-bold group-hover:text-brand-accent transition-colors flex items-center gap-1.5">
              <span>AI Stylist</span>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-brand-accent" />
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Outfit recommendations powered by vector embeddings and prompt engineering, matching occasion, budget, and aesthetic preferences.
            </p>
          </Link>

          <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl w-fit">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold">Real-time Catalog</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Highly responsive filters, search indexing, and pagination. Powered by React, Redux Toolkit, and Node.js.
            </p>
          </div>

          <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl w-fit">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold">Secure Transactions</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Secure checkout flow integrated with Razorpay in test mode, verifying payments safely using cryptographic signatures.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
