'use client';

import React, { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Define props interface
interface WaitlistSectionProps {
  className?: string;
}

const WaitlistSection: React.FC<WaitlistSectionProps> = ({ className }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Mock submission - in real app would connect to a backend
    setSubmitted(true);
    setError("");
  };
  
  return (
    <section id="join" className={cn("py-24 bg-gradient-to-b from-elevate-dark to-black", className)}>
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gradient">
            Join our mailing list
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Be the first to know when 11x launches and get early access.
          </p>
          
          <div className="glass-card p-8 rounded-xl">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your_email_here"
                    className="input-email w-full"
                    required
                  />
                  {error && (
                    <div className="absolute -bottom-6 left-0 text-red-400 text-sm flex items-center gap-1">
                      <X className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
                <button type="submit" className="submit-btn whitespace-nowrap">
                  .submit()
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-3 py-4 text-elevate-green animate-scale-in">
                <CheckCircle className="w-6 h-6" />
                <span className="text-xl font-medium">Thank you for joining!</span>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-xs text-white/50 mb-2">POWERED BY</div>
                <div className="flex justify-center items-center">
                  <div className="w-8 h-8 border border-white/20 transform rotate-45 flex items-center justify-center">
                    <div className="text-gradient-green font-bold text-sm">11x</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
