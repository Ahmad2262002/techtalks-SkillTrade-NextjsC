"use client";

import { useTheme, Accent } from "@/context/ThemeContext";
import { Palette, Sun, Moon, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const accents: { id: Accent; name: string; color: string }[] = [
    { id: "default", name: "Classic Indigo", color: "bg-[#3b82f6]" },
    { id: "sunset", name: "Vibrant Sunset", color: "bg-[#f97316]" },
    { id: "emerald", name: "Emerald Forest", color: "bg-[#10b981]" },
    { id: "ocean", name: "Deep Ocean", color: "bg-[#0ea5e9]" },
    { id: "midnight", name: "Cyber Midnight", color: "bg-[#8b5cf6]" },
];

export function ThemeCustomizer() {
    const { theme, accent, toggleTheme, setAccent } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-card border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-xl shadow-black/5 group">
                    <Palette className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4 rounded-[2rem] bg-card/95 backdrop-blur-xl border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <DropdownMenuLabel className="px-2 pt-1 pb-4 flex flex-col gap-1">
                    <span className="text-sm font-black uppercase tracking-widest text-foreground">Aesthetics</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Personalize your swap experience</span>
                </DropdownMenuLabel>

                <div className="space-y-6">
                    <div className="px-2 flex flex-col gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Appearance</span>
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-between w-full p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                        >
                            <div className="flex items-center gap-2">
                                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                                <span className="text-sm font-bold capitalize">{theme} Mode</span>
                            </div>
                            <div className="w-8 h-4 bg-primary/20 rounded-full relative">
                                <div className={cn(
                                    "absolute top-1 w-2 h-2 rounded-full bg-primary transition-all",
                                    theme === 'dark' ? "right-1" : "left-1"
                                )} />
                            </div>
                        </button>
                    </div>

                    <div className="px-2 flex flex-col gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Color Palette</span>
                        <div className="grid grid-cols-5 gap-2">
                            {accents.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setAccent(a.id)}
                                    title={a.name}
                                    className={cn(
                                        "relative h-10 w-10 rounded-xl transition-all border-2",
                                        accent === a.id ? "border-primary scale-110 shadow-lg" : "border-transparent hover:scale-105"
                                    )}
                                >
                                    <div className={cn("w-full h-full rounded-lg", a.color)} />
                                    {accent === a.id && (
                                        <div className="absolute inset-0 flex items-center justify-center text-white">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <span className="text-center text-[10px] font-bold text-muted-foreground italic mt-2">
                            {accents.find(a => a.id === accent)?.name}
                        </span>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
