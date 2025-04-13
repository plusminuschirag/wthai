'use client';

import React, { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import IntegrationsSection from "@/components/IntegrationsSection";
import DemoSection from "@/components/DemoSection";
import WaitlistSection from "@/components/WaitlistSection";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList) {
              entry.target.classList.add("animate-fade-in");
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const animateElements = document.querySelectorAll(".should-animate");
    if (animateElements.length > 0) {
      animateElements.forEach((el) => observer.observe(el));
    }

    return () => {
      if (animateElements.length > 0) {
        animateElements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  return (
    <>
      <HeroSection className="should-animate" />
      <FeaturesSection className="should-animate" />
      <IntegrationsSection className="should-animate" />
      <DemoSection className="should-animate" />
      <WaitlistSection className="should-animate" />
    </>
  );
}
