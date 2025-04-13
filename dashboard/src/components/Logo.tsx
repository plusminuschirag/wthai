
import React from "react";

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 border-2 border-white transform rotate-45 flex items-center justify-center">
          <div className="w-7 h-7 border border-white/50 transform rotate-0 flex items-center justify-center">
            <div className="text-gradient-green font-bold text-lg">11x</div>
          </div>
        </div>
      </div>
      <span className="ml-3 text-white text-xl font-semibold">11x</span>
    </div>
  );
};

export default Logo;
