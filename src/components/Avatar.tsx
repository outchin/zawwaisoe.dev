import { site } from "@/data/site";

export function Avatar({ className = "" }: { className?: string }) {
  if (site.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- small local avatar, not worth next/image's overhead
      <img
        src={site.avatarUrl}
        alt={site.name}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground ${className}`}
    >
      {site.avatarInitials}
    </span>
  );
}
