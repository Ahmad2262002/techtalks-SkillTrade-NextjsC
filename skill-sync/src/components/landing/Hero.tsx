
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center px-8 md:px-16 gap-8 bg-gradient-to-b from-[#07101a] to-[#071a2a] text-white overflow-hidden">
      {/* Content */}
      <div className="flex-1 z-10 max-w-2xl mt-16 md:mt-0">
        <small className="opacity-85 tracking-widest text-xs font-bold text-indigo-400 mb-2 block">THE BARTER ECONOMY</small>
        <h1 className="text-6xl md:text-8xl font-black leading-none mb-6 tracking-tight">
          SKILL<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">SWAP</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-lg mb-8 leading-relaxed">
          Learn by Teaching. SkillSwap is a peer-to-peer marketplace where your
          expertise is the only currency. Exchange your knowledge for the skills
          you crave.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard">
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-[#6a5cff] to-[#ff7bd6] text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/25">
              BROWSE SWAPS
            </button>
          </Link>
          <Link href="/login">
            <button className="px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold hover:bg-white/10 transition-colors">
              FIND MY MATCH
            </button>
          </Link>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex justify-end items-center z-0 hidden md:flex">
        <div className="relative w-[500px] h-[500px]">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
          {/* Ensure you have an image at /public/skill-logo.png or change the src */}
          <img
            src="/skill-logo.png"
            alt="SkillSwap Illustration"
            className="relative z-10 w-full h-full object-contain drop-shadow-2xl mix-blend-screen"
          />
        </div>
      </div>
    </section>
  );
}