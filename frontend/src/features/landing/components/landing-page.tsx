"use client";

import { AnnouncementBar } from "@/features/landing/components/announcement-bar";
import { DonationCtaSection } from "@/features/landing/components/donation-cta-section";
import { FeaturedSermonsSection } from "@/features/landing/components/featured-sermons-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { MinistriesSection } from "@/features/landing/components/ministries-section";
import { PublicFooter } from "@/features/landing/components/public-footer";
import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { StatisticsSection } from "@/features/landing/components/statistics-section";
import { TestimonialsSection } from "@/features/landing/components/testimonials-section";
import { UpcomingEventsSection } from "@/features/landing/components/upcoming-events-section";
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

      <main id="main-content">
        <HeroSection scripture={mockDailyScripture} />
        <StatisticsSection statistics={mockStatistics} />
        <FeaturedSermonsSection sermons={mockFeaturedSermons} />
        <UpcomingEventsSection events={mockUpcomingEvents} />
        <MinistriesSection ministries={mockMinistries} />
        <TestimonialsSection testimonials={mockTestimonials} />
        <DonationCtaSection />
      </main>

      <PublicFooter />
    </>
  );
}
