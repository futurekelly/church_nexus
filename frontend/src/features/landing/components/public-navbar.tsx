"use client";

import { Church, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { logoutUser } from "@/features/auth/services/auth-service";
import { clearSession as clearSessionUtil } from "@/features/auth/utils/session";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: PUBLIC_ROUTES.HOME },
  { label: "Sermons", href: PUBLIC_ROUTES.SERMONS },
  { label: "Events", href: PUBLIC_ROUTES.EVENTS },
  { label: "Ministries", href: `/#${LANDING_SECTIONS.MINISTRIES}` },
  { label: "Livestream", href: PUBLIC_ROUTES.LIVESTREAM },
  { label: "About", href: PUBLIC_ROUTES.ABOUT },
  { label: "Contact", href: PUBLIC_ROUTES.CONTACT },
] as const;

export function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isHydrated } = useAuth();

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    console.log("public-navbar: handleLogout triggered");
    try {
      await logoutUser();
      console.log("public-navbar: logoutUser API call completed");
    } catch (err) {
      console.error("public-navbar: logoutUser API call failed", err);
    }
    clearSessionUtil();
    console.log("public-navbar: session cleared, redirecting to", AUTH_ROUTES.LOGIN);
    router.replace(AUTH_ROUTES.LOGIN);
  };

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
          {isHydrated && isAuthenticated && user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground">
                Welcome, <span className="text-primary font-semibold">{user.first_name}</span>
                {user.role === "visitor" && " (Visitor)"}
              </span>
              {user.role === "visitor" ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-warning/20 px-4 py-2 text-sm font-semibold text-warning transition-all duration-200 hover:bg-warning/30"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-neon transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(139,92,246,0.45)]"
                >
                  Go to Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
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
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={closeMobile}
          />
          <div
            id="mobile-nav-menu"
            className="absolute right-4 top-16 z-50 w-72 rounded-2xl border border-border bg-surface p-2 shadow-2xl lg:hidden animate-slide-up ring-1 ring-primary/20"
          >
            <ul className="flex flex-col gap-1 p-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={closeMobile}
                    className={cn(
                      "block rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                      pathname === link.href && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="my-2 border-t border-border/60" />
              <li className="flex flex-col gap-2 p-1">
                {isHydrated && isAuthenticated && user ? (
                  <div className="flex flex-col gap-2 rounded-xl bg-primary/5 border border-primary/10 p-2.5">
                    <div className="px-1 text-xs text-muted-foreground">
                      Logged in as{" "}
                      <span className="font-semibold text-primary">
                        {user.first_name} {user.last_name}
                      </span>
                      {user.role === "visitor" && " (Visitor)"}
                    </div>
                    {user.role === "visitor" ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          closeMobile();
                        }}
                        className="block rounded-lg bg-warning/20 px-4 py-2.5 text-center text-sm font-semibold text-warning transition-all duration-200 hover:bg-warning/30"
                      >
                        Logout
                      </button>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={closeMobile}
                        className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-neon transition-all duration-200 hover:bg-primary/90"
                      >
                        Go to Dashboard
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      href={AUTH_ROUTES.LOGIN}
                      onClick={closeMobile}
                      className="block rounded-lg border border-border/60 px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-card/60 hover:text-primary"
                    >
                      Login
                    </Link>
                    <Link
                      href={AUTH_ROUTES.REGISTER}
                      onClick={closeMobile}
                      className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-neon transition-all duration-200 hover:bg-primary/90"
                    >
                      Join Community
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        </>
      )}
    </header>
  );
}
