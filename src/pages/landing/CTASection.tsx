
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';

const CTASection: React.FC = () => (
  <section className="py-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500"></div>
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform how you track your entertainment?</h2>
        <p className="text-xl text-white/80 mb-8">
          Join MediaTracker today and never lose track of what you're watching or reading again.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100" asChild>
            <Link to="/register">
              <span>Get Started Free</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white bg-transparent hover:bg-white/10" asChild>
            <Link to="/login">
              <span>Log In</span>
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-white/70">
          No credit card required. Free account includes unlimited media tracking.
        </p>
      </div>
    </div>
  </section>
);

export default CTASection;
