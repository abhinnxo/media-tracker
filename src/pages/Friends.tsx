
import React from 'react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Layout } from '@/components/Layout';
import { Friends as FriendsComponent } from '@/components/Friends';

const Friends = () => {
  return (
    <AnimatedTransition>
      <Layout>
        <FriendsComponent />
      </Layout>
    </AnimatedTransition>
  );
};

export default Friends;
