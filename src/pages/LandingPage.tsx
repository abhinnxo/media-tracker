
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <div className="flex-1 text-center md:text-left">
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
              className="flex-1 relative"
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
                        <Badge>Movie</Badge>
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
                        <Badge>Book</Badge>
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
                        <Badge>TV Series</Badge>
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
                        <Badge>Anime</Badge>
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

      {/* Media Type Icons */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Film className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Movies</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Tv className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300 font-medium">TV Series</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Books</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                <Flame className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Anime</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <LayoutList className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Manga</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
              Powerful Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to track your entertainment</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              All your movies, TV shows, books, anime, and manga in one place with powerful organization tools.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow"
              >
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Discovery Section */}
      <section id="discover" className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
              Discover
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore and track different media</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Browse through our extensive catalog of entertainment across multiple formats.
            </p>
          </div>

          <Tabs defaultValue="movies" className="w-full max-w-5xl mx-auto">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="movies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">Movies</TabsTrigger>
              <TabsTrigger value="tvShows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">TV Shows</TabsTrigger>
              <TabsTrigger value="books" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">Books</TabsTrigger>
              <TabsTrigger value="anime" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">Anime</TabsTrigger>
              <TabsTrigger value="manga" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">Manga</TabsTrigger>
            </TabsList>

            {Object.entries(sampleMedia).map(([category, items]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[2/3] relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="absolute bottom-4 left-4 right-4">
                            <Badge className="mb-2" variant="secondary">{item.type}</Badge>
                            <h3 className="text-white font-bold text-lg">{item.title}</h3>
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                              <span className="text-white text-sm">{item.rating}</span>
                              <span className="text-white/70 text-sm ml-2">({item.year})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardFooter className="p-4 flex justify-between items-center bg-white dark:bg-slate-900">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSave(item.id)}
                          className={savedItems.has(item.id) ? "text-purple-600 dark:text-purple-400" : ""}
                        >
                          {savedItems.has(item.id) ? (
                            <>
                              <Heart className="h-4 w-4 mr-2" fill="currentColor" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Heart className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Clock className="h-4 w-4 mr-2" />
                          Add to List
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600" asChild>
              <Link to="/register">
                <span>Get Started to Track More</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What our users are saying</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join thousands of entertainment enthusiasts who love organizing their watching and reading experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.avatar}`} />
                      <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300 dark:text-slate-700"}`}
                    />
                  ))}
                </div>

                <p className="text-slate-600 dark:text-slate-300">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">Media Types</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-white transition-colors">Movies</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">TV Series</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Books</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Anime</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Manga</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-white transition-colors">Track Progress</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Create Lists</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Rate & Review</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Stats & Insights</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Recommendations</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-lg font-bold text-white">MediaTracker</span>
            </div>

            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} MediaTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
