import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Tv, Film, Bookmark,
  Star, RefreshCw, LineChart, Search,
  ArrowRight, ChevronRight, Clock, Flame,
  Heart, LayoutList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import HeroSection from './landing/HeroSection';
import MediaTypeIcons from './landing/MediaTypeIcons';
import FeaturesSection from './landing/FeaturesSection';
import ContentDiscoverySection from './landing/ContentDiscoverySection';
import TestimonialsSection from './landing/TestimonialsSection';
import CTASection from './landing/CTASection';
import FooterSection from './landing/FooterSection';

// Define sample media items for different categories
const sampleMedia = {
  movies: [
    { id: 1, title: "Inception", year: "2010", type: "Movie", rating: 4.8, image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&auto=format&fit=crop" },
    { id: 2, title: "The Shawshank Redemption", year: "1994", type: "Movie", rating: 4.9, image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&auto=format&fit=crop" },
    { id: 3, title: "Pulp Fiction", year: "1994", type: "Movie", rating: 4.7, image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=500&h=750&auto=format&fit=crop" },
  ],
  tvShows: [
    { id: 4, title: "Breaking Bad", year: "2008-2013", type: "TV Series", rating: 4.9, image: "https://images.unsplash.com/photo-1559108318-39ed452bb6c9?w=500&h=750&auto=format&fit=crop" },
    { id: 5, title: "Game of Thrones", year: "2011-2019", type: "TV Series", rating: 4.7, image: "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=500&h=750&auto=format&fit=crop" },
    { id: 6, title: "Stranger Things", year: "2016-Present", type: "TV Series", rating: 4.6, image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&h=750&auto=format&fit=crop" },
  ],
  books: [
    { id: 7, title: "To Kill a Mockingbird", year: "1960", type: "Book", rating: 4.8, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=750&auto=format&fit=crop" },
    { id: 8, title: "1984", year: "1949", type: "Book", rating: 4.7, image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&h=750&auto=format&fit=crop" },
    { id: 9, title: "The Great Gatsby", year: "1925", type: "Book", rating: 4.5, image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=750&auto=format&fit=crop" },
  ],
  anime: [
    { id: 10, title: "Attack on Titan", year: "2013-2023", type: "Anime", rating: 4.8, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&h=750&auto=format&fit=crop" },
    { id: 11, title: "My Hero Academia", year: "2016-Present", type: "Anime", rating: 4.6, image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&h=750&auto=format&fit=crop" },
    { id: 12, title: "Demon Slayer", year: "2019-Present", type: "Anime", rating: 4.7, image: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=500&h=750&auto=format&fit=crop" },
  ],
  manga: [
    { id: 13, title: "One Piece", year: "1997-Present", type: "Manga", rating: 4.9, image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=500&h=750&auto=format&fit=crop" },
    { id: 14, title: "Naruto", year: "1999-2014", type: "Manga", rating: 4.7, image: "https://images.unsplash.com/photo-1598237601465-af66b7475e92?w=500&h=750&auto=format&fit=crop" },
    { id: 15, title: "Death Note", year: "2003-2006", type: "Manga", rating: 4.8, image: "https://images.unsplash.com/photo-1515125520141-3e3b67bc0a88?w=500&h=750&auto=format&fit=crop" },
  ]
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = React.useState<Set<number>>(new Set());

  const toggleSave = (id: number) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Features list
  const features = [
    {
      icon: <LayoutList className="h-8 w-8 text-primary" />,
      title: "All Media Types",
      description: "Track movies, TV shows, books, anime, and manga all in one place."
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-primary" />,
      title: "Progress Tracking",
      description: "Keep track of what you're watching, reading, and what's next on your list."
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Ratings & Reviews",
      description: "Rate and review everything you consume to remember what you loved."
    },
    {
      icon: <LineChart className="h-8 w-8 text-primary" />,
      title: "Stats & Insights",
      description: "Visualize your entertainment habits with beautiful charts and insights."
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Discover",
      description: "Find new content based on what you already enjoy."
    },
    {
      icon: <Bookmark className="h-8 w-8 text-primary" />,
      title: "Lists & Collections",
      description: "Create custom lists to organize your entertainment however you want."
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Alex T.",
      avatar: "AT",
      role: "Film Enthusiast",
      content: "Finally found an app that lets me track everything I watch and read in one place. The statistics feature is amazing!",
      rating: 5
    },
    {
      name: "Samantha W.",
      avatar: "SW",
      role: "Book Lover",
      content: "I used to keep track of my reading in a spreadsheet. This is SO much better and more visual. Love it!",
      rating: 5
    },
    {
      name: "Hiroshi K.",
      avatar: "HK",
      role: "Anime Fan",
      content: "Being able to track both anime and manga in the same app is perfect. The seasonal anime tracking is exactly what I needed.",
      rating: 4
    },
    {
      name: "Emily R.",
      avatar: "ER",
      role: "TV Series Binger",
      content: "No more forgetting which episode I was on! This app has completely changed how I keep track of TV shows.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
                  M
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  MediaTracker
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="#features" className="text-slate-600 hover:text-primary dark:text-slate-300 px-3 py-2 rounded-md text-sm font-medium">
                Features
              </Link>
              <Link to="#discover" className="text-slate-600 hover:text-primary dark:text-slate-300 px-3 py-2 rounded-md text-sm font-medium">
                Discover
              </Link>
              <Link to="#testimonials" className="text-slate-600 hover:text-primary dark:text-slate-300 px-3 py-2 rounded-md text-sm font-medium">
                Testimonials
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <Button asChild>
                  <Link to="/home">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <HeroSection fadeIn={fadeIn} staggerContainer={staggerContainer} />
      <MediaTypeIcons />
      <FeaturesSection features={features} fadeIn={fadeIn} />
      <ContentDiscoverySection sampleMedia={sampleMedia} savedItems={savedItems} toggleSave={toggleSave} />
      <TestimonialsSection testimonials={testimonials} fadeIn={fadeIn} />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
