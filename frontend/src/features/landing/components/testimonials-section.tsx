"use client";

import { Quote } from "lucide-react";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { MotionWrapper } from "@/features/landing/components/motion-wrapper";
import { LandingSectionHeader } from "@/features/landing/components/landing-section-header";
import type { Testimonial } from "@/features/landing/types/landing.types";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <MotionWrapper key={testimonial.id} delay={index * 0.1}>
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
            </MotionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
