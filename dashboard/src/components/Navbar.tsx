
import React from "react";
import Logo from "./Logo";
import { Button } from "./ui/button";

const Navbar: React.FC = () => {
  return (
    <header className="fixed w-full top-0 z-50 bg-elevate-dark/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white/80 hover:text-white transition-colors">
            Features
          </a>
          <a href="#integrations" className="text-white/80 hover:text-white transition-colors">
            Integrations
          </a>
          <a href="#join" className="text-white/80 hover:text-white transition-colors">
            Join Waitlist
          </a>
        </nav>
        <div className="flex items-center">
          <Button variant="outline" className="border-white/20 hover:bg-white/5">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
