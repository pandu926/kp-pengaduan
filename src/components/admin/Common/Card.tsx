"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const Card = ({ children, title, className = "" }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {title && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
