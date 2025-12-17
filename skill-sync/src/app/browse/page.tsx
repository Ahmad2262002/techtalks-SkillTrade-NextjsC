
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import SearchSection from "@/components/features/search/SearchSection";
import { getCurrentUserId } from "@/lib/auth";

export default async function BrowsePage() {
  const userId = await getCurrentUserId();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#071a2a] text-white">
      <Navbar userId={userId} />
      <main className="flex-grow pt-24">
        <SearchSection />
      </main>
      <Footer />
    </div>
  );
}