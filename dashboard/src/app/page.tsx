import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authOptions from the correct path

// Remove 'use client' - this is now a Server Component

import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import IntegrationsSection from "@/components/IntegrationsSection";
import DemoSection from "@/components/DemoSection";
import WaitlistSection from "@/components/WaitlistSection";

// Convert the function to async to await session check
export default async function Home() {
  // Get the server-side session using next-auth
  const session = await getServerSession(authOptions);

  // If user has an active session, redirect to the dashboard
  if (session) {
    redirect('/dashboard');
  }

  // If user is not logged in, render the landing page sections
  // Note: The client-side animation logic (`useEffect`) was removed.
  return (
    <>
      <HeroSection /> 
      <FeaturesSection />
      <IntegrationsSection />
      <DemoSection />
      <WaitlistSection />
    </>
  );
}
