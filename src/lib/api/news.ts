
interface NewsArticle {
  title: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface NewsResult {
  id: string;
  title: string;
  source: string;
  summary: string;
  imageUrl: string | null;
  url: string;
  publishedAt: string;
}

export const newsApi = {
  getEntertainmentNews: async (): Promise<NewsResult[]> => {
    try {
      // Note: In a real app, this would use a backend API to hide API keys
      // For demo purposes, we'll use a mock response
      
      // Mock entertainment news data
      const mockNews: NewsResult[] = [
        {
          id: '1',
          title: 'New Marvel Movie Sets Box Office Records',
          source: 'Variety',
          summary: 'The latest installment in the Marvel Cinematic Universe has broken opening weekend records worldwide.',
          imageUrl: 'https://picsum.photos/800/500?random=1',
          url: 'https://variety.com',
          publishedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          title: 'Popular Anime Series Gets Live-Action Adaptation',
          source: 'IGN',
          summary: 'Netflix has announced a live-action adaptation of the beloved anime series, with production starting next year.',
          imageUrl: 'https://picsum.photos/800/500?random=2',
          url: 'https://ign.com',
          publishedAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          title: 'TV Show Renewed for Final Season',
          source: 'Entertainment Weekly',
          summary: 'The critically acclaimed drama will return for one final season to wrap up its storylines.',
          imageUrl: 'https://picsum.photos/800/500?random=3',
          url: 'https://ew.com',
          publishedAt: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '4',
          title: 'Classic Manga Series Getting New Adaptation',
          source: 'Anime News Network',
          summary: 'A beloved manga from the 90s will be adapted into a new anime series with modern animation.',
          imageUrl: 'https://picsum.photos/800/500?random=4',
          url: 'https://animenewsnetwork.com',
          publishedAt: new Date(Date.now() - 14400000).toISOString()
        },
        {
          id: '5',
          title: 'Actor Discusses Preparation for Challenging Role',
          source: 'The Hollywood Reporter',
          summary: 'Award-winning actor reveals the intense physical and mental preparation for their latest role.',
          imageUrl: 'https://picsum.photos/800/500?random=5',
          url: 'https://hollywoodreporter.com',
          publishedAt: new Date(Date.now() - 18000000).toISOString()
        }
      ];
      
      return mockNews;
      
      // In a real implementation with NewsAPI:
      /*
      const response = await fetch(`https://newsapi.org/v2/top-headlines?category=entertainment&language=en&apiKey=${API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.articles.map((article: NewsArticle, index: number) => ({
        id: index.toString(),
        title: article.title,
        source: article.source.name,
        summary: article.description || 'No description available',
        imageUrl: article.urlToImage,
        url: article.url,
        publishedAt: article.publishedAt
      }));
      */
    } catch (error) {
      console.error('Error fetching entertainment news:', error);
      return [];
    }
  }
};
