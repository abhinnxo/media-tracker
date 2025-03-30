
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';

// Mock data for now - in a real application, this would fetch from various APIs
export const mediaDetailsApi = {
  getDetails: async (id: string, category: MediaCategory) => {
    // Check cache first
    const cacheKey = `details:${category}:${id}`;
    const cachedData = cacheService.get(cacheKey, category);
    if (cachedData) return cachedData;
    
    // If this were a real implementation, we would fetch detailed data from 
    // appropriate APIs based on the media category
    try {
      let details;
      
      switch (category) {
        case MediaCategory.MOVIE:
        case MediaCategory.TV_SERIES:
          details = await fetchMovieOrTVDetails(id, category);
          break;
        case MediaCategory.ANIME:
          details = await fetchAnimeDetails(id);
          break;
        case MediaCategory.MANGA:
          details = await fetchMangaDetails(id);
          break;
        case MediaCategory.BOOK:
          details = await fetchBookDetails(id);
          break;
        default:
          throw new Error('Unknown media category');
      }
      
      // Cache the results
      cacheService.set(cacheKey, details, category);
      
      return details;
    } catch (error) {
      console.error(`Error fetching details for ${category} with ID ${id}:`, error);
      return null;
    }
  }
};

// Fetch movie or TV show details from TMDb API
async function fetchMovieOrTVDetails(id: string, category: MediaCategory) {
  const isMovie = category === MediaCategory.MOVIE;
  const endpoint = isMovie ? 'movie' : 'tv';
  
  try {
    // Fetch basic details
    const response = await fetch(
      `https://api.themoviedb.org/3/${endpoint}/${id}?api_key=2dca580c2a14b55200e784d157207b4d&append_to_response=videos,credits`
    );
    
    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Find trailer
    let trailerKey = null;
    if (data.videos && data.videos.results) {
      const trailer = data.videos.results.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      trailerKey = trailer ? trailer.key : null;
    }
    
    // Extract cast and crew
    const cast = data.credits?.cast?.slice(0, 10).map((person: any) => ({
      name: person.name,
      character: person.character,
      profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : null,
    }));
    
    const crew = data.credits?.crew?.slice(0, 10).map((person: any) => ({
      name: person.name,
      job: person.job,
      department: person.department,
      profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : null,
    }));
    
    // Extract rating
    const rating = data.vote_average ? (data.vote_average / 2).toFixed(1) : null;
    const voteCount = data.vote_count || null;
    
    // For demo purposes, we'll add mock streaming availability
    // In a real app, you'd use a service like JustWatch API
    const whereToWatch = getMockStreamingServices(isMovie);
    
    // External links
    const externalLinks = [
      {
        site: 'TMDb',
        url: `https://www.themoviedb.org/${endpoint}/${id}`,
      },
      {
        site: 'IMDb',
        url: data.imdb_id ? `https://www.imdb.com/title/${data.imdb_id}` : null,
      },
    ].filter(link => link.url !== null);
    
    return {
      rating,
      voteCount,
      cast,
      crew,
      trailer: trailerKey,
      whereToWatch,
      externalLinks,
    };
  } catch (error) {
    console.error('Error fetching movie/TV details:', error);
    return null;
  }
}

// Fetch anime details from Jikan API
async function fetchAnimeDetails(id: string) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
    
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }
    
    const data = await response.json();
    const anime = data.data;
    
    // Extract rating
    const rating = anime.score ? (anime.score / 2).toFixed(1) : null;
    const voteCount = anime.scored_by || null;
    
    // External links
    const externalLinks = [
      {
        site: 'MyAnimeList',
        url: `https://myanimelist.net/anime/${id}`,
      },
    ];
    
    // Add any streaming links from the API
    if (anime.streaming) {
      anime.streaming.forEach((stream: any) => {
        externalLinks.push({
          site: stream.name,
          url: stream.url,
        });
      });
    }
    
    // Add a mock YouTube trailer if available
    let trailerKey = null;
    if (anime.trailer && anime.trailer.youtube_id) {
      trailerKey = anime.trailer.youtube_id;
    }
    
    return {
      rating,
      voteCount,
      trailer: trailerKey,
      externalLinks: externalLinks.filter(link => link.url !== null),
      whereToWatch: getMockAnimeStreamingServices(),
    };
  } catch (error) {
    console.error('Error fetching anime details:', error);
    return null;
  }
}

// Fetch manga details
async function fetchMangaDetails(id: string) {
  try {
    const response = await fetch(`https://api.mangadex.org/manga/${id}`);
    
    if (!response.ok) {
      throw new Error(`MangaDex API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // External links
    const externalLinks = [
      {
        site: 'MangaDex',
        url: `https://mangadex.org/title/${id}`,
      },
    ];
    
    return {
      externalLinks,
      whereToWatch: getMockMangaReadingServices(),
    };
  } catch (error) {
    console.error('Error fetching manga details:', error);
    return null;
  }
}

// Fetch book details
async function fetchBookDetails(id: string) {
  try {
    const response = await fetch(`https://openlibrary.org/works/${id}.json`);
    
    if (!response.ok) {
      throw new Error(`OpenLibrary API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // External links
    const externalLinks = [
      {
        site: 'Open Library',
        url: `https://openlibrary.org/works/${id}`,
      },
      {
        site: 'Goodreads',
        url: `https://www.goodreads.com/book/show/${id}`,
      },
    ];
    
    return {
      externalLinks,
      whereToWatch: getMockBookPurchaseServices(),
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}

// Mock data for streaming services
function getMockStreamingServices(isMovie: boolean) {
  return [
    {
      name: 'Netflix',
      url: 'https://www.netflix.com',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Netflix_2015_N_logo.svg/1200px-Netflix_2015_N_logo.svg.png',
    },
    {
      name: 'Hulu',
      url: 'https://www.hulu.com',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hulu_Logo.svg/1200px-Hulu_Logo.svg.png',
    },
    {
      name: 'Amazon Prime',
      url: 'https://www.amazon.com/Prime-Video/b?node=2676882011',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/1200px-Amazon_Prime_Video_logo.svg.png',
    },
    {
      name: 'Disney+',
      url: 'https://www.disneyplus.com',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/1200px-Disney%2B_logo.svg.png',
    },
    {
      name: isMovie ? 'Paramount+' : 'HBO Max',
      url: isMovie ? 'https://www.paramountplus.com' : 'https://www.hbomax.com',
      logo: isMovie ? 
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Paramount_Plus.svg/1200px-Paramount_Plus.svg.png' : 
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/HBO_Max_Logo.svg/1200px-HBO_Max_Logo.svg.png',
    },
  ];
}

function getMockAnimeStreamingServices() {
  return [
    {
      name: 'Crunchyroll',
      url: 'https://www.crunchyroll.com',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Crunchyroll_Logo.png/1200px-Crunchyroll_Logo.png',
    },
    {
      name: 'Funimation',
      url: 'https://www.funimation.com',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Funimation_Logo.svg/1200px-Funimation_Logo.svg.png',
    },
    {
      name: 'HIDIVE',
      url: 'https://www.hidive.com',
      logo: null,
    },
    {
      name: 'Netflix',
      url: 'https://www.netflix.com',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Netflix_2015_N_logo.svg/1200px-Netflix_2015_N_logo.svg.png',
    },
  ];
}

function getMockMangaReadingServices() {
  return [
    {
      name: 'MangaDex',
      url: 'https://mangadex.org',
      logo: null,
    },
    {
      name: 'ComiXology',
      url: 'https://www.comixology.com',
      logo: null,
    },
    {
      name: 'VIZ',
      url: 'https://www.viz.com',
      logo: null,
    },
    {
      name: 'Crunchyroll Manga',
      url: 'https://www.crunchyroll.com/comics/manga',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Crunchyroll_Logo.png/1200px-Crunchyroll_Logo.png',
    },
  ];
}

function getMockBookPurchaseServices() {
  return [
    {
      name: 'Amazon',
      url: 'https://www.amazon.com',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png',
    },
    {
      name: 'Barnes & Noble',
      url: 'https://www.barnesandnoble.com',
      logo: null,
    },
    {
      name: 'Apple Books',
      url: 'https://www.apple.com/apple-books',
      logo: null,
    },
    {
      name: 'Kobo',
      url: 'https://www.kobo.com',
      logo: null,
    },
  ];
}
