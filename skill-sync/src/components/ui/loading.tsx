import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
            <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" text="Loading..." />
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="border-2 rounded-lg overflow-hidden animate-pulse">
            <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
            <div className="p-5 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
            </div>
        </div>
    );
}

export function ProposalGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid sm:grid-cols-2 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b p-12">
                <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto" />
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 space-y-6">
                <div className="border-2 rounded-lg p-6 space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                </div>

                <div className="border-2 rounded-lg p-6 space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2 animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
            ))}
        </div>
    );
}
