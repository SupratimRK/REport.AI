import React from 'react';
import type { SavedReport } from './useReportHistory';

interface SavedReportsListProps {
  reports: SavedReport[];
  onSelect: (report: SavedReport) => void;
  onDelete: (id: string) => void;
}

const SavedReportsList: React.FC<SavedReportsListProps> = ({ 
  reports, 
  onSelect, 
  onDelete 
}) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50">
        <p className="text-gray-500 mb-2">No saved reports yet</p>
        <p className="text-sm text-gray-400">Generated reports will appear here</p>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };
    const getStyleBadgeColor = (style: SavedReport['style']) => {
    // Always return academic style color
    return 'bg-purple-100 text-purple-800';
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Reports</h3>
      <div className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
        {reports.map((report) => (
          <div key={report.id} className="p-4 bg-white hover:bg-gray-50 transition flex justify-between items-center">
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(report)}>
              <h4 className="text-base font-medium text-gray-900 truncate mb-1">{report.topic}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-3">{formatDate(report.date)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStyleBadgeColor(report.style)}`}>
                  {report.style}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this report?')) {
                  onDelete(report.id);
                }
              }}
              className="ml-4 p-2 text-gray-400 hover:text-red-500 focus:outline-none"
              aria-label="Delete report"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedReportsList;
