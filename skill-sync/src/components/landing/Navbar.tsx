"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import styles from '@/app/(public)/Landing.module.css';

interface NavbarProps {
  userId: string | null;
}

const Navbar = ({ userId }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className={`${styles.container} ${styles.navContent}`}>
        <Link href="/" className={styles.logo}>
          Skill<span>Swap</span>
        </Link>
        
        <nav className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/#features">How It Works</Link>
          <Link href="/browse">Browse</Link>
        </nav>

        <div className={styles.navActions}>
          <ThemeToggleButton />
          {userId ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <form action={signOut}>
                <Button type="submit">Logout</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/login">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;