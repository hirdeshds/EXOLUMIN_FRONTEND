import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PredictionResult {
  probability: number;
  isExoplanet: boolean;
  confidence: string;
  lightCurveData: Array<{ time: number; brightness: number }>;
}

interface ResultsDisplayProps {
  result: PredictionResult;
}

export const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  const getConfidenceColor = (prob: number) => {
    if (prob >= 0.8) return "text-success";
    if (prob >= 0.5) return "text-warning";
    return "text-destructive";
  };

  const getConfidenceBg = (prob: number) => {
    if (prob >= 0.8) return "bg-success/20";
    if (prob >= 0.5) return "bg-warning/20";
    return "bg-destructive/20";
  };

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Analysis Results</h2>
          <p className="text-muted-foreground text-lg">
            AI-powered prediction and visualization
          </p>
        </div>

        <div className="grid gap-6">
          {/* Main Prediction Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card p-8">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-full ${getConfidenceBg(result.probability)}`}>
                {result.isExoplanet ? (
                  <CheckCircle2 className={`w-12 h-12 ${getConfidenceColor(result.probability)}`} />
                ) : (
                  <AlertCircle className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  {result.isExoplanet 
                    ? "Exoplanet Detected!" 
                    : "No Exoplanet Detected"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  This candidate has a{" "}
                  <span className={`font-bold ${getConfidenceColor(result.probability)}`}>
                    {(result.probability * 100).toFixed(1)}%
                  </span>
                  {" "}probability of being an exoplanet.
                </p>

                {/* Probability Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Level</span>
                    <span className={`font-medium ${getConfidenceColor(result.probability)}`}>
                      {result.confidence}
                    </span>
                  </div>
                  <Progress 
                    value={result.probability * 100} 
                    className="h-3"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Light Curve Visualization */}
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-card p-8">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Light Curve Analysis</h3>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.lightCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    label={{ value: 'Relative Brightness', angle: -90, position: 'insideLeft' }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="brightness" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              The dips in brightness indicate potential planetary transits across the star
            </p>
          </Card>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Signal Strength", value: "Strong", color: "text-success" },
              { label: "Transit Depth", value: "1.2%", color: "text-primary" },
              { label: "Orbital Period", value: "3.5 days", color: "text-secondary" }
            ].map((metric, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur-sm border-border p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
