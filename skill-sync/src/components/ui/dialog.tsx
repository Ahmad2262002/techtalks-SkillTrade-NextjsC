"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Simplified Dialog Context
const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
}>({
    open: false,
    onOpenChange: () => { },
})

const Dialog = ({
    children,
    open,
    onOpenChange,
}: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) => {
    // Support both controlled and uncontrolled state
    const [isOpen, setIsOpen] = React.useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    const isVisible = open !== undefined ? open : isOpen

    return (
        <DialogContext.Provider value={{ open: isVisible, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, children, asChild, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext)

    // If asChild is true, we should clone the child and add the onClick handler
    // For simplicity in this mock, if asChild is true, we just render the child and hope it handles clicks,
    // or we wrap it. But standard Radix asChild merges props.
    // Here we'll just wrap it in a span if asChild is true to capture the click, or just render a button if not.

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        onOpenChange(true)
    }

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                // @ts-ignore
                children.props.onClick?.(e)
                onOpenChange(true)
            }
        })
    }

    return (
        <button
            ref={ref}
            className={cn(className)}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext)

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (open) {
            const scrollY = window.scrollY
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollY}px`
            document.body.style.width = '100%'

            return () => {
                document.body.style.position = ''
                document.body.style.top = ''
                document.body.style.width = ''
                window.scrollTo(0, scrollY)
            }
        }
    }, [open])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-200"
            onClick={() => onOpenChange(false)}
        >
            <div
                ref={ref}
                className={cn(
                    "relative grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
                    "transition-all duration-200 ease-out",
                    "animate-in zoom-in-95 fade-in-0",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4 cursor-pointer" onClick={() => onOpenChange(false)} />
                    <span className="sr-only">Close</span>
                </div>
                {children}
            </div>
        </div>
    )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
