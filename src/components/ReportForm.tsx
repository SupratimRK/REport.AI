// src/components/ReportForm.tsx
import React, { useState, useEffect } from 'react';

interface ReportFormProps {
  onConfigChange: (config: ReportConfig) => void;
  config: ReportConfig;
}

export interface ReportConfig {
  topic: string;
  includeImages: boolean;
  includeGraphs: boolean;
  reportLength: number; // 1-5 scale (short to long)
  imageCount: number; // Number of images to include
  reportStyle: 'academic'; // Only academic style for students
}

const ReportForm: React.FC<ReportFormProps> = ({ onConfigChange, config }) => {
  const [topic, setTopic] = useState(config.topic || '');
  const [includeImages, setIncludeImages] = useState(config.includeImages || false);
  const [includeGraphs, setIncludeGraphs] = useState(config.includeGraphs || false);
  const [reportLength, setReportLength] = useState(config.reportLength || 3);
  const [imageCount, setImageCount] = useState(config.imageCount || 2);
  
  // Always use academic style
  const reportStyle = 'academic';

  useEffect(() => {
    // Only update when the values actually change to avoid infinite loops
    if (topic !== config.topic || 
        includeImages !== config.includeImages || 
        includeGraphs !== config.includeGraphs || 
        reportLength !== config.reportLength || 
        imageCount !== config.imageCount) {
      
      onConfigChange({
        topic,
        includeImages,
        includeGraphs,
        reportLength,
        imageCount,
        reportStyle
      });
    }
  }, [topic, includeImages, includeGraphs, reportLength, imageCount, reportStyle, onConfigChange, config]);

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-white shadow-sm">
      <div className="space-y-1">
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
          Research Topic
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Machine Learning Applications in Healthcare"
        />
        <p className="text-xs text-gray-500 mt-1">Enter your research topic or assignment title</p>
      </div>

      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="ml-2 text-sm font-medium text-indigo-800">Academic Format</span>
        </div>
        <p className="text-xs text-indigo-700 mt-1 ml-8">Your report will follow scholarly standards with proper citations and academic structure.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Report Length: {reportLengthLabels[reportLength]}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={reportLength}
          onChange={(e) => setReportLength(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Concise</span>
          <span>Detailed</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start mb-1">
          <div className="flex items-center h-5">
            <input
              id="includeImages"
              name="includeImages"
              type="checkbox"
              checked={includeImages}
              onChange={(e) => {
                setIncludeImages(e.target.checked);
                if (!e.target.checked) setImageCount(0);
              }}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="includeImages" className="font-medium text-gray-700">
              Include Figures & Illustrations
            </label>
            <p className="text-gray-500 text-xs">Add visual elements to enhance understanding</p>
          </div>
        </div>

        {includeImages && (
          <div className="pl-6 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Number of Figures: {imageCount}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        )}
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="includeGraphs"
            name="includeGraphs"
            type="checkbox"
            checked={includeGraphs}
            onChange={(e) => setIncludeGraphs(e.target.checked)}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="includeGraphs" className="font-medium text-gray-700">
            Include Data Visualizations
          </label>
          <p className="text-gray-500 text-xs">Add charts and graphs to represent data points</p>
        </div>
      </div>
    </div>
  );
};

const reportLengthLabels: Record<number, string> = {
  1: 'Brief (2-3 pages)',
  2: 'Short (3-5 pages)',
  3: 'Standard (5-7 pages)',
  4: 'Comprehensive (7-10 pages)',
  5: 'Extended (10+ pages)'
};

export default ReportForm;
