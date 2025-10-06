import { useState } from "react";
import { Hero } from "@/components/Hero";
import { UploadSection } from "@/components/UploadSection";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Telescope } from "lucide-react";
import { parseCSVData, predictExoplanet } from "@/lib/onnxPredictor";
import { toast } from "sonner";

// Analyze light curve using ML model
const analyzeLightCurve = async (file: File): Promise<any> => {
  try {
    // Parse CSV and get feature data
    const dataRows = await parseCSVData(file);
    
    // Use first row for prediction (or average multiple rows if needed)
    const features = dataRows[0];
    
    // Get prediction from ONNX model
    const probability = await predictExoplanet(features);
    
    // Generate mock light curve visualization data
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      time: i * 0.5,
      brightness: 1 + Math.sin(i * 0.3) * 0.02 + (Math.random() - 0.5) * 0.005
    }));

    // Add transit dips based on prediction confidence
    const transitDepth = probability > 0.5 ? 0.015 : 0.008;
    const transitPositions = [20, 45, 70].map(pos => pos + Math.floor(Math.random() * 5 - 2));
    transitPositions.forEach(transit => {
      for (let i = transit - 3; i < transit + 3; i++) {
        if (mockData[i]) {
          mockData[i].brightness -= transitDepth * (1 - Math.abs(i - transit) / 3);
        }
      }
    });

    return {
      probability,
      isExoplanet: probability > 0.5,
      confidence: probability > 0.8 ? "High" : probability > 0.5 ? "Medium" : "Low",
      lightCurveData: mockData
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};

const Index = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGetStarted = () => {
    setShowUpload(true);
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const predictionResult = await analyzeLightCurve(file);
      setResult(predictionResult);
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Analysis failed. Please check your CSV format.";
      toast.error(errorMessage, {
        action: {
          label: "Reset",
          onClick: () => {
            setResult(null);
            setShowUpload(true);
          }
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };



  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Telescope className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">EXOLUMIN</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm hover:text-primary transition-colors">About</a>
            <a href="#" className="text-sm hover:text-primary transition-colors">How It Works</a>
            <a href="#" className="text-sm hover:text-primary transition-colors">Research</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <Hero onGetStarted={handleGetStarted} />

      {/* Upload Section */}
      {showUpload && (
        <div id="upload-section">
          <UploadSection 
            onFileUpload={handleFileUpload}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div id="results-section">
          <ResultsDisplay result={result} />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 EXOLUMIN. Advancing exoplanet discovery through artificial intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
