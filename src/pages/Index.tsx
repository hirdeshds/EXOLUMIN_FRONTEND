import { useState } from "react";
import { Hero } from "@/components/Hero";
import { UploadSection } from "@/components/UploadSection";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Telescope } from "lucide-react";

const requiredColumns = [
  'koi_score', 'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co', 'koi_fpflag_ec',
  'koi_period', 'koi_time0bk', 'koi_impact', 'koi_duration', 'koi_depth',
  'koi_prad', 'koi_teq', 'koi_insol', 'koi_model_snr', 'koi_steff', 'koi_slogg', 'koi_srad'
];

// Validate CSV file has required columns
const validateCSV = async (file: File): Promise<void> => {
  const text = await file.text();
  const lines = text.split('\n');
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const missingColumns = requiredColumns.filter(col => !headers.includes(col.toLowerCase()));
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }
};

// Mock prediction function - replace with actual API call
const analyzeLightCurve = async (file: File): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock light curve data
  const mockData = Array.from({ length: 100 }, (_, i) => ({
    time: i * 0.5,
    brightness: 1 + Math.sin(i * 0.3) * 0.02 + (Math.random() - 0.5) * 0.005
  }));

  // Add transit dips with some randomness
  const transitPositions = [20, 45, 70].map(pos => pos + Math.floor(Math.random() * 5 - 2));
  transitPositions.forEach(transit => {
    for (let i = transit - 3; i < transit + 3; i++) {
      if (mockData[i]) {
        mockData[i].brightness -= 0.012 * (1 - Math.abs(i - transit) / 3);
      }
    }
  });

  // Randomize probability between 0.15 and 0.98
  const probability = Math.random() * 0.83 + 0.15;
  return {
    probability,
    isExoplanet: probability > 0.5,
    confidence: probability > 0.8 ? "High" : probability > 0.5 ? "Medium" : "Low",
    lightCurveData: mockData
  };
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
      // Validate CSV has required columns
      await validateCSV(file);
      
      const predictionResult = await analyzeLightCurve(file);
      setResult(predictionResult);
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Analysis failed";
      // Show error to user via toast (imported from sonner)
      const { toast } = await import("sonner");
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSubmit = async (data: any) => {
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      // In production, this would send data to your AI backend
      console.log("Manual input data:", data);
      const predictionResult = await analyzeLightCurve(null as any);
      setResult(predictionResult);
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Analysis error:", error);
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
            onManualSubmit={handleManualSubmit}
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
