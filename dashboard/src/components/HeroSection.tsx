import React from "react";
import { BookmarkIcon, Search, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

// Define props interface
interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  return (
    <section className={cn("pt-32 pb-20 relative overflow-hidden grid-background", className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-elevate-dark/90 pointer-events-none"></div>
      
      {/* Floating elements animation in background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-elevate-blue/5 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-elevate-green/5 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            The Bookmark Intelligence Platform
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8">
            11x stores your saved bookmark contents across platforms, enabling you with 
            <span className="text-gradient-green"> more personalized LLMs and AI Agents</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#join" 
              className="px-8 py-3 bg-elevate-green text-black font-medium rounded-md hover:bg-elevate-green/90 transition-all duration-200 shadow-lg shadow-elevate-green/20"
            >
              Join Waitlist
            </a>
            <a 
              href="#features" 
              className="px-8 py-3 bg-black/30 text-white border border-white/10 rounded-md hover:bg-white/5 transition-all duration-200"
            >
              Explore Features
            </a>
          </div>
        </div>

        <div className="glass-card p-8 rounded-xl max-w-5xl mx-auto animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<BookmarkIcon className="w-8 h-8 text-elevate-green" />}
              title="Bookmarks Storage" 
              description="Store and access your bookmarks with content across platforms"
            />
            <FeatureCard 
              icon={<BrainCircuit className="w-8 h-8 text-elevate-blue" />}
              title="Personalized AI" 
              description="Get more relevant AI responses based on your content"
            />
            <FeatureCard 
              icon={<Search className="w-8 h-8 text-elevate-green" />}
              title="Smart Search" 
              description="Find exactly what you need across all your saved content"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  );
};

export default HeroSection;
