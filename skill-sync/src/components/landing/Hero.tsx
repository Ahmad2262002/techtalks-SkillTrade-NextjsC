import Link from "next/link";
import { Button } from "@/components/ui/button";
import styles from "@/app/(public)/Landing.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground} aria-hidden="true" />
      <div className={`${styles.container} ${styles.heroContent}`}>
        <span className={styles.heroEyebrow}>The future of learning is collaborative</span>
        <h1 className={styles.heroTitle}>
          Trade Your Talent. Master a New Skill.
        </h1>
        <p className={styles.heroDescription}>
          SkillSwap is a peer-to-peer marketplace where your expertise is the only currency. Exchange your knowledge for the skills you've always wanted to learn, one-on-one.
        </p>

        <div className={styles.heroActions}>
          <Link href="/dashboard">
            <Button size="lg">Start Browsing Swaps</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Find Your Match
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}