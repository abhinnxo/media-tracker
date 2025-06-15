
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  fadeIn: any;
  staggerContainer: any;
}

const mockCards = [
  {
    image:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=280&auto=format&fit=crop&crop=entropy',
    label: 'Movie',
    labelColor: 'bg-blue-600',
    labelBg: 'bg-blue-100',
    title: 'The Shawshank Redemption',
  },
  {
    image:
      'https://images.unsplash.com/photo-1559108318-39ed452bb6c9?w=500&h=280&auto=format&fit=crop&crop=entropy',
    label: 'TV Series',
    labelColor: 'bg-cyan-600',
    labelBg: 'bg-cyan-100',
    title: 'Breaking Bad',
  },
  {
    image:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=280&auto=format&fit=crop&crop=entropy',
    label: 'Book',
    labelColor: 'bg-yellow-600',
    labelBg: 'bg-yellow-100',
    title: 'To Kill a Mockingbird',
  },
  {
    image:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&h=280&auto=format&fit=crop&crop=entropy',
    label: 'Anime',
    labelColor: 'bg-violet-600',
    labelBg: 'bg-violet-100',
    title: 'Attack on Titan',
  },
];

const Card = ({
  image,
  label,
  labelColor,
  labelBg,
  title,
}: {
  image: string;
  label: string;
  labelColor: string;
  labelBg: string;
  title: string;
}) => (
  <div
    className="relative rounded-2xl overflow-hidden shadow-xl glass-card transition-all-300 group flex flex-col bg-slate-900/95"
    style={{ minHeight: 200 }}
  >
    <img
      src={image}
      alt={title}
      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
      style={{ aspectRatio: '16/9' }}
    />
    <div className="flex-1 flex flex-col justify-between px-5 py-4">
      <div>
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full shadow-md mb-2 ${labelBg} ${labelColor === 'bg-yellow-600' ? 'text-yellow-900' : 'text-white'}`}
        >
          {label}
        </span>
      </div>
      <div className="min-h-[32px]">
        <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
      </div>
    </div>
  </div>
);

const HeroSection: React.FC<HeroSectionProps> = ({ fadeIn, staggerContainer }) => (
  <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-2 sm:px-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 min-h-[90vh] relative">
    <div className="container mx-auto max-w-6xl">
      <motion.div
        className="flex flex-col md:flex-row items-center justify-center gap-14 md:gap-4 min-h-[440px]"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{ minHeight: 440 }}
      >
        {/* Left Side - Headline */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left min-h-full z-10">
          <motion.div variants={fadeIn}>
            <span className="inline-block px-5 py-2 mb-6 text-md font-semibold text-purple-200 bg-[#6B21A8] bg-opacity-90 rounded-full">
              All-in-one entertainment tracker
            </span>
          </motion.div>
          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-6xl font-extrabold tracking-tight mb-5 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
            style={{ lineHeight: 1.1 }}
          >
            Your entire entertainment life,<br />in one place
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl mx-auto md:mx-0"
          >
            Stop switching between apps to track what you watch and read. MediaTracker organizes your movies, shows, books, anime, and manga in one beautiful interface.
          </motion.p>
          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <Button
              size="lg"
              className="px-8 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold"
              asChild
            >
              <Link to="/register">
                <span>Get Started Free</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-500 text-white hover:bg-white/10"
              asChild
            >
              <Link to="#features">Learn More</Link>
            </Button>
          </motion.div>
        </div>
        {/* Right Side - Cards Grid with Glow */}
        <motion.div
          variants={fadeIn}
          className="flex-1 flex justify-center items-center min-h-full relative w-full"
        >
          {/* Neon Glow */}
          <div className="absolute -inset-6 pointer-events-none z-0 rounded-3xl bg-gradient-to-tr from-purple-600/30 to-blue-500/20 blur-2xl opacity-70" />
          {/* Cards Grid */}
          <div
            className="
              relative z-10 
              grid grid-cols-1 
              sm:grid-cols-2 sm:grid-rows-2 
              gap-4 sm:gap-6
              w-full 
              max-w-xs
              sm:max-w-[350px]
              md:w-[400px] md:max-w-[400px] 
              mx-auto
            "
          >
            {mockCards.map((card, idx) => (
              <Card key={idx} {...card} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
