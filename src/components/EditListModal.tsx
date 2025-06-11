
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from '@/hooks/use-toast';
import { listsService, CustomList } from '@/lib/lists-service';
import { X } from 'lucide-react';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listData: CustomList | null;
  onSave: (updatedList: CustomList) => void;
}

export const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  onClose,
  listData,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_image_url: '',
    is_public: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (listData) {
      const newFormData = {
        name: listData.name || '',
        description: listData.description || '',
        cover_image_url: listData.cover_image_url || '',
        is_public: listData.is_public || false
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [listData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleImageUpload = (imageUrl: string) => {
    handleInputChange('cover_image_url', imageUrl);
  };

  const handleImageRemove = () => {
    handleInputChange('cover_image_url', '');
  };

  const handleSave = async () => {
    if (!listData || !formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "List name is required"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedList = await listsService.updateList(listData.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        cover_image_url: formData.cover_image_url || null,
        is_public: formData.is_public
      });

      if (updatedList) {
        onSave(updatedList);
        onClose();
        toast({
          title: "Success",
          description: "List updated successfully"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update list"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit List
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* List Name */}
          <div className="space-y-2">
            <Label htmlFor="list-name">List Name *</Label>
            <Input
              id="list-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter list name"
              maxLength={100}
            />
          </div>

          {/* List Description */}
          <div className="space-y-2">
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your list..."
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload
              currentImage={formData.cover_image_url}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              bucketName="list-covers"
              className="h-32"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is-public">Make List Public</Label>
              <p className="text-sm text-muted-foreground">
                Public lists can be viewed by other users
              </p>
            </div>
            <Switch
              id="is-public"
              checked={formData.is_public}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || !formData.name.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
