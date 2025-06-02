import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { MediaItem, MediaCategory, MediaStatus } from '@/lib/types';
import { mediaStore } from '@/lib/store';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartPie,
  ChartLine,
  ChartBar,
  Plus,
  Tag,
  Star,
  LayoutDashboard
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { format, subMonths, parseISO } from 'date-fns';

const MEDIA_COLORS = {
  [MediaCategory.MOVIE]: '#8B5CF6',
  [MediaCategory.TV_SERIES]: '#0EA5E9',
  [MediaCategory.ANIME]: '#F97316',
  [MediaCategory.BOOK]: '#22C55E',
  [MediaCategory.MANGA]: '#D946EF',
};

const STATUS_COLORS = {
  [MediaStatus.COMPLETED]: '#22C55E',
  [MediaStatus.IN_PROGRESS]: '#0EA5E9',
  [MediaStatus.TO_CONSUME]: '#8B5CF6',
  [MediaStatus.ON_HOLD]: '#F97316',
  [MediaStatus.DROPPED]: '#EF4444',
};

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; category: MediaCategory; }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; status: MediaStatus; }[]>([]);
  const [monthlyActivityData, setMonthlyActivityData] = useState<{ name: string; value: number; }[]>([]);
  const [genreData, setGenreData] = useState<{ name: string; value: number; }[]>([]);
  const [tagData, setTagData] = useState<{ text: string; value: number; }[]>([]);
  const [ratingData, setRatingData] = useState<{ rating: number; count: number; }[]>([]);
  const [averageRatingData, setAverageRatingData] = useState<{ category: string; rating: number; }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all media items
        const items = await mediaStore.getAll();
        setMediaItems(items);

        // Process data for various charts
        processMediaData(items);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processMediaData = (items: MediaItem[]) => {
    if (items.length === 0) return;

    // Media Category Distribution
    const categoryCount: Record<string, number> = {};
    Object.values(MediaCategory).forEach(category => {
      categoryCount[category] = 0;
    });

    items.forEach(item => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      }
    });

    const categoryChartData = Object.entries(categoryCount)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: getCategoryName(category as MediaCategory),
        value: count,
        category: category as MediaCategory
      }));
    setCategoryData(categoryChartData);

    // Status Distribution
    const statusCount: Record<string, number> = {};
    Object.values(MediaStatus).forEach(status => {
      statusCount[status] = 0;
    });

    items.forEach(item => {
      if (item.status) {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1;
      }
    });

    const statusChartData = Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: getStatusName(status as MediaStatus),
        value: count,
        status: status as MediaStatus
      }));
    setStatusData(statusChartData);

    // Monthly Activity
    const monthlyActivity: Record<string, number> = {};
    // Initialize with last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'MMM yyyy');
      monthlyActivity[monthKey] = 0;
    }

    items.forEach(item => {
      if (item.created_at) {
        try {
          const createdDate = parseISO(item.created_at);
          const monthKey = format(createdDate, 'MMM yyyy');

          if (monthlyActivity[monthKey] !== undefined) {
            monthlyActivity[monthKey] += 1;
          }
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
    });

    const monthlyChartData = Object.entries(monthlyActivity).map(([month, count]) => ({
      name: month,
      value: count
    }));
    setMonthlyActivityData(monthlyChartData);

    // Genre breakdown
    const genreCount: Record<string, number> = {};
    items.forEach(item => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    const genreChartData = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre, count]) => ({
        name: genre,
        value: count
      }));
    setGenreData(genreChartData);

    // Tag cloud
    const tagCount: Record<string, number> = {};
    items.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    const tagChartData = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({
        text: tag,
        value: count
      }));
    setTagData(tagChartData);

    // Rating stats
    const ratings: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    items.forEach(item => {
      if (item.rating && item.rating > 0 && item.rating <= 5) {
        ratings[item.rating] = (ratings[item.rating] || 0) + 1;
      }
    });

    const ratingChartData = Object.entries(ratings).map(([rating, count]) => ({
      rating: parseInt(rating, 10),
      count: count
    }));
    setRatingData(ratingChartData);

    // Average rating by category
    const categoryRatings: Record<string, { sum: number; count: number }> = {};
    Object.values(MediaCategory).forEach(category => {
      categoryRatings[category] = { sum: 0, count: 0 };
    });

    items.forEach(item => {
      if (item.category && item.rating && item.rating > 0) {
        categoryRatings[item.category].sum += item.rating;
        categoryRatings[item.category].count += 1;
      }
    });

    const avgRatingData = Object.entries(categoryRatings)
      .filter(([_, data]) => data.count > 0)
      .map(([category, data]) => ({
        category: getCategoryName(category as MediaCategory),
        rating: parseFloat((data.sum / data.count).toFixed(1))
      }));
    setAverageRatingData(avgRatingData);
  };

  const getCategoryName = (category: MediaCategory): string => {
    switch (category) {
      case MediaCategory.MOVIE: return 'Movies';
      case MediaCategory.TV_SERIES: return 'TV Series';
      case MediaCategory.ANIME: return 'Anime';
      case MediaCategory.BOOK: return 'Books';
      case MediaCategory.MANGA: return 'Manga';
      default: return category;
    }
  };

  const getStatusName = (status: MediaStatus): string => {
    switch (status) {
      case MediaStatus.TO_CONSUME: return 'To Watch/Read';
      case MediaStatus.IN_PROGRESS: return 'In Progress';
      case MediaStatus.COMPLETED: return 'Completed';
      case MediaStatus.ON_HOLD: return 'On Hold';
      case MediaStatus.DROPPED: return 'Dropped';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const hasAnyMedia = mediaItems.length > 0;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <AnimatedTransition variant="fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold mb-1">Media Dashboard</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Insights and statistics of your media collection
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/add" className="flex items-center justify-center">
                <Plus className="mr-1 h-4 w-4" /> Add Media
              </Link>
            </Button>
          </div>
        </AnimatedTransition>

        {!hasAnyMedia ? (
          <div className="flex flex-col items-center justify-center text-center py-12 sm:py-20 px-4">
            <LayoutDashboard className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl sm:text-2xl font-medium">No media data yet</h2>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md">
              Add some movies, books, or shows to see your statistics here
            </p>
            <Button asChild>
              <Link to="/add">Add Your First Media</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {/* Media Overview */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg font-medium">Media Overview</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Distribution by media type</CardDescription>
                </div>
                <ChartPie className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer
                  className="h-[250px] sm:h-[300px]"
                  config={{
                    media: { theme: { light: '#f472b6', dark: '#f472b6' } }
                  }}
                >
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={12}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={MEDIA_COLORS[entry.category] || `hsl(${index * 45}, 70%, 60%)`}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Completion Status */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg font-medium">Completion Status</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Media status breakdown</CardDescription>
                </div>
                <ChartPie className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer className="h-[250px] sm:h-[300px]" config={{}}>
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="35%"
                      outerRadius="70%"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={12}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || `hsl(${index * 45}, 70%, 60%)`}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Monthly Activity */}
            <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg font-medium">Monthly Activity</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Media items added per month</CardDescription>
                </div>
                <ChartLine className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer className="h-[250px] sm:h-[300px]" config={{}}>
                  <LineChart
                    data={monthlyActivityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis width={40} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Genre Breakdown */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg font-medium">Genre Breakdown</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Most common genres across all media</CardDescription>
                </div>
                <ChartBar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer className="h-[300px] sm:h-[400px]" config={{}}>
                  <BarChart
                    layout="vertical"
                    data={genreData}
                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={70}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      fill="#0ea5e9"
                      name="Count"
                      barSize={25}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Rating Stats */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg font-medium">Rating Distribution</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Frequency of each rating</CardDescription>
                </div>
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer className="h-[250px] sm:h-[300px]" config={{}}>
                  <BarChart
                    data={ratingData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                    <XAxis
                      dataKey="rating"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `${value}★`}
                    />
                    <YAxis width={30} tick={{ fontSize: 10 }} />
                    <ChartTooltip
                      formatter={(value, name) => [`${value} items`, `${name} stars`]}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="count"
                      name="Rating"
                      fill="#f97316"
                      barSize={30}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Tags */}
            <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg font-medium">Top Tags</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Most used tags in your library</CardDescription>
                </div>
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-wrap gap-2 pt-4 max-h-[200px] sm:max-h-[250px] overflow-y-auto">
                  {tagData.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm shrink-0"
                      style={{
                        fontSize: `${Math.max(0.65, Math.min(1.2, 0.75 + (tag.value / Math.max(...tagData.map(t => t.value)) * 0.45)))}rem`
                      }}
                    >
                      {tag.text} ({tag.value})
                    </div>
                  ))}

                  {tagData.length === 0 && (
                    <p className="text-muted-foreground text-sm p-4">No tags found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Average Rating by Category */}
            <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg font-medium">Average Rating by Media Type</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">How you rate different types of media</CardDescription>
                </div>
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer className="h-[250px] sm:h-[300px]" config={{}}>
                  <BarChart
                    data={averageRatingData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                      width={30}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip
                      formatter={(value) => [`${value} / 5`, "Avg Rating"]}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="rating"
                      name="Avg Rating"
                      fill="#8b5cf6"
                      barSize={50}
                      radius={[4, 4, 0, 0]}
                    >
                      {averageRatingData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={MEDIA_COLORS[entry.category as unknown as MediaCategory] || "#8b5cf6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
