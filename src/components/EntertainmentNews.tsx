
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { newsApi, NewsResult } from '@/lib/api/news';
import { Newspaper, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function EntertainmentNews() {
  const [news, setNews] = useState<NewsResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const results = await newsApi.getEntertainmentNews();
        setNews(results);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading entertainment news...</span>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Newspaper className="h-12 w-12 mb-2" />
        <p>No entertainment news available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((article) => (
        <Card key={article.id} className="overflow-hidden">
          <div className="md:flex">
            {article.imageUrl && (
              <div className="md:w-1/3">
                <div className="h-48 md:h-full">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className={`${article.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
              <CardHeader>
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <span className="font-medium">{article.source}</span>
                  <span className="mx-1">•</span>
                  <span>
                    {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2">{article.summary}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read More <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
