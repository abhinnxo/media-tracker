
import React from 'react';
import { motion } from 'framer-motion';

type AnimationVariant = 'fadeIn' | 'slideUp' | 'slideRight' | 'scaleIn' | 'none';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  className?: string;
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  variant = 'fadeIn',
  delay = 0,
  className = '',
}) => {
  // Animation variants
  const variants = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.4, delay } },
      exit: { opacity: 0, transition: { duration: 0.2 } }
    },
    slideUp: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay } },
      exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
    },
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.4, delay } },
      exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.4, delay } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    },
    none: {
      initial: {},
      animate: {},
      exit: {}
    }
  };

  const selectedVariant = variants[variant];

  if (variant === 'none') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTransition;
