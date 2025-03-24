
import React from 'react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Layout } from '@/components/Layout';
import { Messages } from '@/components/Messages';

const Conversation = () => {
  return (
    <AnimatedTransition>
      <Layout>
        <Messages />
      </Layout>
    </AnimatedTransition>
  );
};

export default Conversation;
