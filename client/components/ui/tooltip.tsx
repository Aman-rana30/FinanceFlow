import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({ children, delayDuration }) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

interface TooltipTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, className, asChild }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onMouseEnter: () => setIsVisible(true),
      onMouseLeave: () => setIsVisible(false),
      'data-tooltip-visible': isVisible
    });
  }

  return (
    <div
      className={cn("cursor-pointer", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      data-tooltip-visible={isVisible}
    >
      {children}
    </div>
  );
};

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  side?: string;
  align?: string;
  hidden?: boolean;
}

const TooltipContent: React.FC<TooltipContentProps> = ({ children, className, side, align, hidden }) => {
  if (hidden) return null;
  
  return (
    <div
      className={cn(
        "absolute z-50 overflow-hidden rounded-md bg-black/90 px-3 py-1.5 text-xs text-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 -top-2 left-1/2 -translate-x-1/2 -translate-y-full",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        className
      )}
      style={{
        display: "var(--tooltip-visible, none)"
      }}
    >
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
    </div>
  );
};

// Enhanced version with proper positioning
const TooltipWrapper: React.FC<{ trigger: React.ReactNode; content: React.ReactNode }> = ({
  trigger,
  content
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block group">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {trigger}
      </div>
      {isVisible && (
        <div className="absolute z-50 px-3 py-1.5 text-xs text-white bg-black/90 rounded-md -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
        </div>
      )}
    </div>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipWrapper };