import React from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define props interface
interface IntegrationsSectionProps {
  className?: string;
}

const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({ className }) => {
  const integrations = [
    { name: "Chrome Extension", status: "Active" },
    { name: "Firefox Add-on", status: "Active" },
    { name: "Safari Extension", status: "Active" },
    { name: "Edge Extension", status: "Active" },
    { name: "Pocket Integration", status: "Coming Soon" },
    { name: "Notion Connection", status: "Coming Soon" },
    { name: "Readwise Sync", status: "Coming Soon" },
    { name: "Instapaper", status: "Coming Soon" }
  ];

  const tools = [
    "AI Agents",
    "Personal Research",
    "Content Creation",
    "Chat Assistance",
    "Knowledge Base"
  ];

  return (
    <section id="integrations" className={cn("py-20 relative overflow-hidden grid-background", className)}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 text-gradient">
            Wide Range of Integrations
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Support for a constantly expanding set of bookmark sources and AI platforms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <div className="glass-card p-6 rounded-lg animate-scale-in">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center mr-3">
                <span className="text-xs text-elevate-green font-mono">→</span>
              </div>
              Supported Integrations
            </h3>

            <div className="space-y-3">
              {integrations.map((integration, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between px-4 py-3 bg-black/20 rounded-md border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center">
                      {integration.status === "Active" ? (
                        <span className="text-elevate-green">▲</span>
                      ) : (
                        <span className="text-white/30">○</span>
                      )}
                    </span>
                    <span>{integration.name}</span>
                  </div>
                  <span 
                    className={`text-xs px-2 py-1 rounded ${
                      integration.status === "Active" 
                        ? "bg-elevate-green/20 text-elevate-green" 
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {integration.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-lg animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center mr-3">
                <span className="text-xs text-elevate-blue font-mono">✓</span>
              </div>
              Built For
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {tools.map((tool, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 bg-black/20 px-4 py-3 rounded-md border border-white/5"
                >
                  <CheckCircle className="w-5 h-5 text-elevate-green" />
                  <span>{tool}</span>
                </div>
              ))}
            </div>

            <div className="bg-black/30 p-4 rounded-md border border-white/10">
              <h4 className="font-medium mb-2 text-white/90">Session Control</h4>
              <p className="text-sm text-white/70">
                Granular permissions system to control what data is shared with each AI application, 
                with built-in security and data privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
