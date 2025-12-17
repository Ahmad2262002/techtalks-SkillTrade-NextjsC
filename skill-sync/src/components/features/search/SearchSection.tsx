"use client";

import React, { useState, useRef, useEffect } from "react";
import "./search.css";
import { listPublicProposals } from "@/actions/proposals";

/* ---------------- TYPES ---------------- */
// Add support for ion-icon web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        size?: string;
        class?: string;
        [key: string]: any;
      };
    }
  }
}

type ProposalWithDetails = Awaited<ReturnType<typeof listPublicProposals>>[number];

/* ---------------- FILTER OPTIONS ---------------- */
const filtersData: Record<string, string[]> = {
  date: ["ANY", "Today", "This Week", "This Month"],
};

export default function SearchSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // NEW: State for switching views
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [selectedFilters, setSelectedFilters] = useState({
    date: "ANY",
    searchIn: "All",
  });

  // Debounce ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- DATA FETCHING ---------------- */
  const fetchProposals = async (query: string) => {
    try {
      setLoading(true);
      const data = await listPublicProposals({
        search: query || undefined,
        take: 50,
      });
      setProposals(data);
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // Debounce search by 500ms
    debounceRef.current = setTimeout(() => {
      fetchProposals(searchText);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  /* ---------------- DATE FILTERING (Client Side) ---------------- */
  const displayedProposals = proposals.filter((item) => {
    return checkDateFilter(item.createdAt.toString(), selectedFilters.date);
  });

  /* ---------------- CARD ANIMATION ---------------- */
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    cardsRef.current = [];

    // Create observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Wait slightly for DOM to paint
    const timer = setTimeout(() => {
      document.querySelectorAll(".simple-card").forEach((card) => {
        observer.observe(card);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [displayedProposals, loading, viewMode]); // Re-run on view change too

  /* ---------------- UI ---------------- */
  return (
    <section className="search-section">
      <div className="first-layer">
        {/* FILTER BUTTON */}
        <button className="filter-btn" onClick={() => setMenuOpen(!menuOpen)} title="Filter">
          {/* @ts-ignore */}
          <ion-icon name="filter-outline"></ion-icon>
        </button>

        {/* VIEW TOGGLE BUTTON (NEW) */}
        <button
          className="filter-btn"
          onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
          title={viewMode === 'list' ? 'Switch to Grid View' : 'Switch to List View'}
        >
          {/* @ts-ignore */}
          <ion-icon name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}></ion-icon>
        </button>

        <div className={`filter-menu ${menuOpen ? "active" : ""}`}>
          <div className="filter-menu-content">
            {Object.keys(filtersData).map((group) => (
              <div className="filter-group" key={group}>
                <p className="filter-title">{group}</p>
                <div className="filter-options">
                  {filtersData[group].map((opt) => {
                    const active =
                      selectedFilters[group as keyof typeof selectedFilters] ===
                      opt;
                    return (
                      <span
                        key={opt}
                        className={`filter-option ${active ? "active" : ""}`}
                        onClick={() =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            [group]: opt,
                          }))
                        }
                      >
                        {opt}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="text-to-search"
            placeholder="Search proposals..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="search-btn">
            {/* @ts-ignore */}
            <ion-icon name="search-outline"></ion-icon>
          </button>
        </div>
      </div>

      <div className="second-layer">
        {/* Added conditional class for grid-view */}
        <div className={`cards-area ${viewMode === 'grid' ? 'grid-view' : ''}`}>
          {loading ? (
            <p className="loading-text">Searching database...</p>
          ) : (
            <>
              {displayedProposals.map((item, index) => (
                <div
                  className="simple-card"
                  key={item.id}
                  ref={(el) => {
                    if (el) cardsRef.current[index] = el;
                  }}
                >
                  <div className="top-line">
                    <span className="username" title={item.title}>
                      {item.title}
                    </span>
                    <span className="date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="description">{item.description}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', fontSize: '12px', color: '#888' }}>
                    <span>by {item.owner.name || "Unknown"}</span>
                    <span>{item._count.applications} apps &bull; {item._count.swaps} swaps</span>
                  </div>

                  <div className="skills">
                    <span className="offer">
                      <b>Offer:</b>{" "}
                      {item.offeredSkills.map((s) => s.name).join(", ")}
                    </span>
                    <span className="want">
                      <b>Want:</b>{" "}
                      {item.neededSkills.map((s) => s.name).join(", ")}
                    </span>
                  </div>
                </div>
              ))}

              {!loading && displayedProposals.length === 0 && (
                <p className="no-results">No results found.</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function checkDateFilter(dateStr: string, filter: string) {
  if (filter === "ANY") return true;
  const itemDate = new Date(dateStr);
  const today = new Date();
  const diff = (today.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
  if (filter === "Today") return diff <= 1;
  if (filter === "This Week") return diff <= 7;
  if (filter === "This Month") return diff <= 30;
  return true;
}