import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";

const formSchema = z.object({
  koi_score: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_fpflag_nt: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), "Must be an integer"),
  koi_fpflag_ss: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), "Must be an integer"),
  koi_fpflag_co: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), "Must be an integer"),
  koi_fpflag_ec: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), "Must be an integer"),
  koi_period: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_time0bk: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_impact: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_duration: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_depth: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_prad: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_teq: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_insol: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_model_snr: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_steff: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_slogg: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
  koi_srad: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), "Must be a number"),
});

type FormData = z.infer<typeof formSchema>;

interface ManualInputFormProps {
  onSubmit: (data: any) => void;
  isAnalyzing: boolean;
}

const fields = [
  { name: "koi_score", label: "KOI Score", description: "Disposition score for candidate" },
  { name: "koi_fpflag_nt", label: "FP Flag: Not Transit-Like", description: "Flag (0 or 1)" },
  { name: "koi_fpflag_ss", label: "FP Flag: Stellar Eclipse", description: "Flag (0 or 1)" },
  { name: "koi_fpflag_co", label: "FP Flag: Centroid Offset", description: "Flag (0 or 1)" },
  { name: "koi_fpflag_ec", label: "FP Flag: Ephemeris Match", description: "Flag (0 or 1)" },
  { name: "koi_period", label: "Orbital Period", description: "Days" },
  { name: "koi_time0bk", label: "Transit Epoch", description: "BKJD" },
  { name: "koi_impact", label: "Impact Parameter", description: "Sky plane" },
  { name: "koi_duration", label: "Transit Duration", description: "Hours" },
  { name: "koi_depth", label: "Transit Depth", description: "PPM" },
  { name: "koi_prad", label: "Planetary Radius", description: "Earth radii" },
  { name: "koi_teq", label: "Equilibrium Temperature", description: "Kelvin" },
  { name: "koi_insol", label: "Insolation Flux", description: "Earth flux" },
  { name: "koi_model_snr", label: "Transit SNR", description: "Signal-to-noise ratio" },
  { name: "koi_steff", label: "Stellar Effective Temp", description: "Kelvin" },
  { name: "koi_slogg", label: "Stellar Surface Gravity", description: "log10(cm/s²)" },
  { name: "koi_srad", label: "Stellar Radius", description: "Solar radii" },
];

export const ManualInputForm = ({ onSubmit, isAnalyzing }: ManualInputFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const missingFields = fields.filter(field => !formData[field.name]);
    if (missingFields.length > 0) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Convert to proper types
      const processedData = Object.entries(formData).reduce((acc, [key, value]) => {
        const field = fields.find(f => f.name === key);
        if (key.includes('fpflag')) {
          acc[key] = parseInt(value);
        } else {
          acc[key] = parseFloat(value);
        }
        return acc;
      }, {} as Record<string, number>);

      onSubmit(processedData);
    } catch (error) {
      toast.error("Invalid input values");
    }
  };

  const loadSampleData = () => {
    const sampleData = {
      koi_score: "0.87",
      koi_fpflag_nt: "0",
      koi_fpflag_ss: "0",
      koi_fpflag_co: "0",
      koi_fpflag_ec: "0",
      koi_period: "3.5224",
      koi_time0bk: "131.51200",
      koi_impact: "0.146",
      koi_duration: "2.87",
      koi_depth: "1215.0",
      koi_prad: "2.26",
      koi_teq: "1244",
      koi_insol: "121.7",
      koi_model_snr: "35.8",
      koi_steff: "5777",
      koi_slogg: "4.438",
      koi_srad: "1.0",
    };
    setFormData(sampleData);
    toast.success("Sample data loaded");
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-2">Enter KOI Parameters</h3>
          <p className="text-muted-foreground">
            Input Kepler Object of Interest parameters manually
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={loadSampleData}
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Load Sample
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </Label>
              <Input
                id={field.name}
                type="text"
                placeholder={field.description}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="bg-background border-border"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            size="lg"
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
      </form>
    </Card>
  );
};
