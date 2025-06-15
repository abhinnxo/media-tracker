
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Clock, ArrowRight } from 'lucide-react';
import { Card, CardFooter } from '@/components/ui/card';

interface MediaType {
  id: number;
  title: string;
  year: string;
  type: string;
  rating: number;
  image: string;
}

interface ContentDiscoverySectionProps {
  sampleMedia: Record<string, MediaType[]>;
  savedItems: Set<number>;
  toggleSave: (id: number) => void;
}

const ContentDiscoverySection: React.FC<ContentDiscoverySectionProps> = ({
  sampleMedia,
  savedItems,
  toggleSave,
}) => (
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
);

export default ContentDiscoverySection;
