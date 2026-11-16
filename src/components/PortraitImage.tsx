import { useState } from "react";

interface PortraitImageProps {
  src: string;
  alt: string;
  name: string;
  className?: string;
}

export function PortraitImage({ src, alt, name, className = "" }: PortraitImageProps) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-[#F5C518] font-bold select-none ${className}`}
        aria-label={alt}
      >
        <span className="text-lg tracking-wide">{initials || "GP"}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
