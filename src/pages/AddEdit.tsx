
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { MediaForm } from '@/components/MediaForm';
import { MediaItem } from '@/lib/types';
import { mediaStore } from '@/lib/store';
import { AnimatedTransition } from '@/components/AnimatedTransition';

const AddEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mediaItem, setMediaItem] = useState<MediaItem | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!!id);
  
  useEffect(() => {
    const fetchMediaItem = async () => {
      if (!id) return;
      
      try {
        const item = await mediaStore.getById(id);
        setMediaItem(item);
      } catch (error) {
        console.error('Error fetching media item:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchMediaItem();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <AnimatedTransition variant="fadeIn">
        <h1 className="text-3xl font-semibold mb-6">
          {id ? 'Edit Media' : 'Add New Media'}
        </h1>
        <MediaForm initialData={mediaItem} />
      </AnimatedTransition>
    </Layout>
  );
};

export default AddEdit;
