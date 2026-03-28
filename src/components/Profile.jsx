import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OmLogo } from "./Navbar";
import { db } from "./Firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const ADMIN_EMAIL = "diviyavedic@gmail.com";

const MandalaRing = ({ size = 120, opacity = 0.06 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    style={{ opacity }}
  >
    <circle
      cx="60"
      cy="60"
      r="58"
      stroke="#b45309"
      strokeWidth="0.8"
      strokeDasharray="4 3"
    />
    <circle
      cx="60"
      cy="60"
      r="46"
      stroke="#f59e0b"
      strokeWidth="0.6"
      strokeDasharray="2 4"
    />
    <circle cx="60" cy="60" r="34" stroke="#b45309" strokeWidth="0.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <circle
        key={i}
        cx={60 + 46 * Math.cos(((deg - 90) * Math.PI) / 180)}
        cy={60 + 46 * Math.sin(((deg - 90) * Math.PI) / 180)}
        r="3"
        fill="#f59e0b"
      />
    ))}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
      <line
        key={i}
        x1={60 + 20 * Math.cos(((deg - 90) * Math.PI) / 180)}
        y1={60 + 20 * Math.sin(((deg - 90) * Math.PI) / 180)}
        x2={60 + 55 * Math.cos(((deg - 90) * Math.PI) / 180)}
        y2={60 + 55 * Math.sin(((deg - 90) * Math.PI) / 180)}
        stroke="#b45309"
        strokeWidth="0.5"
      />
    ))}
  </svg>
);

const carouselProducts = [
  {
    icon: "📿",
    name: "Rudraksha Mala",
    sub: "5 Mukhi · Protection",
    color: "#fdf3e3",
    accent: "#d97706",
    desc: "Sacred beads for spiritual protection & clarity of mind.",
  },
  {
    icon: "💎",
    name: "Blue Sapphire",
    sub: "Natural · Saturn",
    color: "#eef2ff",
    accent: "#4f46e5",
    desc: "Powerful Saturn gem for discipline, focus & fortune.",
  },
  {
    icon: "🔱",
    name: "Shree Yantra",
    sub: "Energised · Brass",
    color: "#fefce8",
    accent: "#ca8a04",
    desc: "Sacred geometry for abundance & divine blessings.",
  },
  {
    icon: "🪬",
    name: "Evil Eye Bracelet",
    sub: "Handcrafted · Silver",
    color: "#f0fdf4",
    accent: "#16a34a",
    desc: "Ward off negativity with this protective talisman.",
  },
  {
    icon: "🟡",
    name: "Yellow Sapphire",
    sub: "Natural · Jupiter",
    color: "#fffbeb",
    accent: "#d97706",
    desc: "Jupiter's gem for wisdom, wealth & prosperity.",
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
  });
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [featuredKey, setFeaturedKey] = useState(0);
  const progressRef = useRef(null);
  const INTERVAL = 5000;

  const isAdmin = userInfo.role === "admin";

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const tick = () => {
      const pct = Math.min(((Date.now() - start) / INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) progressRef.current = requestAnimationFrame(tick);
    };
    progressRef.current = requestAnimationFrame(tick);
    const timer = setInterval(() => {
      setFeaturedIdx((p) => (p + 1) % carouselProducts.length);
      setFeaturedKey((k) => k + 1);
    }, INTERVAL);
    return () => {
      clearInterval(timer);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [featuredIdx]);

  const goTo = (i) => {
    setFeaturedIdx(i);
    setFeaturedKey((k) => k + 1);
    setProgress(0);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
  };

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/");
      return;
    }
    const loadUser = async () => {
      try {
        const saved = localStorage.getItem("user");
        if (!saved) {
          navigate("/login");
          return;
        }
        const parsed = JSON.parse(saved);
        const email = parsed.email.toLowerCase();
        const snap = await getDoc(doc(db, "users", email));
        if (snap.exists()) {
          const d = snap.data();
          setUserInfo({
            name: d.name || "",
            email,
            contact: d.phone || "",
            address: d.address || "",
            role: d.role || "customer",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  const handleEdit = async () => {
    if (isEditing) {
      setSaving(true);
      const updated = {
        name: userInfo.name,
        email: userInfo.email.toLowerCase(),
        phone: userInfo.contact,
        address: userInfo.address,
        role: userInfo.role,
      };
      try {
        await setDoc(doc(db, "users", userInfo.email), updated, {
          merge: true,
        });
        localStorage.setItem("user", JSON.stringify(updated));
      } catch {
        alert("Failed to save.");
      }
      setSaving(false);
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /* ── Loading ── */
  if (loading)
    return (
      <div className="min-h-screen bg-[#fdf8f0] flex flex-col items-center justify-center gap-5">
        <div className="animate-float">
          <OmLogo size={70} />
        </div>
        <p className="font-cormorant italic text-[17px] text-amber-700/55">
          Loading your sacred profile…
        </p>
      </div>
    );

  const featured = carouselProducts[featuredIdx];
  const fields = [
    { label: "Name", key: "name", type: "input" },
    { label: "Email", key: "email", type: "static" },
    { label: "Phone", key: "contact", type: "input" },
    { label: "Address", key: "address", type: "textarea" },
  ];

  return (
    <div className="profile-page min-h-screen bg-[#fdf8f0] font-dm relative overflow-x-hidden">
      {/* bg pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%,rgba(245,158,11,0.06) 0%,transparent 40%),radial-gradient(circle at 85% 85%,rgba(180,83,9,0.05) 0%,transparent 40%)",
        }}
      />

      <div className="relative z-10 max-w-270 mx-auto px-6 pt-11 pb-20">
        {/* ── HERO CARD ── */}
        <div className="light-card gold-top-bar-3 p-8 mb-5 animate-fade-up animate-delay-1">
          <div className="absolute -top-7.5 -right-7.5 z-0">
            <div className="animate-spin-slow-30">
              <MandalaRing size={150} opacity={0.07} />
            </div>
          </div>
          <div className="absolute top-2.5 right-2.5 z-0">
            <div className="animate-spin-reverse">
              <MandalaRing size={80} opacity={0.05} />
            </div>
          </div>

          <div className="hero-inner flex items-center justify-between flex-wrap gap-5 relative z-10">
            {/* Avatar + name */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div
                  className="animate-pulse-ring w-18 h-18 rounded-full flex items-center justify-center text-amber-800 font-cinzel text-[22px] font-bold border-3 border-amber-400/30 shadow-[0_4px_20px_rgba(180,83,9,0.2)]"
                  style={{
                    background:
                      "linear-gradient(135deg,#fcd34d,#f59e0b,#d97706)",
                  }}
                >
                  {getInitials(userInfo.name)}
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-3,25 h-3.25 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex gap-2 flex-wrap mb-1.5">
                  <span className="gold-badge">✦ Vedic Member</span>
                  {isAdmin && <span className="admin-badge">⚡ Admin</span>}
                </div>
                <h1 className="font-cinzel font-bold text-[24px] text-[#44260a] m-0 mb-0.5 tracking-[0.03em]">
                  {userInfo.name || "My Account"}
                </h1>
                <p className="font-cormorant italic text-[15px] text-[#b08050] m-0">
                  {userInfo.email}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-row flex gap-10">
              {[
                { label: "Orders", value: "0" },
                { label: "Wishlist", value: "2" },
                { label: "Karma Pts", value: "108" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-gold-gradient font-cinzel text-[24px] font-bold leading-none">
                    {value}
                  </div>
                  <div className="text-[10px] text-amber-700/45 tracking-[0.12em] uppercase mt-0.5 font-medium">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 flex-wrap">
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white border-none px-5 py-2.5 rounded-[10px] font-cinzel text-[10.5px] font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] transition-all shadow-[0_4px_16px_rgba(99,102,241,0.3)] flex items-center gap-2"
                >
                  ⚡ Admin Dashboard
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-transparent text-red-700/65 border border-red-800/18 px-4 py-1.5 rounded-lg font-dm text-xs font-medium cursor-pointer hover:bg-red-800/5 hover:border-red-700/35 hover:text-red-700 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ── TWO COL ── */}
        <div className="two-col-grid grid grid-cols-2 gap-5 mb-5">
          {/* Personal info */}
          <div className="light-card gold-top-bar-3 p-7 animate-fade-up animate-delay-2">
            <div className="absolute bottom-4 right-4 opacity-4">
              {/* swastika placeholder */}
            </div>
            <div className="eyebrow-line mb-4">Personal Info</div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-cinzel text-[16px] font-semibold text-[#44260a] m-0">
                Your Details
              </h2>
              <button
                onClick={handleEdit}
                disabled={saving}
                className={`bg-transparent text-amber-700 border border-amber-700/25 px-4 py-1.5 rounded-lg font-dm text-xs font-medium cursor-pointer hover:bg-amber-700/6 hover:border-amber-700/40 transition-all ${saving ? "opacity-50" : ""}`}
              >
                {saving ? "Saving…" : isEditing ? "✓ Save" : "Edit"}
              </button>
            </div>
            {fields.map(({ label, key, type }) => (
              <div
                key={key}
                className="flex items-center justify-between py-3 border-b border-amber-700/6 last:border-0"
              >
                <span className="text-[11px] text-amber-700/50 tracking-widest uppercase font-semibold w-17 shrink-0">
                  {label}
                </span>
                {isEditing && type !== "static" ? (
                  type === "textarea" ? (
                    <textarea
                      className="form-input-light field-textarea resize-y h-15"
                      value={userInfo[key]}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, [key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      className="form-input-light"
                      value={userInfo[key]}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, [key]: e.target.value })
                      }
                    />
                  )
                ) : (
                  <span
                    className={`text-[13.5px] text-right flex-1 ${userInfo[key] ? "text-[#44260a]" : "text-amber-700/25"}`}
                  >
                    {userInfo[key] || "Not set"}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Orders */}
          <div className="light-card gold-top-bar-3 p-7 flex flex-col animate-fade-up animate-delay-3">
            <div className="absolute top-4 right-4 opacity-5">
              <MandalaRing size={80} opacity={1} />
            </div>
            <div className="eyebrow-line mb-4">Order History</div>
            <h2 className="font-cinzel text-[16px] font-semibold text-[#44260a] mb-4">
              Your Orders
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
              <div className="w-16 h-16 rounded-full bg-amber-400/8 border border-dashed border-amber-700/20 flex items-center justify-center text-[28px]">
                🛒
              </div>
              <p className="font-cormorant italic text-amber-700/45 text-[16px] text-center leading-normal m-0">
                Your sacred shopping
                <br />
                journey begins here.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-1 bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 border-none px-6 py-2.5 rounded-[10px] font-cinzel text-[10.5px] font-semibold tracking-[0.12em] uppercase cursor-pointer hover:opacity-90 hover:-translate-y-px transition-all shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
              >
                Explore Products
              </button>
            </div>
          </div>
        </div>

        {/* ── CURATED ── */}
        <div className="light-card gold-top-bar-3 p-7 animate-fade-up animate-delay-4">
          <div className="absolute -top-5 -left-5 opacity-4">
            <div className="animate-spin-slow-30">
              <MandalaRing size={100} opacity={1} />
            </div>
          </div>
          <div className="eyebrow-line mb-4">Curated For You</div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-cinzel text-[17px] font-semibold text-[#44260a] m-0">
              Inspired by Your Journey
            </h2>
            <span className="font-cormorant italic text-[13px] text-amber-700/40">
              Vedic selections
            </span>
          </div>

          <div className="curated-layout flex gap-4 items-stretch">
            {/* Featured card */}
            <div className="shrink-0 w-65">
              <div
                key={featuredKey}
                className="relative rounded-2xl overflow-hidden cursor-pointer animate-featured-in w-full h-70 border"
                style={{
                  background: featured.color,
                  borderColor: featured.accent + "22",
                }}
              >
                <span className="absolute top-3 left-3 bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 font-cinzel text-[8px] font-bold tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-xl">
                  ✦ Featured
                </span>
                <div className="w-full h-full flex flex-col items-center justify-center gap-3.5 px-5 py-7">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute animate-spin-slow-30 opacity-15">
                      <MandalaRing size={110} opacity={1} />
                    </div>
                    <div
                      className="text-[56px] relative z-10"
                      style={{
                        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))",
                      }}
                    >
                      {featured.icon}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-cinzel text-[15px] font-semibold text-[#44260a] mb-1">
                      {featured.name}
                    </p>
                    <p className="font-cormorant italic text-[13px] text-amber-700/60 mb-2">
                      {featured.sub}
                    </p>
                    <p className="text-xs text-amber-900 leading-normal opacity-75 px-2.5">
                      {featured.desc}
                    </p>
                  </div>
                  <div
                    className="text-white text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full font-dm"
                    style={{
                      background: featured.accent,
                      boxShadow: `0 4px 12px ${featured.accent}44`,
                    }}
                  >
                    View Product →
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-0.5 bg-amber-700/10 rounded overflow-hidden mt-3">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded transition-[width_0.1s_linear]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-2.5">
                {carouselProducts.map((_, i) => (
                  <div
                    key={i}
                    className={`carousel-dot ${i === featuredIdx ? "active" : ""}`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            </div>

            {/* Tile grid */}
            <div className="flex-1 grid grid-cols-2 gap-3 content-start">
              {carouselProducts.map((p, i) => {
                const active = i === featuredIdx;
                return (
                  <div
                    key={p.name}
                    className={`small-tile ${active ? "active-tile" : ""}`}
                    style={{ background: active ? p.color : "#fdf8f0" }}
                    onClick={() => goTo(i)}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`absolute animate-spin-slow-30 ${active ? "opacity-20" : "opacity-8"}`}
                      >
                        <MandalaRing size={50} opacity={1} />
                      </div>
                      <div className="text-[26px] relative z-10">{p.icon}</div>
                    </div>
                    <div className="text-center">
                      <p
                        className={`font-cinzel text-[11px] font-semibold leading-[1.3] ${active ? "text-[#44260a]" : "text-amber-900"}`}
                      >
                        {p.name}
                      </p>
                      <p
                        className={`font-cormorant italic text-[11px] mt-0.5 ${active ? "" : "text-amber-700/45"}`}
                        style={{ color: active ? p.accent : undefined }}
                      >
                        {p.sub}
                      </p>
                    </div>
                    {active && (
                      <div
                        className="w-6 h-0.5 rounded mt-0.5"
                        style={{
                          background: `linear-gradient(90deg,${p.accent},#fcd34d)`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-13 text-center">
          <div className="inline-block animate-float">
            <OmLogo size={44} />
          </div>
          <p className="font-cormorant italic text-amber-700/35 mt-2.5 text-[13px] tracking-[0.18em]">
            Pure • Energised • Lab Certified
          </p>
        </div>
      </div>
    </div>
  );
}
