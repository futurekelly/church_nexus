"use client";

import { Church, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: PUBLIC_ROUTES.HOME },
  { label: "Sermons", href: `#${LANDING_SECTIONS.SERMONS}` },
  { label: "Events", href: `#${LANDING_SECTIONS.EVENTS}` },
  { label: "Ministries", href: `#${LANDING_SECTIONS.MINISTRIES}` },
  { label: "Livestream", href: PUBLIC_ROUTES.LIVESTREAM },
  { label: "About", href: PUBLIC_ROUTES.ABOUT },
  { label: "Contact", href: PUBLIC_ROUTES.CONTACT },
] as const;

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-border/50">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8"
      >
        <Link
          href={PUBLIC_ROUTES.HOME}
          className="flex items-center gap-2 font-display text-lg font-semibold text-primary-foreground transition-colors hover:text-primary"
        >
          <Church className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>Church Nexus</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  "text-muted-foreground hover:bg-card/60 hover:text-primary hover:shadow-neon",
                  pathname === link.href && "text-primary",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Login
          </Link>
          <Link
            href={AUTH_ROUTES.REGISTER}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-neon transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(139,92,246,0.45)]"
          >
            Join Community
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card/60 hover:text-primary lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
          />
          <div
            id="mobile-nav-menu"
            className="glass-panel absolute left-0 right-0 top-16 z-50 border-b border-border lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={closeMobile}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/60 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-border pt-3">
                <Link
                  href={AUTH_ROUTES.LOGIN}
                  onClick={closeMobile}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href={AUTH_ROUTES.REGISTER}
                  onClick={closeMobile}
                  className="block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white shadow-neon"
                >
                  Join Community
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </header>
  );
}
