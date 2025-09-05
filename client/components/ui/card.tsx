import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  description: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, description, className }) => {
  return (
    <div className={cn(
      "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all duration-300",
      className
    )}>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Card;