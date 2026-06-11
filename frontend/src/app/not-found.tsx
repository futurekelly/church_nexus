import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <h1 className="font-display text-4xl font-bold text-primary-foreground">
        404
      </h1>
      <p className="text-muted-foreground">The page you requested does not exist.</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Return Home
      </Link>
    </div>
  );
}
