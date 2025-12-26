import React from 'react';
import styles from '@/app/(public)/Landing.module.css';
import Link from 'next/link';

import { Zap, Github, Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className={cn(styles.footer, "bg-muted/30 pt-20 pb-12")}>
      <div className={styles.container}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <Link href="/" className={cn(styles.logo, "hover:opacity-80 transition-opacity mb-2")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white mr-2 shadow-lg shadow-primary/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold tracking-tighter">Skill</span>
              <span className="text-primary font-extrabold tracking-tighter">Swap</span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              The world's first decentralized talent exchange. Join thousands of experts trading knowledge across 50+ countries.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"><Github className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6">Platform</h4>
            <ul className="space-y-4">
              {['Explore Swaps', 'Top Mentors', 'Community Guidelines', 'Safety Center'].map(item => (
                <li key={item}><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6">Ecosystem</h4>
            <ul className="space-y-4">
              {['About Us', 'Success Stories', 'Partner Program', 'Careers'].map(item => (
                <li key={item}><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6">Stay Ahead</h4>
            <p className="text-xs text-muted-foreground mb-4 font-bold">Get the latest swap opportunities weekly.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="email@example.com" className="w-full bg-card border border-border/50 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary transition-all" />
              <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black hover:scale-105 active:scale-95 transition-all">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} SkillSwap Premium Registry. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}