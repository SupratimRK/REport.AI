import { useEffect, useState } from 'react';
import type { ReportConfig } from './ReportForm';

// Define what makes up a saved report
export interface SavedReport {
  id: string;
  topic: string;
  content: string;
  style: ReportConfig['reportStyle'];
  date: string;
  config: ReportConfig;
  images?: { prompt: string; imageUrl: string }[];
}

// Custom hook to handle saved report storage and manipulation
export const useReportHistory = () => {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  // Load saved reports from local storage on component mount
  useEffect(() => {
    const loadSavedReports = () => {
      try {
        const savedData = localStorage.getItem('reportai-saved-reports');
        if (savedData) {
          setSavedReports(JSON.parse(savedData));
        }
        setInitialized(true);
      } catch (e) {
        console.error('Failed to load saved reports:', e);
        setInitialized(true);
      }
    };
    
    loadSavedReports();
  }, []);
  
  // Save reports to local storage whenever the savedReports state changes
  useEffect(() => {
    if (initialized && savedReports.length > 0) {
      try {
        localStorage.setItem('reportai-saved-reports', JSON.stringify(savedReports));
      } catch (e) {
        console.error('Failed to save reports to local storage:', e);
      }
    }
  }, [savedReports, initialized]);

  // Function to save a new report
  const saveReport = (report: Omit<SavedReport, 'id' | 'date'>) => {
    const newReport: SavedReport = {
      ...report,
      id: `report-${Date.now()}`,
      date: new Date().toISOString(),
    };
    
    setSavedReports(prev => [newReport, ...prev]);
    return newReport.id;
  };

  // Function to delete a report by ID
  const deleteReport = (id: string) => {
    setSavedReports(prev => prev.filter(report => report.id !== id));
  };

  // Function to get a specific report by ID
  const getReport = (id: string) => {
    return savedReports.find(report => report.id === id);
  };
  
  return {
    savedReports,
    saveReport,
    deleteReport,
    getReport,
    initialized
  };
};

export default useReportHistory;
