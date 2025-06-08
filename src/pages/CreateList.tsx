
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload } from 'lucide-react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { listsService } from '@/lib/lists-service';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateListForm {
  name: string;
  description: string;
  privacy_setting: 'private' | 'public';
  cover_image_url?: string;
}

const CreateList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateListForm>({
    defaultValues: {
      name: '',
      description: '',
      privacy_setting: 'private',
      cover_image_url: ''
    }
  });

  const onSubmit = async (data: CreateListForm) => {
    if (!user) {
      toast.error('You must be logged in to create a list');
      return;
    }

    setIsLoading(true);
    try {
      const newList = await listsService.createList(user.id, data);
      if (newList) {
        toast.success('List created successfully!');
        navigate('/lists');
      } else {
        toast.error('Failed to create list');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <AnimatedTransition variant="fadeIn">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lists">
                <ArrowLeft className="h-4 w-4" />
                Back to Lists
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Create New List</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Organize your media into custom collections
              </p>
            </div>
          </div>
        </AnimatedTransition>

        <AnimatedTransition variant="slideUp" delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>List Details</CardTitle>
              <CardDescription>
                Create a custom list to organize your favorite media items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'List name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>List Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter list name..." 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose a descriptive name for your list
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this list is about..."
                            rows={3}
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description to help you remember what this list is for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacy_setting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Privacy Setting</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select privacy setting" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="private">Private - Only I can see this list</SelectItem>
                            <SelectItem value="public">Public - Anyone can view this list</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose who can view your list
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cover_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input 
                              placeholder="https://example.com/image.jpg"
                              {...field} 
                              disabled={isLoading}
                            />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Upload className="h-4 w-4" />
                              <span>Enter an image URL for your list cover</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Optional cover image to make your list stand out
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? 'Creating...' : 'Create List'}
                    </Button>
                    <Button type="button" variant="outline" asChild disabled={isLoading}>
                      <Link to="/lists">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </AnimatedTransition>
      </div>
    </Layout>
  );
};

export default CreateList;
