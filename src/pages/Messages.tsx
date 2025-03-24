
import React from 'react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Layout } from '@/components/Layout';
import { Messages as MessagesComponent } from '@/components/Messages';

const Messages = () => {
  return (
    <AnimatedTransition>
      <Layout>
        <MessagesComponent />
      </Layout>
    </AnimatedTransition>
  );
};

export default Messages;
