import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
      <span>Generating Schedule...</span>
    </div>
  );
};

export default LoadingSpinner;