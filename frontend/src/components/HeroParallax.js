import React from 'react';
import { motion } from 'framer-motion';

export default function HeroParallax() {
  return (
    <section className="relative w-full h-64 lg:h-96 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-500 opacity-90"></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-start justify-center h-full px-6 lg:px-20"
      >
        <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-2">Tamil Nadu Mine Risk Dashboard</h2>
        <p className="text-white/90 max-w-xl">Interactive AI-powered rockfall risk visualizations — explore mines, see predictions, and act faster.</p>
      </motion.div>

      {/* subtle floating shapes */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-10 top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-10 bottom-8 w-56 h-56 bg-white/8 rounded-full blur-2xl"
      />
    </section>
  );
}
