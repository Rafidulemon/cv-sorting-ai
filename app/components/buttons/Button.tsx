import clsx from "clsx";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "white" | "hero" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  type = "button",
  href,
  children,
  ...buttonProps
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-y-0";

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "text-xs px-4 py-2 rounded-lg gap-2",
    md: "text-sm px-5 py-2.5 rounded-xl gap-2.5",
    lg: "text-base px-6 py-3 rounded-xl gap-3",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-primary-500 via-rose-500 to-amber-300 text-white shadow-[0_12px_30px_rgba(216,8,128,0.35)] hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(216,8,128,0.4)]",
    secondary:
      "bg-white text-primary-700 border border-primary-200 shadow-[0_12px_30px_rgba(216,8,128,0.12)] hover:-translate-y-[1px] hover:border-primary-300 hover:text-primary-800",
    white:
      "bg-white text-zinc-900 border border-white/30 shadow-card-soft hover:-translate-y-[1px] hover:shadow-[0_18px_40px_rgba(24,27,49,0.12)] focus-visible:ring-white/60 focus-visible:ring-offset-0",
    hero:
      "!rounded-full !px-7 !py-3 !text-base !gap-3 bg-violet-500 text-white shadow-[0_12px_30px_rgba(139,92,246,0.35)] hover:-translate-y-[1px] hover:bg-violet-400 focus-visible:ring-white/60 focus-visible:ring-offset-0",
    ghost:
      "bg-transparent text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100",
  };

  const Component = href ? "a" : "button";

  return (
    <Component
      {...(href ? { href } : { type })}
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      {...buttonProps}
    >
      {leftIcon && <span className="-ml-1">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="-mr-1">{rightIcon}</span>}
    </Component>
  );
}
