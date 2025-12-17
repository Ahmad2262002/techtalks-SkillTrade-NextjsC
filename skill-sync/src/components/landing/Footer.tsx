
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-white py-12 text-center relative z-10">
      <div className="container mx-auto px-4">
        <p className="font-bold text-3xl mb-3 tracking-wide">
          Skill<span className="text-purple-500">Swap</span>
        </p>
        <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
          Democratizing education through mutual exchange. Join the community today.
        </p>
        <div className="text-xs text-slate-600">
          © {new Date().getFullYear()} SkillSwap MVP. All rights reserved.
        </div>
      </div>
    </footer>
  );
}