import { useState, useCallback } from "react";
import { Upload, FileText, X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ManualInputForm } from "./ManualInputForm";

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  onManualSubmit: (data: any) => void;
  isAnalyzing: boolean;
}

export const UploadSection = ({ onFileUpload, onManualSubmit, isAnalyzing }: UploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }
    setSelectedFile(file);
    toast.success(`File "${file.name}" selected`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    toast("File removed");
  };

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Input Exoplanet Data</h2>
          <p className="text-muted-foreground text-lg">
            Choose between uploading a CSV file or entering parameters manually
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Upload className="w-4 h-4 mr-2" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Keyboard className="w-4 h-4 mr-2" />
              Manual Input
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card p-8">
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleChange}
              accept=".csv,text/csv,application/vnd.ms-excel"
              disabled={isAnalyzing}
            />

            {!selectedFile ? (
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drop your CSV file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CSV must have 17 numeric columns (in order): koi_score, koi_fpflag_nt, koi_fpflag_ss, koi_fpflag_co, koi_fpflag_ec, koi_period, koi_time0bk, koi_impact, koi_duration, koi_depth, koi_prad, koi_teq, koi_insol, koi_model_snr, koi_steff, koi_slogg, koi_srad
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="flex items-center justify-between bg-muted rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  disabled={isAnalyzing}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-glow"
              >
                {isAnalyzing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze with AI"
                )}
              </Button>
            </div>
          )}
        </Card>
          </TabsContent>

          <TabsContent value="manual">
            <ManualInputForm 
              onSubmit={onManualSubmit}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
