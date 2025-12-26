import { Zap, Search, MessageSquare, Award } from "lucide-react";
import styles from "@/app/(public)/Landing.module.css";
import { cn } from "@/lib/utils";

export default function HowItWorks() {
    const steps = [
        {
            icon: <Search className="w-8 h-8" />,
            title: "1. Search",
            desc: "Find the skill you want to learn from our global network of experts.",
            color: "text-sky-500",
            bg: "bg-sky-500/10"
        },
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "2. Match",
            desc: "Propose a fair exchange and chat with your potential mentor.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "3. Swap",
            desc: "Meet online or in person to exchange knowledge and level up.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: "4. Build",
            desc: "Get endorsed and build your reputation as a trusted expert.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className={styles.container}>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">How it <span className="text-primary">Works</span></h2>
                    <p className="text-muted-foreground font-bold max-w-2xl mx-auto italic">SkillSwap simplifies knowledge exchange into four seamless steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Hidden on Mobile) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border/30 -translate-y-1/2 z-0" />

                    {steps.map((step, i) => (
                        <div
                            key={i}
                            style={{ animationDelay: `${i * 150}ms` }}
                            className={cn(
                                "relative z-10 flex flex-col items-center text-center p-8 rounded-[3rem] bg-card border border-border/50 hover:border-primary/30 transition-all group",
                                styles.animateSlideUp
                            )}
                        >
                            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-xl shadow-black/5", step.bg, step.color)}>
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-black mb-3">{step.title}</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
