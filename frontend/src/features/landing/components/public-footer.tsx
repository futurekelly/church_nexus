import { Church, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";

const FOOTER_LINKS = {
  explore: [
    { label: "Sermons", href: PUBLIC_ROUTES.SERMONS },
    { label: "Events", href: PUBLIC_ROUTES.EVENTS },
    { label: "Ministries", href: PUBLIC_ROUTES.MINISTRIES },
    { label: "Livestream", href: PUBLIC_ROUTES.LIVESTREAM },
  ],
  connect: [
    { label: "About", href: PUBLIC_ROUTES.ABOUT },
    { label: "Contact", href: PUBLIC_ROUTES.CONTACT },
    { label: "Join Community", href: AUTH_ROUTES.REGISTER },
    { label: "Sign In", href: AUTH_ROUTES.LOGIN },
  ],
} as const;

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-surface/50 px-4 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              href={PUBLIC_ROUTES.HOME}
              className="flex items-center gap-2 font-display text-lg font-semibold text-primary-foreground"
            >
              <Church className="h-6 w-6 text-primary" aria-hidden="true" />
              Church Nexus
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A modern church community growing together in faith, hope, and love.
            </p>
          </div>

          <nav aria-label="Explore links">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground">
              Explore
            </h3>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Connect links">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground">
              Connect
            </h3>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.connect.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Dar es Salaam, Tanzania
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href="tel:+255678302135" className="transition-colors hover:text-primary">
                  +255 678 302 135
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href="mailto:futurekelly360@gmail.com"
                  className="transition-colors hover:text-primary"
                >
                  futurekelly360@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          <p>
            &copy; {currentYear} Church Management Ecosystem. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
