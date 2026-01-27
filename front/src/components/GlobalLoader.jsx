import React from 'react';

const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated logo or icon */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-spin">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Samafale Academy</h2>
          <p className="text-lg text-gray-600 animate-pulse">Loading content...</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Preparing your learning experience...</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;


