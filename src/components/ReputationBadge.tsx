import { cn } from "@/lib/utils";
import { Star, Shield, Trophy, Zap, Medal } from "lucide-react";

interface ReputationBadgeProps {
    reputation: {
        level: number;
        title: string;
        reputationPoints: number;
        color: string;
        averageRating: number;
    };
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function ReputationBadge({ reputation, className, size = "md" }: ReputationBadgeProps) {
    if (!reputation) return null;

    const icons = {
        1: Shield,
        2: Zap,
        3: Medal,
        4: Trophy,
        5: Star,
    };

    const Icon = (icons as any)[reputation.level] || Shield;

    const sizeClasses = {
        sm: "px-2 py-0.5 text-[10px] gap-1",
        md: "px-3 py-1 text-xs gap-1.5",
        lg: "px-4 py-2 text-sm gap-2",
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 18,
    };

    return (
        <div className={cn(
            "flex items-center rounded-full font-black uppercase tracking-widest border transition-all duration-300 group hover:scale-105",
            "bg-muted/30 border-border/50",
            reputation.color,
            sizeClasses[size],
            className
        )}>
            <Icon size={iconSizes[size]} className="fill-current animate-pulse group-hover:animate-bounce" />
            <span>{reputation.title}</span>
            <div className="w-1 h-3 bg-border/50 rounded-full mx-0.5" />
            <span className="text-muted-foreground opacity-70">LVL {reputation.level}</span>
        </div>
    );
}
