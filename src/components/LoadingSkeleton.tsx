import React from 'react';

interface LoadingSkeletonProps {
  lines?: number;
  includeImages?: boolean;
  imageCount?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  lines = 15, 
  includeImages = false,
  imageCount = 0
}) => {
  return (
    <div className="animate-pulse">
      {/* Executive Summary */}
      <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-md w-full mb-4"></div>
      
      {/* Main Content */}
      <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-4 mt-10"></div>
      
      {/* Paragraphs */}
      {[...Array(lines)].map((_, i) => (
        <React.Fragment key={i}>
          <div className={`h-4 bg-gray-200 rounded-md w-${Math.random() > 0.5 ? 'full' : '5/6'} mb-2`}></div>
          
          {/* Add image placeholders at random positions */}
          {includeImages && imageCount > 0 && i % 5 === 3 && imageCount-- > 0 && (
            <div className="h-40 bg-gray-200 rounded-md w-full my-4"></div>
          )}
        </React.Fragment>
      ))}
      
      {/* Conclusion */}
      <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-4 mt-10"></div>
      <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
    </div>
  );
};

export default LoadingSkeleton;
