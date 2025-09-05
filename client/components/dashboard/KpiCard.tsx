import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { TooltipWrapper } from "@/components/ui/tooltip";

export function MaskedNumber({ value, prefix = "", suffix = "", className }: { value: string | number; prefix?: string; suffix?: string; className?: string }) {
  const masked = useUIStore((s) => s.masked);
  const panic = useUIStore((s) => s.panic);
  const display = `${prefix}${value}${suffix}`;
  const maskedText = `${prefix}${"•".repeat(String(value).length)}${suffix}`;
  return (
    <span className={cn(panic ? "blur-sm select-none" : "", className)}>
      {masked ? maskedText : display}
    </span>
  );
}

export function KpiCard({ 
  title, 
  value, 
  delta, 
  icon, 
  description,
  trend,
  onClick 
}: { 
  title: string; 
  value: ReactNode; 
  delta?: string; 
  icon?: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-indigo-300" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-destructive" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!delta) return "";
    if (delta.startsWith("+")) return "text-indigo-300";
    if (delta.startsWith("-")) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div 
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_0_40px_rgba(0,255,209,0.05)] transition-all duration-300",
        onClick && "cursor-pointer hover:bg-white/8 hover:border-white/20",
        isHovered && "transform scale-[1.02]"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-600/15 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
            {description && (
              <TooltipWrapper
                trigger={
                  <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
                }
                content={<span className="text-xs max-w-48">{description}</span>}
              />
            )}
          </div>
          {icon}
        </div>
        
        <div className="text-2xl font-bold mb-1">{value}</div>
        
        {delta && (
          <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
            {getTrendIcon()}
            <span>{delta} vs last month</span>
          </div>
        )}
      </div>
      
      {/* Animated border effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300",
        isHovered && "border-indigo-400/40"
      )} />
    </div>
  );
}
