"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  responsiveSize?: boolean; // <- untuk aktifkan responsif
  icon?: ReactNode;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  responsiveSize = false,
  icon,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center font-medium rounded-lg transition-colors";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const responsiveSizes = {
    sm: "text-sm px-3 py-1.5 md:px-4 md:py-2",
    md: "text-sm md:text-base px-4 py-2 md:px-6 md:py-3",
    lg: "text-base md:text-lg px-5 py-2.5 md:px-8 md:py-4",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${
        responsiveSize ? responsiveSizes[size] : sizes[size]
      } ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
