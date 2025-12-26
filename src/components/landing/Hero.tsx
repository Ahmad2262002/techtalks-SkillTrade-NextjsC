import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import styles from "@/app/(public)/Landing.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground} aria-hidden="true" />
      <div className={`${styles.container} ${styles.heroContent}`}>
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="px-4 py-2 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center gap-3 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-foreground">
              Join <span className="text-primary font-black">2,400+</span> learners today
            </p>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <span className={cn(styles.heroEyebrow, styles.animateSlideUp)}>The future of learning is collaborative</span>
        <h1 className={cn(styles.heroTitle, styles.animateSlideLeft, "delay-75")}>
          Trade Your Talent.<br />Master <span className="text-primary font-black">Anything.</span>
        </h1>
        <p className={cn(styles.heroDescription, styles.animateSlideRight, "delay-150")}>
          SkillSwap is a premium peer-to-peer marketplace where your expertise is the only currency. Exchange your knowledge for the skills you've always wanted to learn.
        </p>

        <div className={cn(styles.heroActions, "animate-fade-in delay-300")}>
          <Link href="/dashboard">
            <Button size="lg" className="h-16 px-10 rounded-2xl text-xl font-black bg-primary shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all group">
              Start Browsing Swaps
              <Zap className="ml-2 w-5 h-5 group-hover:fill-current transition-all" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-xl font-black border-2 hover:bg-muted transition-all">
              Find Your Match
            </Button>
          </Link>
        </div>

        <div className="mt-24 pt-12 border-t border-border/10 animate-fade-in delay-500">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-12">Empowering learners from</p>
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeContent}>
              {["Google", "Meta", "Amazon", "Netflix", "Microsoft", "Tencent", "Airbnb", "Spotify"].map(brand => (
                <span key={brand} className="text-3xl font-black tracking-tighter text-foreground italic opacity-40 hover:opacity-100 transition-opacity cursor-default whitespace-nowrap">{brand}</span>
              ))}
              {/* Duplicate for infinite effect */}
              {["Google", "Meta", "Amazon", "Netflix", "Microsoft", "Tencent", "Airbnb", "Spotify"].map(brand => (
                <span key={`${brand}-dup`} className="text-3xl font-black tracking-tighter text-foreground italic opacity-40 hover:opacity-100 transition-opacity cursor-default whitespace-nowrap">{brand}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in delay-700">
          {[
            { label: "Swaps Completed", value: "12,402", color: "text-primary" },
            { label: "Global Mentors", value: "840+", color: "text-primary" },
            { label: "Unique Skills", value: "154", color: "text-primary" },
            { label: "Community Rating", value: "4.95", color: "text-primary" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center p-6 rounded-[2rem] bg-card/30 border border-border/10 backdrop-blur-sm group hover:border-primary/20 transition-all">
              <span className={cn("text-3xl font-black mb-1", stat.color)}>{stat.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}