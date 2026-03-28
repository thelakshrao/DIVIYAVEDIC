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

const shopStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes sfadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
  @keyframes sSpinSlow { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }

  .shop-page { min-height:100vh; background:#fdf8f0; font-family:'DM Sans',sans-serif; position:relative; overflow-x:hidden; }
  .shop-page::before { content:'ॐ'; position:fixed; font-size:520px; color:rgba(180,83,9,0.025); font-family:serif; top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; z-index:0; user-select:none; }

  .s-container { max-width:1200px; margin:0 auto; padding:0 24px; position:relative; z-index:1; }

  /* ── Top sticky category nav ── */
  .cat-nav {
    position:sticky; top:0; z-index:50;
    background:rgba(253,248,240,0.97);
    backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(180,83,9,0.1);
    padding:0;
  }
  .cat-nav-inner {
    max-width:1200px; margin:0 auto; padding:0 24px;
    display:flex; align-items:center; gap:0; overflow-x:auto;
    scrollbar-width:none;
  }
  .cat-nav-inner::-webkit-scrollbar { display:none; }
  .cat-tab {
    display:flex; align-items:center; gap:6px;
    padding:14px 18px; border:none; background:transparent;
    font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500;
    letter-spacing:0.05em; color:rgba(180,83,9,0.55);
    cursor:pointer; transition:all 0.2s; white-space:nowrap;
    border-bottom:2px solid transparent; flex-shrink:0;
  }
  .cat-tab:hover { color:#b45309; background:rgba(245,158,11,0.05); }
  .cat-tab.active {
    color:#b45309; font-weight:600;
    border-bottom-color:#f59e0b;
    background:rgba(245,158,11,0.06);
  }
  .cat-count { background:rgba(245,158,11,0.15); color:#b45309; border-radius:10px; padding:1px 7px; font-size:10px; font-weight:700; }

  /* ── Product card ── */
  .sp-card {
    background:#fff; border:1px solid rgba(180,83,9,0.1); border-radius:18px;
    overflow:hidden; cursor:pointer; transition:all 0.25s; position:relative;
    animation:sfadeUp 0.5s ease forwards; opacity:0;
  }
  .sp-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,#f59e0b 40%,#fcd34d 50%,#f59e0b 60%,transparent);
  }
  .sp-card:hover { transform:translateY(-5px); box-shadow:0 12px 36px rgba(120,53,15,0.13); border-color:rgba(180,83,9,0.22); }

  .sp-btn {
    width:100%; background:linear-gradient(135deg,#f59e0b,#d97706);
    color:#fff8ee; border:none; padding:9px; border-radius:10px;
    font-family:'Cinzel',serif; font-size:10px; font-weight:700;
    letter-spacing:0.12em; text-transform:uppercase; cursor:pointer;
    transition:all 0.2s; box-shadow:0 3px 12px rgba(245,158,11,0.25); margin-top:10px;
  }
  .sp-btn:hover { opacity:0.92; transform:translateY(-1px); }

  .gold-bar { height:2px; background:linear-gradient(90deg,transparent,#f59e0b,transparent); border-radius:2px; width:64px; margin:0 auto; }

  .empty-state { text-align:center; padding:80px 20px; }

  .spin-deco { animation:sSpinSlow 30s linear infinite; }

  @media(max-width:768px) {
    .sp-grid { grid-template-columns:1fr 1fr !important; }
    .shop-header h1 { font-size:22px !important; }
  }
  @media(max-width:480px) {
    .sp-grid { grid-template-columns:1fr 1fr !important; }
    .cat-tab { padding:12px 12px; font-size:11px; }
  }
`;

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

  const setCat = (cat) => {
    setSearchParams(cat === "All" ? {} : { cat });
    setSearch("");
  };

  const getCatCount = (cat) => {
    if (cat === "All") return products.length;
    return products.filter((p) => p.category === cat).length;
  };

  const filtered = products.filter((p) => {
    const matchCat = activeCat === "All" || p.category === activeCat;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{shopStyles}</style>
      <div className="shop-page">
        {/* ── CATEGORY NAV (sticky) ── */}
        <nav className="cat-nav">
          <div className="cat-nav-inner">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`cat-tab ${activeCat === cat ? "active" : ""}`}
                onClick={() => setCat(cat)}
              >
                {cat}
                <span className="cat-count">{getCatCount(cat)}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ── HERO HEADER ── */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid rgba(180,83,9,0.08)",
            padding: "48px 0 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* BG decos */}
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              pointerEvents: "none",
            }}
          >
            <div className="spin-deco">
              <OmSVG size={200} opacity={0.04} />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 20,
              pointerEvents: "none",
            }}
          >
            <SwastikaSVG size={90} opacity={0.04} />
          </div>

          <div
            className="s-container shop-header"
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(180,83,9,0.45)",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              {activeCat === "All" ? "Complete Collection" : activeCat}
            </p>
            <h1
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: "clamp(24px,3.5vw,34px)",
                fontWeight: 700,
                color: "#44260a",
                margin: "0 0 8px",
                letterSpacing: "0.04em",
              }}
            >
              {activeCat === "All"
                ? "All Sacred Products"
                : `${activeCat} Collection`}
            </h1>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: 17,
                color: "#b08050",
                margin: "0 0 20px",
              }}
            >
              {activeCat === "All"
                ? "Explore our complete range of vedic & spiritual items"
                : `Explore our hand-selected ${activeCat.toLowerCase()} collection`}
            </p>
            <div className="gold-bar" style={{ marginBottom: 24 }} />

            {/* Search */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: "min(400px,90vw)" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(180,83,9,0.4)",
                    fontSize: 15,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 40px",
                    boxSizing: "border-box",
                    border: "1.5px solid rgba(180,83,9,0.18)",
                    borderRadius: 12,
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 13.5,
                    color: "#44260a",
                    background: "rgba(245,158,11,0.04)",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(180,83,9,0.18)")
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── PRODUCTS ── */}
        <div
          className="s-container"
          style={{ padding: "36px 24px 80px", position: "relative", zIndex: 1 }}
        >
          {/* decorations */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: -10,
              pointerEvents: "none",
            }}
          >
            <SwastikaSVG size={100} opacity={0.03} />
          </div>

          {/* Result count */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "rgba(180,83,9,0.5)",
                margin: 0,
              }}
            >
              {loading
                ? "Loading…"
                : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} found`}
            </p>
            {activeCat !== "All" && (
              <button
                onClick={() => setCat("All")}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(180,83,9,0.18)",
                  color: "rgba(180,83,9,0.6)",
                  padding: "5px 14px",
                  borderRadius: 8,
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 11,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(180,83,9,0.05)";
                  e.target.style.color = "#b45309";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "rgba(180,83,9,0.6)";
                }}
              >
                ✕ Clear filter
              </button>
            )}
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: 18,
                color: "rgba(180,83,9,0.4)",
              }}
            >
              Loading sacred items…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>
                🛍️
              </div>
              <p
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 17,
                  color: "rgba(180,83,9,0.5)",
                  marginBottom: 8,
                }}
              >
                No products found
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "rgba(180,83,9,0.3)",
                }}
              >
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
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          zIndex: 2,
                          background: "linear-gradient(135deg,#f59e0b,#d97706)",
                          color: "#fff8ee",
                          fontFamily: "'Cinzel',serif",
                          fontSize: 8,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          padding: "2px 8px",
                          borderRadius: 10,
                        }}
                      >
                        {d}% OFF
                      </div>
                    )}
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          background:
                            "linear-gradient(135deg,rgba(245,158,11,0.07),rgba(180,83,9,0.04))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 52,
                        }}
                      >
                        🛍️
                      </div>
                    )}
                    <div style={{ padding: "14px 14px 16px" }}>
                      <p
                        style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#44260a",
                          margin: "0 0 3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontStyle: "italic",
                          fontSize: 13,
                          color: "#b08050",
                          margin: "0 0 8px",
                        }}
                      >
                        {p.brand || p.category}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 3,
                          marginBottom: 8,
                        }}
                      >
                        {(p.features || []).slice(0, 2).map((f) => (
                          <span
                            key={f}
                            style={{
                              background: "rgba(245,158,11,0.1)",
                              color: "#b45309",
                              border: "1px solid rgba(245,158,11,0.2)",
                              borderRadius: 10,
                              padding: "2px 8px",
                              fontSize: 9,
                              fontWeight: 600,
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Cinzel',serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#b45309",
                          }}
                        >
                          ₹{p.price}
                        </span>
                        {d > 0 && (
                          <>
                            <span
                              style={{
                                fontSize: 12,
                                color: "rgba(180,83,9,0.4)",
                                textDecoration: "line-through",
                              }}
                            >
                              ₹{p.mrp}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: "#16a34a",
                                fontWeight: 700,
                              }}
                            >
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
    </>
  );
}
