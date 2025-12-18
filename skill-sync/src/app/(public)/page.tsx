import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import { getCurrentUserId } from "@/actions/auth";
import styles from "./Landing.module.css";

export default async function Home() {
  const userId = await getCurrentUserId();

  return (
    <div className={styles.pageWrapper}>
      <Navbar userId={userId} />
      <main className={styles.mainContent}>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}