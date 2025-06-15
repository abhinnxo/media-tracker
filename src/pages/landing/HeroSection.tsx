
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  fadeIn: any;
  staggerContainer: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ fadeIn, staggerContainer }) => (
  <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4">
    <div className="container mx-auto max-w-6xl">
      <motion.div
        className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 min-h-[440px]"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{ minHeight: 440 }}
      >
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left min-h-full">
          <motion.div variants={fadeIn}>
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200 rounded-full">
              All-in-one entertainment tracker
            </span>
          </motion.div>
          <motion.h1
            variants={fadeIn}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500"
          >
            Your entire entertainment life, in one place
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto md:mx-0"
          >
            Stop switching between apps to track what you watch and read.
            MediaTracker organizes your movies, shows, books, anime, and manga in one beautiful interface.
          </motion.p>
          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <Button size="lg" className="px-8 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600" asChild>
              <Link to="/register">
                <span>Get Started Free</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="#features">Learn More</Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          variants={fadeIn}
          className="flex-1 flex justify-center items-center min-h-full"
        >
          <div className="relative max-w-md mx-auto">
            <div className="absolute -left-4 -top-4 w-full h-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 opacity-50 blur-xl"></div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden transform translate-y-8">
                  <img
                    src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=280&auto=format&fit=crop&crop=entropy"
                    alt="Movie"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <div className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 rounded">Movie</div>
                    <h3 className="font-medium mt-1">The Shawshank Redemption</h3>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=280&auto=format&fit=crop&crop=entropy"
                    alt="Book"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <div className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 rounded">Book</div>
                    <h3 className="font-medium mt-1">To Kill a Mockingbird</h3>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1559108318-39ed452bb6c9?w=500&h=280&auto=format&fit=crop&crop=entropy"
                    alt="TV Show"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <div className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 rounded">TV Series</div>
                    <h3 className="font-medium mt-1">Breaking Bad</h3>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden transform translate-y-8">
                  <img
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&h=280&auto=format&fit=crop&crop=entropy"
                    alt="Anime"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <div className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 rounded">Anime</div>
                    <h3 className="font-medium mt-1">Attack on Titan</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
