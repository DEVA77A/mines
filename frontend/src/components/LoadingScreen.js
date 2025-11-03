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
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
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

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
        >
          <span className="text-4xl">🏔️</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Rockfall AI System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-lg mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
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
          <div className="relative w-32 h-32 mx-auto">
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
              className="absolute inset-4 border-4 border-transparent border-t-purple-500 rounded-full"
            />
            
            {/* Center Dot */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-1/2 w-4 h-4 -ml-2 -mt-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
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
          <div className={`w-full h-2 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentStepData?.progress || progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              0%
            </span>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(currentStepData?.progress || progress)}%
            </span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
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
          <p className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
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
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index <= currentStep 
                    ? 'bg-blue-500' 
                    : isDarkMode 
                    ? 'bg-gray-600' 
                    : 'bg-gray-300'
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
          className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          <p className="mb-2">💡 Did you know?</p>
          <motion.p
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {currentStep === 0 && "Tamil Nadu has over 1,500 active mining locations"}
            {currentStep === 1 && "Our AI analyzes 15+ environmental factors"}
            {currentStep === 2 && "Satellite data is updated every 5 days"}
            {currentStep === 3 && "Machine learning models achieve 94% accuracy"}
            {currentStep === 4 && "Real-time monitoring saves lives and equipment"}
            {currentStep >= 5 && "Ready to protect Tamil Nadu's mining operations!"}
          </motion.p>
        </motion.div>

        {/* Emergency Skip Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: 3 }}
          className={`mt-8 px-4 py-2 text-sm rounded-lg border transition-colors ${
            isDarkMode 
              ? 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-500' 
              : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400'
          }`}
          onClick={() => window.location.reload()}
        >
          Skip Loading
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;