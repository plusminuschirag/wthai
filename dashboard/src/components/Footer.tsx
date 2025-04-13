
import React from "react";
import Logo from "./Logo";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black py-12 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Logo className="mb-6 md:mb-0" />
          
          <div className="flex items-center gap-6 text-white/60">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} 11x. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
