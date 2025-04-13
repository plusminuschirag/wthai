'use client'; // Required for using hooks like useSession

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LogIn } from 'lucide-react'; // Icons for buttons

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

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
          {/* Conditionally render Dashboard link if signed in */}
          {session && (
            <a href="/dashboard" className="text-white/80 hover:text-white transition-colors">
              Dashboard
            </a>
          )}
        </nav>
        <div className="flex items-center space-x-4"> {/* Added space-x-4 */}
          {isLoading ? (
            <div className="text-white/60">Loading...</div>
          ) : session?.user ? (
            <>
              <Avatar className="h-8 w-8"> {/* Smaller avatar */} 
                <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              {/* <span className="text-white/80 hidden sm:inline">{session.user.name}</span> */}
              <Button
                variant="outline"
                size="icon" // Make it an icon button
                className="border-white/20 hover:bg-white/5 rounded-full" // Rounded style
                onClick={() => signOut()} // Call signOut on click
                title="Sign Out" // Tooltip for accessibility
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="border-white/20 hover:bg-white/5"
              onClick={() => signIn("google")} // Specify Google provider
            >
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
