import { cn } from "@/lib/utils";

interface LandingSectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  headingId?: string;
}

export function LandingSectionHeader({
  title,
  subtitle,
  align = "center",
  className,
  headingId,
}: LandingSectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-12",
        align === "center" && "text-center",
        align === "center" && subtitle && "mx-auto",
        className,
      )}
    >
      <h2
        id={headingId}
        className="font-display text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl"
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-3 max-w-2xl text-base text-muted-foreground md:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
