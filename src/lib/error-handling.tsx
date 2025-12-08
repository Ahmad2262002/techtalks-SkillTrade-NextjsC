import { AlertCircle, XCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorDisplayProps {
    error: Error | string | null;
    className?: string;
    variant?: "error" | "warning" | "info" | "success";
}

export function ErrorDisplay({ error, className, variant = "error" }: ErrorDisplayProps) {
    if (!error) return null;

    const message = typeof error === "string" ? error : error.message;

    const variants = {
        error: {
            bg: "bg-red-50 dark:bg-red-950/20",
            border: "border-red-200 dark:border-red-900",
            text: "text-red-800 dark:text-red-300",
            icon: XCircle,
        },
        warning: {
            bg: "bg-yellow-50 dark:bg-yellow-950/20",
            border: "border-yellow-200 dark:border-yellow-900",
            text: "text-yellow-800 dark:text-yellow-300",
            icon: AlertCircle,
        },
        info: {
            bg: "bg-blue-50 dark:bg-blue-950/20",
            border: "border-blue-200 dark:border-blue-900",
            text: "text-blue-800 dark:text-blue-300",
            icon: Info,
        },
        success: {
            bg: "bg-green-50 dark:bg-green-950/20",
            border: "border-green-200 dark:border-green-900",
            text: "text-green-800 dark:text-green-300",
            icon: CheckCircle,
        },
    };

    const config = variants[variant];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 rounded-lg border",
                config.bg,
                config.border,
                className
            )}
            role="alert"
        >
            <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.text)} />
            <div className="flex-1">
                <p className={cn("text-sm font-medium", config.text)}>{message}</p>
            </div>
        </div>
    );
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

// Error message helpers
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred. Please try again.";
}

export function getUserFriendlyError(error: unknown): string {
    const message = getErrorMessage(error);

    // Map common errors to user-friendly messages
    const errorMap: Record<string, string> = {
        "Not authenticated": "Please sign in to continue.",
        "Unauthorized": "You don't have permission to perform this action.",
        "Network error": "Unable to connect. Please check your internet connection.",
        "Timeout": "The request took too long. Please try again.",
        "Not found": "The requested resource was not found.",
        "Validation error": "Please check your input and try again.",
        "Duplicate": "This item already exists.",
        "NEXT_NOT_FOUND": "Page not found.",
    };

    // Check if message contains any known error patterns
    for (const [key, value] of Object.entries(errorMap)) {
        if (message.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }

    // Return original message if no mapping found
    return message || "Something went wrong. Please try again.";
}

// Retry helper
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Don't retry on certain errors
            if (
                lastError.message.includes("Not authenticated") ||
                lastError.message.includes("Unauthorized") ||
                lastError.message.includes("Validation")
            ) {
                throw lastError;
            }

            // Wait before retrying (exponential backoff)
            if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
            }
        }
    }

    throw lastError || new Error("Operation failed after retries");
}

// Form error helper
export function getFieldError(
    errors: Record<string, string> | undefined,
    field: string
): string | undefined {
    return errors?.[field];
}

export function hasFieldError(
    errors: Record<string, string> | undefined,
    field: string
): boolean {
    return Boolean(errors?.[field]);
}
