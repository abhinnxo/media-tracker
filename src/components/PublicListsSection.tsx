
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listsService, CustomList } from '@/lib/lists-service';
import { Eye, Lock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PublicListsSectionProps {
  userId: string;
  isOwnProfile?: boolean;
}

export const PublicListsSection: React.FC<PublicListsSectionProps> = ({
  userId,
  isOwnProfile = false
}) => {
  const [publicLists, setPublicLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicLists = async () => {
      setLoading(true);
      try {
        const allLists = await listsService.getLists(userId);
        const filteredLists = allLists.filter(list => list.is_public);
        setPublicLists(filteredLists);
      } catch (error) {
        console.error('Error fetching public lists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicLists();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Public Lists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (publicLists.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Public Lists</h3>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isOwnProfile 
                ? "You haven't made any lists public yet" 
                : "This user hasn't shared any public lists"}
            </p>
            {isOwnProfile && (
              <p className="text-sm text-muted-foreground mt-2">
                Make some of your lists public to share them with others!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Public Lists</h3>
        <span className="text-sm text-muted-foreground">
          {publicLists.length} list{publicLists.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicLists.map((list) => (
          <Card key={list.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base line-clamp-1">{list.name}</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {list.cover_image_url && (
                <div 
                  className="w-full h-24 bg-cover bg-center rounded-md mb-3"
                  style={{ backgroundImage: `url(${list.cover_image_url})` }}
                />
              )}
              {list.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {list.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(list.updated_at).toLocaleDateString()}
                </span>
                <Link to={`/lists/${list.id}`}>
                  <Button variant="outline" size="sm">
                    View List
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
