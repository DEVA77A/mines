import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const LoadingScreen = ({ 
  isLoading = true, 
  message = "Loading Tamil Nadu Mining Data...", 
  progress = 0,
  steps = []
}) => {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const defaultSteps = [
    { name: "Initializing System", progress: 0 },
    { name: "Loading Mine Locations", progress: 20 },
    { name: "Fetching Environmental Data", progress: 40 },
    { name: "Processing Satellite Imagery", progress: 60 },
    { name: "Training ML Models", progress: 80 },
    { name: "Finalizing Dashboard", progress: 100 }
  ];

  const loadingSteps = steps.length > 0 ? steps : defaultSteps;
  const currentStepData = loadingSteps[Math.min(currentStep, loadingSteps.length - 1)];

  React.useEffect(() => {
    if (isLoading && currentStep < loadingSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, loadingSteps.length - 1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isLoading, loadingSteps.length]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-slate-900' 
          : 'bg-slate-50'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`} />
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20`} />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              isDarkMode ? 'bg-blue-400/20' : 'bg-blue-500/10'
            }`}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 text-center max-w-md mx-auto px-8 py-12 rounded-3xl border shadow-2xl backdrop-blur-xl ${
        isDarkMode 
          ? 'bg-slate-800/40 border-slate-700/50' 
          : 'bg-white/40 border-white/50'
      }`}>
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30"
        >
          <span className="text-4xl">🏔️</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-3xl font-bold mb-2 tracking-tight ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}
        >
          Rockfall AI System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-sm font-medium mb-8 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Tamil Nadu Mining Safety Platform
        </motion.p>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            {/* Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full"
            />
            
            {/* Inner Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-3 border-4 border-transparent border-t-indigo-500 rounded-full"
            />
            
            {/* Center Dot */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-1/2 w-3 h-3 -ml-1.5 -mt-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/50"
            />
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-6"
        >
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentStepData?.progress || progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium">
            <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>
              0%
            </span>
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {Math.round(currentStepData?.progress || progress)}%
            </span>
            <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>
              100%
            </span>
          </div>
        </motion.div>

        {/* Current Step */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={currentStep}
          className="mb-8"
        >
          <p className={`text-base font-semibold mb-3 ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {currentStepData?.name || message}
          </p>
          
          {/* Step Indicators */}
          <div className="flex justify-center space-x-2">
            {loadingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-blue-500 scale-125' 
                    : isDarkMode 
                    ? 'bg-slate-700' 
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Loading Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <p className="mb-1 uppercase tracking-wider text-[10px] opacity-70">Did you know?</p>
          <motion.p
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="italic"
          >
            {currentStep === 0 && "Tamil Nadu has over 1,500 active mining locations"}
            {currentStep === 1 && "Our AI analyzes 15+ environmental factors"}
            {currentStep === 2 && "Satellite data is updated every 5 days"}
            {currentStep === 3 && "Machine learning models achieve 94% accuracy"}
            {currentStep === 4 && "Real-time monitoring saves lives and equipment"}
            {currentStep >= 5 && "Ready to protect Tamil Nadu's mining operations!"}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;