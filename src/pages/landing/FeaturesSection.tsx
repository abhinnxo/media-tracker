
import React from 'react';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
  fadeIn: any;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features, fadeIn }) => (
  <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
          Powerful Features
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to track your entertainment</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          All your movies, TV shows, books, anime, and manga in one place with powerful organization tools.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow"
          >
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
