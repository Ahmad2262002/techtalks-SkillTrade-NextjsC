"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { Zap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from '@/app/(public)/Landing.module.css';

interface NavbarProps {
  userId: string | null;
}

const Navbar = ({ userId }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      styles.navbar,
      scrolled && styles.navbarScrolled,
      "bg-transparent"
    )}>
      <div className={`${styles.container} ${styles.navContent}`}>
        <Link href="/" className={cn(styles.logo, "z-[60] hover:scale-105 transition-transform")}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white mr-2 shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-extrabold tracking-tighter">Skill</span>
          <span className="text-primary font-extrabold tracking-tighter">Swap</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={cn(styles.navLinks, "bg-muted/30 backdrop-blur-md px-6 py-2 rounded-2xl border border-border/50")}>
          <Link href="/" className="font-bold hover:text-primary transition-colors">Home</Link>
          <Link href="/#features" className="font-bold hover:text-primary transition-colors">Features</Link>
          <Link href="/dashboard" className="font-bold hover:text-primary transition-colors">Browse</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center">
            <ThemeCustomizer />
          </div>

          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-border/50">
            {userId ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-bold rounded-xl">Dashboard</Button>
                </Link>
                <form action={signOut}>
                  <Button type="submit" className="font-black rounded-xl bg-foreground text-background hover:bg-foreground/90">Logout</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-bold rounded-xl px-6">Log In</Button>
                </Link>
                <Link href="/login">
                  <Button className="font-black rounded-xl px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden z-[60] p-2 rounded-xl bg-muted/50 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay - Sliding from left */}
      <div className={cn(
        "fixed inset-0 z-50 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] lg:hidden",
        mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
      )}>
        <div className="flex flex-col items-center justify-center h-full gap-8 p-10 max-w-[300px] bg-background border-r border-border shadow-2xl">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black hover:text-primary transition-colors">Home</Link>
          <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black hover:text-primary transition-colors">Features</Link>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black hover:text-primary transition-colors">Browse</Link>
          <div className="w-full h-px bg-border/50" />
          <div className="flex flex-col w-full gap-4">
            {userId ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-black">Dashboard</Button>
                </Link>
                <form action={signOut} className="w-full">
                  <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black bg-foreground text-background">Logout</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-black">Log In</Button>
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full h-14 rounded-2xl text-lg font-black bg-primary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          <div className="mt-4">
            <ThemeCustomizer />
          </div>
        </div>
        {/* Backdrop for closing */}
        <div
          className={cn("absolute inset-0 bg-transparent lg:hidden", mobileMenuOpen ? "block" : "hidden")}
          onClick={() => setMobileMenuOpen(false)}
        />
      </div>
    </header>
  );
};

export default Navbar;