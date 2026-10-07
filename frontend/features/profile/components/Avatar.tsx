import Image from "next/image";

interface AvatarProps {
  src: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "w-5 h-5 text-[8px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-24 h-24 text-2xl",
};

const sizePx: Record<NonNullable<AvatarProps["size"]>, number> = {
  xs: 20,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
};

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const classes = `${sizeClasses[size]} rounded-full flex-shrink-0`;

  if (src) {
    const px = sizePx[size];
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={`${classes} border border-gray-200 object-cover`}
        sizes={`${px}px`}
      />
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${classes} flex select-none items-center justify-center bg-blue-600 font-semibold tracking-wide text-white`}
    >
      {initials}
    </div>
  );
}
