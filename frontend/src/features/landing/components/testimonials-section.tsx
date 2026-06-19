"use client";

import { Quote } from "lucide-react";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { LandingSectionHeader } from "@/features/landing/components/landing-section-header";
import type { Testimonial } from "@/features/landing/types/landing.types";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const baseLength = testimonials.length;
  if (baseLength === 0) return null;

  // Determine how many times we need to repeat the testimonials list to have at least 12 items for seamless layout on large viewports
  const repeatCount = Math.max(3, Math.ceil(12 / baseLength));
  const repeatedTestimonials = Array(repeatCount).fill(testimonials).flat();
  const translationPercentage = -(100 / repeatCount);

  return (
    <section
      id={LANDING_SECTIONS.TESTIMONIES}
      aria-labelledby="testimonials-heading"
      className="px-4 py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeader
          headingId="testimonials-heading"
          title="Stories of Transformation"
          subtitle="Hear from members whose lives have been touched through faith and community."
        />

        <div className="relative w-full overflow-hidden py-4">
          {/* Left and Right gradient overlays to create a smooth fade effect on the edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent md:w-32" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent md:w-32" />
          
          <div className="flex w-max animate-marquee gap-6">
            {/* Render testimonials repeated dynamically to create a seamless infinite loop */}
            {repeatedTestimonials.map((testimonial, idx) => (
              <div
                key={`${testimonial.id}-${idx}`}
                className="w-[300px] shrink-0 sm:w-[360px]"
              >
                <figure
                  className={cn(
                    "glass-panel flex h-full flex-col rounded-2xl p-6 transition-all duration-200",
                    "hover:border-primary/30 hover:shadow-neon",
                  )}
                >
                  <Quote
                    className="h-8 w-8 text-primary/40"
                    aria-hidden="true"
                  />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary"
                      aria-hidden="true"
                    >
                      {testimonial.avatar_initials}
                    </div>
                    <div>
                      <cite className="not-italic font-semibold text-primary-foreground">
                        {testimonial.author}
                      </cite>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(${translationPercentage}%, 0, 0); }
            }
            .animate-marquee {
              animation: marquee 45s linear infinite;
              will-change: transform;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}} />
        </div>
      </div>
    </section>
  );
}
