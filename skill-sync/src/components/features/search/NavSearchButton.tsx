// components/NavSearchButton.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X as XIcon } from "lucide-react";
import SearchSection from "../../../components/features/search/SearchSection";

export default function NavSearchButton() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // optional: prevent body scroll while modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-sky-500/40 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] cursor-pointer"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <SearchIcon className=" h-5 w-5" />
          
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 sm:py-12"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* panel */}
          <div
            ref={panelRef}
            className="relative z-10 w-full max-w-5xl h-[80vh] bg-slate-900/95 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <SearchIcon className="h-5 w-5 text-sky-300" />
                <h3 className="text-sm font-semibold">Search Proposals</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 hover:bg-slate-800/40"
                  aria-label="Close search"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* content */}
            <div className="h-[calc(80vh-56px)] overflow-auto">
              {/* Render your SearchSection component here */}
              <SearchSection />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
