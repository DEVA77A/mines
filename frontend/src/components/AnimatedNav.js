import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Home, Layers } from 'lucide-react';

export default function AnimatedNav() {
  const items = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'dashboard', label: 'Dashboard', icon: Layers },
    { key: 'menu', label: 'Menu', icon: Menu }
  ];

  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} className="text-xl font-bold text-purple-700">
            Rockfall
          </motion.div>
        </div>

        <div className="flex items-center space-x-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <motion.button key={it.key} whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50" data-cursor="pointer">
                <Icon className="w-4 h-4" />
                <span>{it.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
