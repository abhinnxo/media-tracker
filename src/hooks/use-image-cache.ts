
import { useState, useEffect } from 'react';

interface ImageCacheOptions {
  placeholder?: string;
  fallback?: string;
  lazyLoad?: boolean;
}

// Image cache with service worker support
class ImageCache {
  private cache = new Map<string, string>();
  private loading = new Set<string>();

  async preload(url: string): Promise<string> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    if (this.loading.has(url)) {
      // Wait for existing load to complete
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.cache.has(url)) {
            resolve(this.cache.get(url)!);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    this.loading.add(url);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, url);
        this.loading.delete(url);
        resolve(url);
      };
      img.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }

  clear() {
    this.cache.clear();
    this.loading.clear();
  }
}

const imageCache = new ImageCache();

export const useImageCache = (src: string | null, options: ImageCacheOptions = {}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setImageSrc(options.fallback || null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    imageCache.preload(src)
      .then((loadedUrl) => {
        setImageSrc(loadedUrl);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setImageSrc(options.fallback || null);
        setIsLoading(false);
      });
  }, [src, options.fallback]);

  return {
    src: imageSrc,
    isLoading,
    error,
    clearCache: () => imageCache.clear()
  };
};
