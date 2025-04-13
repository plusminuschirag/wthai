import React from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define props interface
interface DemoSectionProps {
  className?: string;
}

const DemoSection: React.FC<DemoSectionProps> = ({ className }) => {
  return (
    <section id="demo" className={cn("py-20 relative overflow-hidden", className)}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 text-gradient">
            Personalize Your AI Experience
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Integrate any agent with your personal knowledge base using just a few lines of code.
          </p>
        </div>

        <div className="max-w-6xl mx-auto glass-card rounded-xl p-8 animate-scale-in">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-semibold mb-6">How It Works</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-elevate-green/20 flex items-center justify-center mt-1">
                    <span className="text-xs text-elevate-green">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Save Bookmarks</h4>
                    <p className="text-sm text-white/70">11x captures and indexes the content from your bookmarks</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-elevate-green/20 flex items-center justify-center mt-1">
                    <span className="text-xs text-elevate-green">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Integration</h4>
                    <p className="text-sm text-white/70">Connect your favorite AI agents to your 11x knowledge base</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-elevate-green/20 flex items-center justify-center mt-1">
                    <span className="text-xs text-elevate-green">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Personalized Results</h4>
                    <p className="text-sm text-white/70">Get AI responses that understand your collected knowledge</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <StatusIndicator text="Authentication Complete" />
                <StatusIndicator text="Session Active" />
              </div>
            </div>
            
            <div className="bg-black/40 rounded-lg p-6 border border-white/10 flex flex-col">
              <div className="text-sm mb-2 text-white/50">INTEGRATION DEMO</div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 p-4 rounded border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-black/50 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xs font-bold">α</span>
                    </div>
                    <div className="text-xs">ASSISTANT.AI</div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-elevate-blue/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xs text-elevate-blue">11x</span>
                    </div>
                    <div className="text-xs">WHATSCHAT</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-elevate-green flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-elevate-green" />
                  </div>
                </div>
                
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-elevate-green/50 via-elevate-green/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatusIndicator: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-elevate-green/10 rounded border border-elevate-green/20">
      <CheckCircle className="w-4 h-4 text-elevate-green" />
      <span className="text-sm text-white">{text}</span>
    </div>
  );
};

export default DemoSection;
