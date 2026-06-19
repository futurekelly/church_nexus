"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiGet } from "@/services/api-client";
import { InteractiveParticles } from "@/components/effects/interactive-particles";
import { AnnouncementBar } from "@/features/landing/components/announcement-bar";
import { DonationCtaSection } from "@/features/landing/components/donation-cta-section";
import { FeaturedSermonsSection } from "@/features/landing/components/featured-sermons-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { MinistriesSection } from "@/features/landing/components/ministries-section";
import { PublicFooter } from "@/features/landing/components/public-footer";
import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { VisitorPendingBanner } from "@/features/landing/components/visitor-pending-banner";
import { StatisticsSection } from "@/features/landing/components/statistics-section";
import { TestimonialsSection } from "@/features/landing/components/testimonials-section";
import { UpcomingEventsSection } from "@/features/landing/components/upcoming-events-section";
import type { DailyScripture } from "@/features/landing/types/landing.types";
import {
  mockAnnouncement,
  mockDailyScripture,
  mockFeaturedSermons,
  mockMinistries,
  mockStatistics,
  mockTestimonials,
  mockUpcomingEvents,
} from "@/features/landing/data/mock-data";

export function LandingPage() {
  const [scripture, setScripture] = useState<DailyScripture>(mockDailyScripture);

  useEffect(() => {
    async function loadScripture() {
      try {
        const response = await apiGet<any>("/api/sermons/scripture/daily/");
        if (response.success && response.data) {
          setScripture({
            verse_reference: response.data.reference || mockDailyScripture.verse_reference,
            scripture_text: response.data.verse || mockDailyScripture.scripture_text,
            reflection: response.data.reflection || mockDailyScripture.reflection,
            display_date: new Date().toISOString().split("T")[0],
          });
        }
      } catch (err) {
        console.error("Failed to load daily scripture:", err);
      }
    }
    loadScripture();
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <AnnouncementBar announcement={mockAnnouncement} />

      <PublicNavbar />

      <VisitorPendingBanner />

      <InteractiveParticles />

      <main id="main-content">
        <HeroSection scripture={scripture} />
        
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <StatisticsSection statistics={mockStatistics} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        >
          <FeaturedSermonsSection sermons={mockFeaturedSermons} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        >
          <UpcomingEventsSection events={mockUpcomingEvents} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        >
          <MinistriesSection ministries={mockMinistries} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        >
          <TestimonialsSection testimonials={mockTestimonials} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        >
          <DonationCtaSection />
        </motion.div>
      </main>

      <PublicFooter />
    </>
  );
}
