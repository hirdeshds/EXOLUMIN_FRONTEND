import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/space-hero.jpg";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Exoplanet Detection</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            A World Away:
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
              Hunting for Exoplanets with AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload light curve data and let our advanced AI model analyze patterns to identify potential exoplanet candidates with unprecedented accuracy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-glow"
            >
              Start Detection
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-6 text-lg border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            {[
              { value: "5,000+", label: "Exoplanets Discovered" },
              { value: "95%", label: "Prediction Accuracy" },
              { value: "Real-time", label: "Analysis Speed" }
            ].map((stat, index) => (
              <div key={index} className="bg-card/30 backdrop-blur-sm border border-border rounded-xl p-6">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
