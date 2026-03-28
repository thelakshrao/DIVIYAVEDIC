import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./Firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const ORBIT_ITEMS = 10;
const BG_COLORS = [
  "#fdf3e3",
  "#eef2ff",
  "#fefce8",
  "#f0fdf4",
  "#fff0f5",
  "#f0f9ff",
];
const INTERVAL = 5000;

export default function ItemsAtFront() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [featKey, setFeatKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);

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

  const orbitItems = products.slice(0, ORBIT_ITEMS);
  const gridItems = products.slice(0, 8);

  useEffect(() => {
    if (orbitItems.length === 0) return;
    setProgress(0);
    const start = Date.now();
    const tick = () => {
      const pct = Math.min(((Date.now() - start) / INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) progressRef.current = requestAnimationFrame(tick);
    };
    progressRef.current = requestAnimationFrame(tick);
    const timer = setInterval(() => {
      setActiveIdx((p) => (p + 1) % orbitItems.length);
      setFeatKey((k) => k + 1);
    }, INTERVAL);
    return () => {
      clearInterval(timer);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [activeIdx, orbitItems.length]);

  const handleTileClick = (i) => {
    setActiveIdx(i);
    setFeatKey((k) => k + 1);
    setProgress(0);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
  };

  const active = orbitItems[activeIdx];
  const disc =
    active?.mrp && active?.price
      ? Math.round(((active.mrp - active.price) / active.mrp) * 100)
      : 0;

  return (
    <div className="font-['DM_Sans',sans-serif]">
      {/* ══ SECTION 1 — FEATURED ══ */}
      <section className="bg-[#fdf8f0] py-16 px-6 relative overflow-hidden">
        {/* Header */}
        <div className="max-w-5xl mx-auto text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-amber-700/45 font-semibold mb-2">
            Top Picks
          </p>
          <h2 className="font-['Cinzel',serif] text-2xl md:text-3xl font-bold text-[#44260a] mb-2 tracking-wide">
            Most Beloved Sacred Items
          </h2>
          <p className="font-['Cormorant_Garamond',serif] italic text-lg text-[#b08050] mb-5">
            Handpicked for your spiritual journey
          </p>
          <div className="h-0.5 w-16 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </div>

        {loading ? (
          <div className="text-center py-16 font-['Cormorant_Garamond',serif] italic text-lg text-amber-700/40">
            Loading sacred items…
          </div>
        ) : orbitItems.length === 0 ? (
          <div className="text-center py-16 font-['Cormorant_Garamond',serif] italic text-lg text-amber-700/40">
            No products yet. Check back soon.
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-start">
            {/* LEFT — orbit tiles */}
            <div className="w-full md:w-80 shrink-0">
              <div className="grid grid-cols-2 gap-3.5">
                {orbitItems.map((p, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleTileClick(i)}
                      className={`rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-2 px-2 transition-all border-2 relative overflow-hidden
                        ${
                          isActive
                            ? "border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.18),0_8px_24px_rgba(180,83,9,0.15)] pt-6 pb-3"
                            : "border-amber-700/10 bg-white hover:-translate-y-0.5 pt-3 pb-3"
                        }`}
                      style={{
                        background: isActive
                          ? BG_COLORS[i % BG_COLORS.length]
                          : "#fff",
                      }}
                    >
                      {isActive && (
                        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-linear-to-r from-amber-400 to-amber-600 text-amber-50 font-['Cinzel',serif] text-[7px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full whitespace-nowrap">
                          ✦ Featured
                        </span>
                      )}
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-amber-400/6 border border-amber-700/8 shrink-0">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🛍️</span>
                        )}
                      </div>
                      <div className="text-center px-1">
                        <div className="font-['Cinzel',serif] text-[11px] font-semibold text-[#44260a] leading-snug mb-0.5">
                          {p.name.length > 16
                            ? p.name.slice(0, 16) + "…"
                            : p.name}
                        </div>
                        <div className="font-['Cinzel',serif] text-xs font-bold text-amber-700">
                          ₹{p.price}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="h-0.5 bg-amber-700/10 rounded mt-4 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded transition-[width_0.08s_linear]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-2.5">
                {orbitItems.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => handleTileClick(i)}
                    className="cursor-pointer rounded-full transition-all"
                    style={{
                      width: i === activeIdx ? 18 : 7,
                      height: 7,
                      borderRadius: i === activeIdx ? 4 : "50%",
                      background:
                        i === activeIdx ? "#f59e0b" : "rgba(180,83,9,0.2)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT — featured detail card */}
            {active && (
              <div
                key={featKey}
                className="flex-1 bg-white border border-amber-700/12 rounded-3xl shadow-[0_4px_36px_rgba(120,53,15,0.1)] relative overflow-hidden p-7"
              >
                {/* Gold top bar */}
                <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-amber-400 to-transparent rounded-t-3xl" />

                <p className="text-[9px] tracking-widest uppercase text-amber-700/40 font-semibold mb-3">
                  ✦ Featured
                </p>

                <div className="w-full aspect-video rounded-xl overflow-hidden bg-amber-400/5 border border-amber-700/10 flex items-center justify-center mb-5">
                  {active.images?.[0] ? (
                    <img
                      src={active.images[0]}
                      alt={active.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-7xl opacity-20">🛍️</span>
                  )}
                </div>

                <span className="inline-block bg-amber-400/10 border border-amber-700/18 text-amber-700 rounded-full px-3 py-0.5 text-[10px] font-semibold tracking-widest uppercase mb-2">
                  {active.category}
                </span>

                <h3 className="font-['Cinzel',serif] text-xl font-bold text-[#44260a] mb-1">
                  {active.name}
                </h3>
                {active.brand && (
                  <p className="font-['Cormorant_Garamond',serif] italic text-[15px] text-[#b08050] mb-3">
                    {active.brand}
                  </p>
                )}

                <p className="font-['Cormorant_Garamond',serif] text-base text-amber-900 leading-relaxed mb-3 opacity-85 line-clamp-3">
                  {active.description}
                </p>

                {(active.features || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(active.features || []).slice(0, 5).map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/10 text-amber-700 border border-amber-400/22"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-baseline gap-2.5 mb-3 flex-wrap">
                  <span className="font-['Cinzel',serif] text-2xl font-bold text-amber-700">
                    ₹{active.price}
                  </span>
                  {disc > 0 && (
                    <>
                      <span className="text-sm text-amber-700/40 line-through">
                        ₹{active.mrp}
                      </span>
                      <span className="bg-green-600/10 text-green-600 border border-green-600/20 rounded-lg px-2 py-0.5 text-[11px] font-bold">
                        {disc}% OFF
                      </span>
                    </>
                  )}
                </div>

                {active.deliveryDays && (
                  <p className="text-[11px] text-amber-700/45 mb-4">
                    🚚 Delivery in {active.deliveryDays} ·{" "}
                    {active.deliveryFee == 0
                      ? "Free shipping"
                      : "₹" + active.deliveryFee}
                  </p>
                )}

                <button
                  onClick={() => navigate(`/buy/${active.id}`)}
                  className="w-full bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 border-none py-2.5 rounded-xl font-['Cinzel',serif] text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(245,158,11,0.38)] transition-all shadow-[0_3px_12px_rgba(245,158,11,0.28)]"
                >
                  Buy Now — ₹{active.price}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ══ SECTION 2 — PRODUCT GRID ══ */}
      {products.length > 0 && (
        <section className="bg-white py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.25em] uppercase text-amber-700/45 font-semibold mb-2">
                Our Collection
              </p>
              <h2 className="font-['Cinzel',serif] text-2xl md:text-3xl font-bold text-[#44260a] mb-2 tracking-wide">
                All Sacred Products
              </h2>
              <p className="font-['Cormorant_Garamond',serif] italic text-lg text-[#b08050] mb-5">
                Explore our complete range of vedic items
              </p>
              <div className="h-0.5 w-16 bg-linaer-to-r from-transparent via-amber-400 to-transparent mx-auto" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {gridItems.map((p) => {
                const d =
                  p.mrp && p.price
                    ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                    : 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/buy/${p.id}`)}
                    className="bg-white border border-amber-700/10 rounded-2xl overflow-hidden cursor-pointer relative hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(120,53,15,0.13)] hover:border-amber-700/22 transition-all"
                  >
                    {/* Gold top line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-linaer-to-r from-transparent via-amber-400 to-transparent" />

                    {d > 0 && (
                      <div className="absolute top-2.5 right-2.5 z-10 bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 font-['Cinzel',serif] text-[8px] font-bold tracking-wide px-2 py-0.5 rounded-full">
                        {d}% OFF
                      </div>
                    )}

                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full aspect-square object-cover block"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-linear-to-br from-amber-400/7 to-amber-700/4 flex items-center justify-center text-5xl">
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
                            className="bg-amber-400/10 text-amber-700 border border-amber-400/20 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Cinzel',serif] text-base font-bold text-amber-700">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/buy/${p.id}`);
                        }}
                        className="w-full mt-2.5 bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 border-none py-2 rounded-xl font-['Cinzel',serif] text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_3px_12px_rgba(245,158,11,0.25)]"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {products.length > 8 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => navigate("/shop")}
                  className="inline-flex items-center gap-2 bg-transparent border border-amber-700/20 text-amber-700 px-9 py-3 rounded-full font-['Cinzel',serif] text-[11px] font-semibold tracking-widest uppercase cursor-pointer hover:bg-amber-400/6 hover:border-amber-400 hover:text-amber-600 hover:-translate-y-0.5 transition-all"
                >
                  See All Products ({products.length}) →
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
