
import React from 'react';
import { Film, Tv, BookOpen, Flame, LayoutList } from 'lucide-react';

const MediaTypeIcons: React.FC = () => (
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
);

export default MediaTypeIcons;
