import { useState, useCallback, useEffect } from 'react';
import './App.css';
import ReportForm from './components/ReportForm';
import type { ReportConfig } from './components/ReportForm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import LoadingSkeleton from './components/LoadingSkeleton';
import useReportHistory from './components/useReportHistory';
import type { SavedReport } from './components/useReportHistory';
import SavedReportsList from './components/SavedReportsList';

// Register fonts for more professional PDFs
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    // Adding italic variants for PDF generation
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-lightitalic-webfont.ttf', fontWeight: 300, fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-mediumitalic-webfont.ttf', fontWeight: 500, fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf', fontWeight: 700, fontStyle: 'italic' },
  ]
});

interface GeneratedImage {
  prompt: string;
  imageUrl: string;
}

function App() {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    topic: '',
    includeImages: false,
    includeGraphs: false,
    reportLength: 3,
    imageCount: 2,
    reportStyle: 'academic'
  });
  const [generatedReport, setGeneratedReport] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  
  // Use our custom hook for report history
  const {
    savedReports,
    saveReport,
    deleteReport,
    initialized: historyInitialized
  } = useReportHistory();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 30,
      fontFamily: 'Roboto',
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    coverPage: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    title: {
      fontSize: 28,
      marginBottom: 15,
      fontFamily: 'Roboto',
      fontWeight: 700,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 18,
      marginBottom: 40,
      fontFamily: 'Roboto',
      fontWeight: 400,
      color: '#555555',
      textAlign: 'center',
    },
    heading: {
      fontSize: 20,
      marginBottom: 10,
      fontFamily: 'Roboto',
      fontWeight: 700,
      marginTop: 20,
    },
    subheading: {
      fontSize: 16,
      marginBottom: 8,
      fontFamily: 'Roboto',
      fontWeight: 500,
      marginTop: 14,
      color: '#333333',
    },
    paragraph: {
      fontSize: 12,
      marginBottom: 10,
      lineHeight: 1.6,
      fontFamily: 'Roboto',
      fontWeight: 400,
      textAlign: 'justify',
    },
    pre: {
      fontSize: 10,
      fontFamily: 'Courier',
      backgroundColor: '#f5f5f5',
      padding: 10,
      marginBottom: 12,
      marginTop: 8,
      borderRadius: 4,
    },
    image: {
      marginVertical: 20,
      alignSelf: 'center',
    },
    imageCaption: {
      fontSize: 10,
      color: '#555555',
      textAlign: 'center',
      marginTop: 5,
      marginBottom: 15,
      fontFamily: 'Roboto',
      fontWeight: 400,
    },
    imagePlaceholder: {
      height: 180,
      backgroundColor: '#e0e0e0',
      borderRadius: 5,
      padding: 20,
      marginVertical: 10,
    },
    graphPlaceholder: {
      height: 200,
      backgroundColor: '#e0e0e0',
      borderRadius: 5,
      padding: 20,
      marginVertical: 10,
    },
    header: {
      fontSize: 10,
      marginBottom: 20,
      textAlign: 'right',
      color: 'grey',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      fontSize: 10,
      textAlign: 'center',
      color: 'grey',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      paddingTop: 10,
    },
    pageNumber: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      fontSize: 10,
      color: 'grey',
    },
    // New academic document styles
    sectionHeading: {
      marginTop: 24,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      paddingBottom: 5,
    },
    codeBlock: {
      margin: 10,
      marginVertical: 20,
    },
    codeCaption: {
      fontSize: 10,
      color: '#555555',
      textAlign: 'center',
      marginTop: 5,
      fontFamily: 'Roboto',
      fontStyle: 'italic',
    },
    institutionLogoPlaceholder: {
      width: 80,
      height: 80,
      backgroundColor: '#f0f0f0',
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    authorSection: {
      marginTop: 60,
      textAlign: 'center',
      width: '100%',
      padding: 20,
    },
    authorText: {
      fontSize: 14,
      marginBottom: 10,
      fontFamily: 'Roboto',
      fontWeight: 500,
    },
    authorName: {
      fontSize: 16,
      marginBottom: 5,
      fontFamily: 'Roboto',
      fontWeight: 700,
    },
    courseInfo: {
      fontSize: 14,
      marginBottom: 10,
      fontFamily: 'Roboto',
      fontWeight: 400,
      color: '#444444',
    },
    dateInfo: {
      fontSize: 12,
      fontFamily: 'Roboto',
      fontWeight: 400,
      color: '#666666',
    }
  });

  const handleConfigChange = useCallback((newConfig: ReportConfig) => {
    setReportConfig(newConfig);
  }, []);

  // Generate image prompts based on the report content
  const generateImagePrompts = (content: string, imageCount: number): string[] => {
    // Simple approach: extract potential image topics from the content
    const lines = content.split('\n');
    const potentialImageTopics: string[] = [];
    
    // Look for headings, they're often good image subjects
    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ')) {
        potentialImageTopics.push(line.replace(/^#+ /, '').trim());
      }
    }
    
    // If we don't have enough headings, look for keywords in the content
    if (potentialImageTopics.length < imageCount) {
      // Extract any [Image: ...] placeholders
      const imageRegex = /\[Image:(.+?)\]/ig;
      let match;
      while ((match = imageRegex.exec(content)) !== null && potentialImageTopics.length < imageCount) {
        potentialImageTopics.push(match[1].trim());
      }
    }
    
    // If we still don't have enough, use the main topic
    while (potentialImageTopics.length < imageCount) {
      potentialImageTopics.push(`${reportConfig.topic} visualization`);
    }
    
    // Improve the prompts to make them more specific but concise for Gemini AI image generation
    return potentialImageTopics.slice(0, imageCount).map(topic => {
      // Create a more simplified prompt that works better with Gemini's Flash Preview image generation
      const style = 'Scientific diagram with labels';
      
      return `Generate a high-quality image of "${topic}" for a report about ${reportConfig.topic}. ${style}. Make it suitable for a technical document.`;
    });
  };

  // Generate images using Gemini API
  const generateImages = async (imagePrompts: string[]): Promise<GeneratedImage[]> => {
    setIsGeneratingImages(true);
    
    try {
      console.log('Generating images for prompts:', imagePrompts);
      
      // Use the Gemini API to generate actual AI images
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.");
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      // Use the image generation model
      const imageModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-preview-image-generation"
      });
      
      console.log("Starting image generation with Gemini 2.0 Flash Preview...");
      
      const imagePromises = imagePrompts.map(async (prompt, index) => {
        try {
          console.log(`Image ${index + 1}: Generating AI image for prompt: "${prompt}"`);
          
          // Create a shorter version of the prompt if it's too long
          const shortPrompt = prompt.length > 500 ? 
            prompt.substring(0, 497) + "..." : 
            prompt;
          
          // Generate image using Gemini API with correct configuration
          console.log("Calling Gemini API with prompt:", shortPrompt);
          
          // Try two different approaches for the generationConfig
          // The Flash Preview Image Generation model may require specific configurations
          
          // First try with standard configuration for requesting image generation
          const generationConfig = {
            responseModalities: ["IMAGE", "TEXT"],
            temperature: 0.4
          };
          
          console.log("Generation config:", generationConfig);
          
          let response;
          
          try {
            // Generate image using Gemini API with explicit image request
            const result = await imageModel.generateContent({
              contents: [{ 
                role: "user", 
                parts: [{ text: "Create an image: " + shortPrompt }] 
              }],
              generationConfig
            });
            
            // Get the response and inspect the structure
            response = await result.response;
          } catch (err: any) {
            console.error("Error generating image with Gemini:", err);
            throw new Error(`Gemini API error: ${err.message || 'Unknown error'}`);
          }
          console.log("Received response from Gemini API");
          
          // Check if we have valid candidates
          if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates were returned in the response");
          }
          
          const candidate = response.candidates[0];
          if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            throw new Error("No content parts were found in the response");
          }
          
          console.log(`Found ${candidate.content.parts.length} parts in the response`);
          
          // Look for image part in the response
          let imageUrl = null;
          for (const part of candidate.content.parts) {
            console.log("Examining part type:", part.text ? "Text" : "Non-text", part);
            
            if (part.inlineData && part.inlineData.mimeType && 
                part.inlineData.mimeType.startsWith('image/') && 
                part.inlineData.data) {
              // Convert base64 data to URL
              console.log("Found image data with MIME type:", part.inlineData.mimeType);
              imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          
          if (imageUrl) {
            console.log("Successfully generated image");
            return { prompt, imageUrl };
          } else {
            throw new Error("No valid image data was found in the response");
          }
        } catch (err) {
          console.error(`Error generating image for prompt "${prompt.substring(0, 50)}...":`);
          console.error(err);
          
          // Fallback to placeholder if Gemini API fails
          const colors = [
            '1a365d/ffffff', // Blue/white
            '065f46/ffffff', // Green/white
            '7c2d12/ffffff', // Brown/white
            '4c1d95/ffffff', // Purple/white
            '991b1b/ffffff'  // Red/white
          ];
          
          const colorScheme = colors[index % colors.length];
          const cleanKeyword = prompt.substring(0, 30).replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Image';
          
          return { 
            prompt, 
            imageUrl: `https://via.placeholder.com/800x500/${colorScheme}?text=${encodeURIComponent(cleanKeyword)}`
          };
        }
      });
      
      return await Promise.all(imagePromises);
    } catch (err) {
      console.error("Error in image generation:", err);
      return [];
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedReport('');
    setGeneratedImages([]);
    setSelectedReport(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.");
      setIsLoading(false);
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use a text generation model for the report content
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

    // Determine length guidance based on report length setting
    const lengthGuidance = {
      1: "Keep it very brief, approximately 500 words.",
      2: "Keep it concise, approximately 800 words.",
      3: "Use a moderate length, approximately 1200 words.",
      4: "Provide detailed coverage, approximately 2000 words.",
      5: "Create an extensive report, approximately 3000+ words."
    }[reportConfig.reportLength];

    // Academic style guidance
    const styleGuidance = "Use scholarly language, include proper citations, methodology sections, and research context.";

    // Build the prompt
    let prompt = `Generate a comprehensive technical report on the topic: "${reportConfig.topic}". ${styleGuidance} ${lengthGuidance}
    
Format the report with proper Markdown formatting:
- Use # for main headings
- Use ## for subheadings
- Use bullet points and numbered lists where appropriate
- Include an executive summary at the beginning

Structure the report with these sections:
1. Executive Summary
2. Introduction
3. Main Content (with relevant subheadings)
4. Conclusion
5. References (if applicable)`;

    if (reportConfig.includeImages) {
      prompt += `\n\nInclude ${reportConfig.imageCount} placeholders for images by adding: [Image: brief description of relevant image] where appropriate throughout the document. Make these descriptions specific enough for image generation.`;
    }
    
    if (reportConfig.includeGraphs) {
      prompt += "\n\nInclude placeholders for graphs or charts by adding: [Graph: description of the data visualization] where appropriate.";
    }

    try {
      console.log('Generating report with config:', reportConfig);
      console.log('Prompt:', prompt);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setGeneratedReport(text);

      // Generate images if enabled
      let images: GeneratedImage[] = [];
      if (reportConfig.includeImages && reportConfig.imageCount > 0) {
        const imagePrompts = generateImagePrompts(text, reportConfig.imageCount);
        images = await generateImages(imagePrompts);
        setGeneratedImages(images);
      }
      
      // Save the report to history
      if (historyInitialized && text) {
        saveReport({
          topic: reportConfig.topic,
          content: text,
          style: reportConfig.reportStyle,
          config: reportConfig,
          images: images
        });
      }
    } catch (e) {
      console.error("Error generating report:", e);
      setError("Failed to generate report. Please check the console for more details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = () => {
    console.log('Preparing PDF for download...');
  };

  const handleExportMarkdown = () => {
    if (!generatedReport) return;
    
    // Create a blob with the markdown content
    const blob = new Blob([generatedReport], { type: 'text/markdown' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportConfig.topic.replace(/\s+/g, '-').toLowerCase() || 'technical-report'}.md`;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('Exported markdown file');
  };

  // Handle loading a saved report
  const handleSelectReport = (report: SavedReport) => {
    setSelectedReport(report);
    setReportConfig(report.config);
    setGeneratedReport(report.content);
    setGeneratedImages(report.images || []);
    setError(null);
    setShowHistory(false);
  };

  // Handle deleting a saved report
  const handleDeleteReport = (id: string) => {
    deleteReport(id);
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(null);
    }
  };

  // Enhanced Academic PDF document component
  const AcademicDocument = ({ 
    content, 
    topic, 
    images 
  }: { 
    content: string, 
    topic: string, 
    images: GeneratedImage[] 
  }) => {
    const title = topic || 'Academic Research Report';
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const studentName = "Student Name"; // Could be made configurable
    const courseInfo = "Course Name (Course Code)"; // Could be made configurable
    
    // Process content into pages and sections
    const renderContent = () => {
      const lines = content.split('\n');
      const elements = [];
      let inCodeBlock = false;
      let codeBlockContent = '';
      let imageIndex = 0; // Track which images we've used
      let figureNumber = 1; // For labeling figures
      
      // Regex patterns for special content
      const imageDescriptionPattern = /\[Image:(.+?)\]/i;
      const graphDescriptionPattern = /\[Graph:(.+?)\]/i;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle code blocks
        if (line.trim().startsWith('```') && !inCodeBlock) {
          inCodeBlock = true;
          codeBlockContent = '';
          continue;
        } else if (line.trim().endsWith('```') && inCodeBlock) {
          elements.push(
            <View key={`code-${i}`} style={styles.codeBlock}>
              <Text style={styles.pre}>{codeBlockContent}</Text>
              <Text style={styles.codeCaption}>Listing {figureNumber++}</Text>
            </View>
          );
          inCodeBlock = false;
          continue;
        } else if (inCodeBlock) {
          codeBlockContent += line + '\n';
          continue;
        }
        
        // Handle image placeholders - replace with actual images if available
        const imageMatch = line.match(imageDescriptionPattern);
        if (imageMatch) {
          const description = imageMatch[1].trim();
          
          if (images.length > 0 && imageIndex < images.length) {
            // Increment the image index
            imageIndex++;
              try {
                // For PDFs, we need a special approach to include images
                elements.push(
                  <View key={`img-${i}`} style={styles.image}>
                    <View style={{
                      width: 400,
                      height: 200,
                      backgroundColor: '#f0f4f8',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '1pt solid #e2e8f0'
                    }}>
                      <Text style={{ fontSize: 12, color: '#4a5568', textAlign: 'center' }}>
                        Figure {figureNumber}
                      </Text>
                    </View>
                    <Text style={styles.imageCaption}>Figure {figureNumber++}: {description}</Text>
                  </View>
                );
              } catch (err) {
                console.error("Error rendering image in PDF:", err);
                elements.push(
                  <View key={`img-${i}`} style={styles.imagePlaceholder}>
                    <Text style={styles.paragraph}>Figure {figureNumber++}: {description}</Text>
                  </View>
                );
              }
          } else {
            // Fallback to placeholder
            elements.push(
              <View key={`img-${i}`} style={styles.imagePlaceholder}>
                <Text style={styles.paragraph}>Figure {figureNumber++}: {description}</Text>
              </View>
            );
          }
          continue;
        }
        
        // Handle graph descriptions
        const graphMatch = line.match(graphDescriptionPattern);
        if (graphMatch) {
          elements.push(
            <View key={`graph-${i}`} style={styles.graphPlaceholder}>
              <Text style={styles.paragraph}>Figure {figureNumber++}: {graphMatch[1].trim()}</Text>
            </View>
          );
          continue;
        }
        
        // Handle headings and regular text with improved detection for academic format
        if (line.trim().startsWith('# ')) {
          // For main headings, center them and add proper spacing
          elements.push(
            <View key={`h1-${i}`} style={styles.sectionHeading}>
              <Text style={styles.heading}>{line.replace(/^# /, '')}</Text>
            </View>
          );
        } else if (line.trim().startsWith('## ')) {
          elements.push(
            <Text key={`h2-${i}`} style={styles.subheading}>
              {line.replace(/^## /, '')}
            </Text>
          );
        } else if (line.trim().length > 0) {
          // Regular paragraph text
          elements.push(
            <Text key={`p-${i}`} style={styles.paragraph}>
              {line}
            </Text>
          );
        }
      }
      
      return elements;
    };
    
    return (
      <Document>
        {/* Academic Cover Page */}
        <Page size="A4" style={styles.page}>
          <View style={styles.coverPage}>
            {/* University/Institution Logo Placeholder */}
            <View style={styles.institutionLogoPlaceholder}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4a5568' }}>University Logo</Text>
            </View>
            
            <View style={{ marginTop: 80 }}></View>
            
            <Text style={styles.title}>{title}</Text>
            <View style={{ marginTop: 20 }}></View>
            <Text style={styles.subtitle}>An Academic Research Report</Text>
            
            <View style={{ marginTop: 60 }}></View>
            
            <View style={styles.authorSection}>
              <Text style={styles.authorText}>Prepared by:</Text>
              <Text style={styles.authorName}>{studentName}</Text>
              <Text style={styles.courseInfo}>{courseInfo}</Text>
              <Text style={styles.dateInfo}>Submission Date: {currentDate}</Text>
            </View>
          </View>
        </Page>
        
        {/* Content Pages */}
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{title}</Text>
          <View style={styles.section}>
            {renderContent()}
          </View>
          <Text style={styles.footer}>Generated with StudyAI Academic Report Generator</Text>
          <Text 
            style={styles.pageNumber} 
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
            fixed 
          />
        </Page>
      </Document>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200">
      <div className="container mx-auto px-4 py-10">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Academic Report Creator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate scholarly research reports with AI-powered content and academic formatting
          </p>
        </header>

        <main className="max-w-5xl mx-auto">
          <div className="grid grid-cols-12 gap-6 mb-8">
            {/* Report Config Panel */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                {/* Tabs for Config and History */}
                <div className="flex border-b">
                  <button 
                    className={`flex-1 py-4 px-6 font-medium text-sm focus:outline-none ${!showHistory ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setShowHistory(false)}
                  >
                    Create New Report
                  </button>
                  <button 
                    className={`flex-1 py-4 px-6 font-medium text-sm focus:outline-none ${showHistory ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setShowHistory(true)}
                  >
                    Saved Reports {savedReports.length > 0 && `(${savedReports.length})`}
                  </button>
                </div>
                
                {/* Config Form or History */}
                {showHistory ? (
                  <div className="p-6">
                    <SavedReportsList 
                      reports={savedReports}
                      onSelect={handleSelectReport}
                      onDelete={handleDeleteReport}
                    />
                  </div>
                ) : (
                  <>
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <h2 className="text-2xl font-bold text-gray-800">Report Configuration</h2>
                    </div>
                    <ReportForm config={reportConfig} onConfigChange={handleConfigChange} />
                    <div className="p-6 bg-gray-50">
                      <button
                        onClick={handleGenerateReport}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-md"
                        disabled={isLoading || reportConfig.topic.trim() === ''}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isGeneratingImages ? 'Generating Images...' : 'Generating Report...'}
                          </div>
                        ) : selectedReport ? 'Regenerate Report' : 'Generate Academic Report'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Right sidebar - Quick tips */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden sticky top-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <h2 className="text-lg font-bold text-gray-800">Academic Guidelines</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Research Topics:</h3>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>The Impact of Machine Learning on Healthcare Diagnostics</li>
                      <li>Sustainable Energy Solutions for Developing Nations</li>
                      <li>Ethical Considerations in Genetic Engineering</li>
                      <li>Analysis of Climate Policy Effectiveness</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Academic Best Practices:</h3>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Include research questions in your topic</li>
                      <li>Use figures to illustrate complex concepts</li>
                      <li>Include data visualizations for empirical data</li>
                      <li>Choose appropriate length based on assignment requirements</li>
                    </ul>
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h3 className="font-medium text-indigo-800 mb-1 text-sm">Academic Structure:</h3>
                    <ul className="text-xs text-indigo-700 list-disc pl-4 space-y-1">
                      <li>Abstract/Executive Summary</li>
                      <li>Introduction & Research Question</li>
                      <li>Literature Review</li>
                      <li>Methodology</li>
                      <li>Results & Discussion</li>
                      <li>Conclusion</li>
                      <li>References</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-md text-red-700" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Generating Report</h2>
                <span className="text-sm text-gray-500">
                  This may take up to a minute...
                </span>
              </div>
              <LoadingSkeleton 
                lines={20}
                includeImages={reportConfig.includeImages} 
                imageCount={reportConfig.imageCount}
              />
            </div>
          )}

          {/* Generated Report */}
          {generatedReport && !isLoading && (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedReport ? 'Saved Report' : 'Generated Report'}
                </h2>
              </div>
              <div className="p-6">
                <div className="prose prose-blue max-w-none bg-white p-6 rounded-lg border">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 text-gray-800" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-700" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 text-gray-600" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 text-gray-600" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 text-gray-600" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600" {...props} />,
                    }}
                  >
                    {generatedReport}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Image Display Section */}
              {(generatedImages.length > 0 || isGeneratingImages) && (
                <div className="p-6 pt-0">
                  <div className="border-t my-6"></div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span>AI-Generated Images</span>
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      Gemini AI
                    </span>
                    {isGeneratingImages && (
                      <span className="ml-2 animate-pulse text-sm text-indigo-600">
                        Generating images...
                      </span>
                    )}
                  </h3>
                  
                  {/* Show loading state while generating images */}
                  {isGeneratingImages && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.from({ length: reportConfig.imageCount || 2 }).map((_, idx) => (
                        <div key={`loading-${idx}`} className="border rounded-lg overflow-hidden shadow-sm bg-gray-100 animate-pulse">
                          <div className="h-56 bg-gray-200"></div>
                          <div className="p-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show actual images when generated */}
                  {!isGeneratingImages && generatedImages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {generatedImages.map((img, idx) => (
                        <div key={idx} className="border rounded-lg overflow-hidden shadow-sm">
                          <div className="relative">
                            <img 
                              src={img.imageUrl} 
                              alt={`AI-generated image ${idx+1}`} 
                              className="w-full h-auto"
                              onError={(e) => {
                                // Fallback for image loading errors
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://via.placeholder.com/800x500/1a365d/ffffff?text=Image+Loading+Error`;
                              }}
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
                              {img.imageUrl.includes('placeholder.com') ? 'Placeholder' : 'AI Generated'}
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50">
                            <p className="text-sm text-gray-600">{img.prompt.split('\n')[0].substring(0, 120)}...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-4 italic">
                    Images are generated using Google's Gemini AI and may vary in quality. These images are for demonstration purposes only.
                    {generatedImages.some(img => img.imageUrl.includes('placeholder.com')) && (
                      <span className="font-medium"> Some images appear as placeholders due to API limitations.</span>
                    )}
                  </p>
                  
                  {/* Troubleshooting tips for image generation */}
                  {generatedImages.some(img => img.imageUrl.includes('placeholder.com')) && !isGeneratingImages && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                      <h4 className="font-medium text-blue-800 mb-2">Troubleshooting Image Generation</h4>
                      <ul className="text-xs text-blue-700 list-disc pl-5">
                        <li className="mb-1">The Gemini 2.0 Flash Preview Image Generation model is still in preview and may have limitations.</li>
                        <li className="mb-1">Try simplifying your image prompts to be more concise and clear.</li>
                        <li className="mb-1">Some regions may have restricted access to the image generation capabilities.</li>
                        <li className="mb-1">Check the browser console for specific API error messages.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* PDF Download Button */}
                {isClient && generatedReport && (
                  <PDFDownloadLink
                    document={<AcademicDocument 
                      content={generatedReport}
                      topic={reportConfig.topic}
                      images={generatedImages}
                    />}
                    fileName={`${reportConfig.topic.replace(/\s+/g, '-').toLowerCase() || 'technical-report'}.pdf`}
                    className="w-full sm:w-auto flex-grow sm:flex-grow-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition shadow-md text-center"
                    onClick={handleExportPdf}
                  >
                    {({ loading, error }) => 
                      loading ? 'Preparing PDF...' : error ? 'Error!' : (
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                          </svg>
                          Download Academic PDF
                        </div>
                      )
                    }
                  </PDFDownloadLink>
                )}
                {/* Markdown Download Button */}
                {isClient && generatedReport && (
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full sm:w-auto flex-grow sm:flex-grow-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-md text-center"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                        <path d="M593.8 59.1H46.2C20.7 59.1 0 79.8 0 105.2v301.5c0 25.5 20.7 46.2 46.2 46.2h547.7c25.5 0 46.2-20.7 46.1-46.1V105.2c0-25.4-20.7-46.1-46.2-46.1zM338.5 360.6H277v-120l-61.5 76.9-61.5-76.9v120H92.3V151.4h61.5l61.5 76.9 61.5-76.9h61.5v209.2zm135.3 3.1L381.5 256H443V151.4h61.5V256H566z"/>
                      </svg>
                      Download Markdown
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by Gemini API and Imagen AI Technology</p>
          <p className="mt-2">© {new Date().getFullYear()} StudyAI - Academic Report Generator</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
