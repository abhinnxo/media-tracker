
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { storageService } from '@/lib/storage-service';
import { useAuth } from '@/contexts/AuthContext';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    is_public?: boolean;
  } | null;
  onSave: (updatedList: any) => void;
}

export const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  onClose,
  list,
  onSave
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_public: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (list) {
      setFormData({
        name: list.name || '',
        description: list.description || '',
        image_url: list.image_url || '',
        is_public: list.is_public || false
      });
    }
  }, [list]);

  const handleImageUpload = async (file: File) => {
    if (!user) return;

    try {
      const imageUrl = await storageService.uploadImage(file, user.id);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        setImageFile(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image"
      });
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!list || !user) return;

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "List name is required"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('custom_lists')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          image_url: formData.image_url || null,
          is_public: formData.is_public
        })
        .eq('id', list.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "List updated successfully"
      });

      onSave(data);
      onClose();
    } catch (error) {
      console.error('Error updating list:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update list"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter list name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter list description (optional)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="space-y-2">
              {formData.image_url ? (
                <div className="relative inline-block">
                  <img
                    src={formData.image_url}
                    alt="List cover"
                    className="w-32 h-20 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                    onClick={handleImageRemove}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-32 h-20 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Upload</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              disabled={isLoading}
            />
            <Label htmlFor="is_public">Make this list public</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
