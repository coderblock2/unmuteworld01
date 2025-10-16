
import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
  };

  return (
    <div className="flex justify-center items-center my-8">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Spinner;
