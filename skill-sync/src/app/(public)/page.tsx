
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import { getCurrentUserId } from "@/lib/auth";

export default async function Home() {
  const userId = await getCurrentUserId();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#07101a] text-white">
      <Navbar userId={userId} />
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}