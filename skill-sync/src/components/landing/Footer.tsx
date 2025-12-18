import React from 'react';
import styles from '@/app/(public)/Landing.module.css';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.footerContent}`}>
        <Link href="/" className={styles.logo}>
          Skill<span>Swap</span>
        </Link>
        <p className={styles.footerCopyright}>
          © {new Date().getFullYear()} SkillSwap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}