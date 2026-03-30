import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "./Firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const CATEGORIES = [
  "All",
  "Rudraksha",
  "Gemstones",
  "Yantras",
  "Bracelets",
  "Rings",
  "Pendants",
  "Puja Samagri",
  "Vastu",
  "Books",
  "Others",
];

const OmSVG = ({ size = 120, opacity = 0.05 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity, pointerEvents: "none" }}
  >
    <text
      x="100"
      y="145"
      textAnchor="middle"
      fontSize="150"
      fontFamily="serif"
      fill="#b45309"
    >
      ॐ
    </text>
  </svg>
);

const SwastikaSVG = ({ size = 60, opacity = 0.05 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    style={{ opacity, pointerEvents: "none" }}
  >
    <rect x="42" y="10" width="16" height="80" rx="4" fill="#b45309" />
    <rect x="10" y="42" width="80" height="16" rx="4" fill="#b45309" />
    <rect x="58" y="10" width="16" height="16" rx="3" fill="#b45309" />
    <rect x="16" y="58" width="16" height="16" rx="3" fill="#b45309" />
    <rect
      x="16"
      y="10"
      width="16"
      height="16"
      rx="3"
      fill="#b45309"
      transform="rotate(90 24 18)"
    />
    <rect
      x="58"
      y="74"
      width="16"
      height="16"
      rx="3"
      fill="#b45309"
      transform="rotate(270 66 82)"
    />
  </svg>
);

export default function ShopPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const activeCat = searchParams.get("cat") || "All";

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "products"), orderBy("purchases", "desc")),
        );
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (activeCat !== "All") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeCat]);

  const setCat = (cat) => {
    setSearchParams(cat === "All" ? {} : { cat });
    setSearch("");
  };
  const getCatCount = (cat) =>
    cat === "All"
      ? products.length
      : products.filter((p) => p.category === cat).length;

  const filtered = products.filter((p) => {
    const matchCat = activeCat === "All" || p.category === activeCat;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#fdf8f0] font-['DM_Sans',sans-serif] relative overflow-x-hidden">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden">
        <span
          style={{
            fontSize: 520,
            color: "rgba(180,83,9,0.025)",
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          ॐ
        </span>
      </div>

      <nav
        className="sticky top-0 z-50 border-b border-amber-700/10"
        style={{
          background: "rgba(253,248,240,0.97)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="max-w-300 mx-auto px-6 flex items-center gap-0 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCat(cat)}
              className={`flex items-center gap-1.5 px-4 py-3.5 border-none bg-transparent font-['DM_Sans',sans-serif] text-xs font-medium tracking-wide cursor-pointer transition-all whitespace-nowrap border-b-2 shrink-0 ${activeCat === cat ? "text-amber-700 font-semibold border-amber-400 bg-amber-400/6" : "text-amber-700/55 border-transparent hover:text-amber-700 hover:bg-amber-400/5"}`}
            >
              {cat}
              <span className="bg-amber-400/15 text-amber-700 rounded-xl px-1.5 py-px text-[10px] font-bold">
                {getCatCount(cat)}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <div className="bg-white border-b border-amber-700/8 py-12 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 pointer-events-none animate-spin-slow">
          <OmSVG size={200} opacity={0.04} />
        </div>
        <div className="absolute bottom-2 left-5 pointer-events-none">
          <SwastikaSVG size={90} opacity={0.04} />
        </div>

        <div className="max-w-300 mx-auto px-6 text-center relative z-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber-700/45 font-semibold mb-2">
            {activeCat === "All" ? "Complete Collection" : activeCat}
          </p>
          <h1
            className="font-['Cinzel',serif] font-bold text-[#44260a] mb-2 tracking-wide"
            style={{ fontSize: "clamp(24px,3.5vw,34px)" }}
          >
            {activeCat === "All"
              ? "All Sacred Products"
              : `${activeCat} Collection`}
          </h1>
          <p className="font-['Cormorant_Garamond',serif] italic text-[17px] text-[#b08050] mb-5">
            {activeCat === "All"
              ? "Explore our complete range of vedic & spiritual items"
              : `Explore our hand-selected ${activeCat.toLowerCase()} collection`}
          </p>
          <div className="h-0.5 w-16 bg-grlineardient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />

          <div className="flex justify-center">
            <div className="relative w-full max-w-100">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700/40 text-base pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 box-border border border-amber-700/18 rounded-xl font-['DM_Sans',sans-serif] text-[13.5px] text-[#44260a] outline-none transition-colors focus:border-amber-400"
                style={{ background: "rgba(245,158,11,0.04)" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-300 mx-auto px-6 py-9 relative z-10">
        <div className="absolute top-0 -right-2 pointer-events-none">
          <SwastikaSVG size={100} opacity={0.03} />
        </div>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-2.5">
          <p className="font-['Cormorant_Garamond',serif] italic text-base text-amber-700/50">
            {loading
              ? "Loading…"
              : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} found`}
          </p>
          {activeCat !== "All" && (
            <button
              onClick={() => setCat("All")}
              className="bg-transparent border border-amber-700/18 text-amber-700/60 px-3.5 py-1 rounded-lg font-['DM_Sans',sans-serif] text-[11px] cursor-pointer transition-all hover:bg-amber-700/5 hover:text-amber-700"
            >
              ✕ Clear filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 font-['Cormorant_Garamond',serif] italic text-lg text-amber-700/40">
            Loading sacred items…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-30">🛍️</div>
            <p className="font-['Cinzel',serif] text-[17px] text-amber-700/50 mb-2">
              No products found
            </p>
            <p className="font-['Cormorant_Garamond',serif] italic text-[15px] text-amber-700/30">
              Try a different category or search term.
            </p>
          </div>
        ) : (
          <div
            className="sp-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 20,
            }}
          >
            {filtered.map((p, i) => {
              const d =
                p.mrp && p.price
                  ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                  : 0;
              return (
                <div
                  key={p.id}
                  className="sp-card"
                  style={{ animationDelay: `${(i % 12) * 0.05}s` }}
                  onClick={() => navigate(`/buy/${p.id}`)}
                >
                  {d > 0 && (
                    <div
                      className="absolute top-2.5 right-2.5 z-10 font-['Cinzel',serif] text-[8px] font-bold tracking-wide px-2 py-0.5 rounded-full text-amber-50"
                      style={{
                        background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      }}
                    >
                      {d}% OFF
                    </div>
                  )}
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full object-cover block"
                      style={{ aspectRatio: "1" }}
                    />
                  ) : (
                    <div
                      className="w-full flex items-center justify-center text-5xl"
                      style={{
                        aspectRatio: "1",
                        background:
                          "linear-gradient(135deg,rgba(245,158,11,0.07),rgba(180,83,9,0.04))",
                      }}
                    >
                      🛍️
                    </div>
                  )}
                  <div className="p-3.5">
                    <p className="font-['Cinzel',serif] text-[13px] font-semibold text-[#44260a] mb-0.5 truncate">
                      {p.name}
                    </p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[13px] text-[#b08050] mb-2">
                      {p.brand || p.category}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(p.features || []).slice(0, 2).map((f) => (
                        <span
                          key={f}
                          className="text-[9px] font-semibold px-2 py-px rounded-full"
                          style={{
                            background: "rgba(245,158,11,0.1)",
                            color: "#b45309",
                            border: "1px solid rgba(245,158,11,0.2)",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-['Cinzel',serif] text-base font-bold text-[#b45309]">
                        ₹{p.price}
                      </span>
                      {d > 0 && (
                        <>
                          <span className="text-xs text-amber-700/40 line-through">
                            ₹{p.mrp}
                          </span>
                          <span className="text-[10px] text-green-600 font-bold">
                            {d}% off
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      className="sp-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/buy/${p.id}`);
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
