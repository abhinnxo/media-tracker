
import React from 'react';
import { Layout } from '@/components/Layout';
import { ProfileEditor } from '@/components/ProfileEditor';
import { ProfileAppearance } from '@/components/ProfileAppearance';
import { ProfileShowcase } from '@/components/ProfileShowcase';
import { ProfileSocial } from '@/components/ProfileSocial';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedTransition } from '@/components/AnimatedTransition';

const Profile = () => {
  return (
    <Layout>
      <AnimatedTransition variant="fadeIn" className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Customize your profile and appearance settings
        </p>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <ProfileEditor />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <ProfileAppearance />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="showcase" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <ProfileShowcase />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <ProfileSocial />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedTransition>
    </Layout>
  );
};

export default Profile;
