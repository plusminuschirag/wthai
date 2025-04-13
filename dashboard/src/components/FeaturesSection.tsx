import React from "react";
import { Bot, Link, BookText, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define props interface
interface FeaturesSectionProps {
  className?: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className }) => {
  return (
    <section id="features" className={cn("py-20 relative overflow-hidden", className)}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 text-gradient">
            Supercharge Your Bookmarks
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            The toolkit to build user-permissioned content access for more personalized AI experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <FeatureBlock
            title="Smart Content Storage"
            description="11x doesn't just store URLs - it stores the actual content from your bookmarks so AI can understand it better."
            icon={<BookText className="w-12 h-12" />}
          />
          <FeatureBlock
            title="Cross-Platform Integration"
            description="Seamlessly connect with browsers and apps to collect your bookmarks from anywhere you browse."
            icon={<Link className="w-12 h-12" />}
          />
          <FeatureBlock
            title="AI-Powered Research"
            description="Get targeted, deep research from AI that's trained on your own bookmark content collection."
            icon={<Bot className="w-12 h-12" />}
          />
          <FeatureBlock
            title="Personalized Recommendations"
            description="Discover content tailored to your interests based on what you've already saved and enjoyed."
            icon={<UserCircle className="w-12 h-12" />}
          />
        </div>
      </div>
      
      {/* Code snippet visual */}
      <div className="mt-20 max-w-4xl mx-auto px-6 animate-fade-in">
        <div className="bg-black/60 rounded-lg border border-white/10 p-6 font-mono text-sm overflow-x-auto">
          <div className="text-white/50">{/* Example of how 11x enhances your AI experience */}</div>
          <div className="mt-2">
            <span className="text-elevate-blue">const</span> <span className="text-elevate-green">userBookmarks</span> = <span className="text-white/80">await</span> <span className="text-elevate-blue">elevate</span>.<span className="text-elevate-green">getBookmarks</span>();
          </div>
          <div className="mt-1">
            <span className="text-elevate-blue">const</span> <span className="text-elevate-green">enhancedResponse</span> = <span className="text-white/80">await</span> <span className="text-elevate-blue">ai</span>.<span className="text-elevate-green">query</span>&#40;&#123;
          </div>
          <div className="ml-4">
            <span className="text-white">prompt</span>: <span className="text-elevate-green">&quot;Research on renewable energy&quot;</span>,
          </div>
          <div className="ml-4">
            <span className="text-white">context</span>: <span className="text-elevate-green">userBookmarks.filter</span>&#40;b =&gt; b.<span className="text-white">relevantTo</span>&#40;<span className="text-elevate-green">&quot;energy&quot;</span>&#41;&#41;
          </div>
          <div>&#125;&#41;;</div>
        </div>
      </div>
    </section>
  );
};

const FeatureBlock: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => {
  return (
    <div className="flex gap-5 glass-card p-6 rounded-lg hover:border-white/20 transition-all duration-300 animate-enter">
      <div className="shrink-0 text-elevate-green">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-white/70">{description}</p>
      </div>
    </div>
  );
};

export default FeaturesSection;
