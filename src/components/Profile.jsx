import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OmLogo } from "./Navbar";
import { db } from "./Firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

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

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  Processing: "bg-purple-100 text-purple-700 border-purple-200",
  Shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-600 border-red-200",
};

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
    role: "customer",
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
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
          navigate("/");
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
        } else {
          setUserInfo({
            name: parsed.name || "",
            email,
            contact: parsed.phone || "",
            address: "",
            role: "customer",
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

  useEffect(() => {
    if (!userInfo.email) return;
    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, "orders"), orderBy("createdAt", "desc")),
        );
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const mine = all
          .filter(
            (o) =>
              (o.customerEmail || "").toLowerCase() === userInfo.email ||
              (o.email || "").toLowerCase() === userInfo.email ||
              (o.address?.email || "").toLowerCase() === userInfo.email,
          )
          .slice(0, 4);
        setRecentOrders(mine);
      } catch (e) {
        console.error(e);
      }
      setOrdersLoading(false);
    };
    loadOrders();
  }, [userInfo.email]);

  const handleEdit = async () => {
    if (isEditing) {
      setSaving(true);
      const updated = {
        name: userInfo.name,
        email: userInfo.email,
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

  if (loading)
    return (
      <div className="min-h-screen bg-[#fdf8f0] flex flex-col items-center justify-center gap-5">
        <div style={{ animation: "float 4s ease-in-out infinite" }}>
          <OmLogo size={70} />
        </div>
        <p className="font-['Cormorant_Garamond',serif] italic text-[17px] text-amber-700/55">
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
    <div className="min-h-screen bg-[#fdf8f0] font-['DM_Sans',sans-serif] relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%,rgba(245,158,11,0.06) 0%,transparent 40%),radial-gradient(circle at 85% 85%,rgba(180,83,9,0.05) 0%,transparent 40%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pt-6 sm:pt-11 pb-20">
        <div className="bg-white border border-amber-700/10 rounded-2xl shadow-sm relative overflow-hidden p-4 sm:p-8 mb-4 sm:mb-5">
          <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
          <div className="absolute -top-7 -right-7 pointer-events-none">
            <div style={{ animation: "spin 30s linear infinite" }}>
              <MandalaRing size={150} opacity={0.07} />
            </div>
          </div>
          <div className="absolute top-2 right-2 pointer-events-none">
            <div style={{ animation: "spin 24s linear reverse infinite" }}>
              <MandalaRing size={80} opacity={0.05} />
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="relative shrink-0">
                <div
                  className="w-14 h-14 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-amber-800 font-['Cinzel',serif] text-[18px] sm:text-[22px] font-bold border-[3px] border-amber-400/30 shadow-[0_4px_20px_rgba(180,83,9,0.2)]"
                  style={{
                    background:
                      "linear-gradient(135deg,#fcd34d,#f59e0b,#d97706)",
                    animation: "pulse-ring 2.5s ease-out infinite",
                  }}
                >
                  {getInitials(userInfo.name)}
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex gap-1.5 flex-wrap mb-1">
                  <span className="inline-flex items-center gap-1 bg-linear-to-br from-amber-400/12 to-amber-600/7 border border-amber-700/20 text-amber-700 rounded-full px-2 sm:px-3 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase">
                    ✦ Vedic Member
                  </span>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 bg-linear-to-br from-indigo-400/12 to-indigo-600/7 border border-indigo-400/25 text-indigo-600 rounded-full px-2 sm:px-3 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase">
                      ⚡ Admin
                    </span>
                  )}
                </div>
                <h1 className="font-['Cinzel',serif] font-bold text-[16px] sm:text-[24px] text-[#44260a] m-0 mb-0.5 tracking-[0.03em]">
                  {userInfo.name || "My Account"}
                </h1>
                <p className="font-['Cormorant_Garamond',serif] italic text-[12px] sm:text-[15px] text-[#b08050] m-0 truncate max-w-50 sm:max-w-none">
                  {userInfo.email}
                </p>
              </div>
            </div>

            <div className="flex gap-5 sm:gap-10 justify-center sm:justify-start">
              {[
                {
                  label: "Orders",
                  value: recentOrders.length > 0 ? recentOrders.length : "0",
                  onClick: () => navigate("/orders"),
                },
                { label: "Wishlist", value: "2" },
                { label: "Karma", value: "108" },
              ].map(({ label, value, onClick }) => (
                <div
                  key={label}
                  className={`text-center ${onClick ? "cursor-pointer group" : ""}`}
                  onClick={onClick}
                >
                  <div
                    className="font-['Cinzel',serif] text-[18px] sm:text-[24px] font-bold leading-none"
                    style={{
                      background: "linear-gradient(135deg,#b45309,#f59e0b)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {value}
                  </div>
                  <div
                    className={`text-[9px] sm:text-[10px] text-amber-700/45 tracking-[0.12em] uppercase mt-0.5 font-medium ${onClick ? "group-hover:text-amber-700 transition-colors" : ""}`}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white border-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-[10px] font-['Cinzel',serif] text-[9px] sm:text-[10.5px] font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)] transition-all shadow-[0_4px_16px_rgba(99,102,241,0.3)] flex items-center gap-1.5"
                >
                  ⚡ Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-transparent text-red-700/65 border border-red-800/18 px-3 sm:px-4 py-1.5 rounded-lg font-['DM_Sans',sans-serif] text-[11px] sm:text-xs font-medium cursor-pointer hover:bg-red-800/5 hover:border-red-700/35 hover:text-red-700 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
          <div className="bg-white border border-amber-700/10 rounded-2xl shadow-sm relative overflow-hidden p-4 sm:p-7">
            <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
            <div className="text-[9px] sm:text-[10px] tracking-[0.22em] text-amber-700/45 uppercase font-semibold mb-3">
              Personal Info
            </div>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="font-['Cinzel',serif] text-[13px] sm:text-[16px] font-semibold text-[#44260a] m-0">
                Your Details
              </h2>
              <button
                onClick={handleEdit}
                disabled={saving}
                className={`bg-transparent text-amber-700 border border-amber-700/25 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-['DM_Sans',sans-serif] text-[11px] sm:text-xs font-medium cursor-pointer hover:bg-amber-700/6 hover:border-amber-700/40 transition-all ${saving ? "opacity-50" : ""}`}
              >
                {saving ? "Saving…" : isEditing ? "✓ Save" : "Edit"}
              </button>
            </div>
            {fields.map(({ label, key, type }) => (
              <div
                key={key}
                className="flex items-start sm:items-center justify-between py-2 sm:py-3 border-b border-amber-700/6 last:border-0 gap-2"
              >
                <span className="text-[10px] sm:text-[11px] text-amber-700/50 tracking-widest uppercase font-semibold w-14 sm:w-17 shrink-0">
                  {label}
                </span>
                {isEditing && type !== "static" ? (
                  type === "textarea" ? (
                    <textarea
                      className="flex-1 box-border bg-[rgba(245,158,11,0.05)] border border-amber-700/20 rounded-xl px-2.5 py-2 text-[12px] sm:text-[13.5px] text-amber-900 outline-none focus:border-amber-400 resize-y min-h-15 transition-all"
                      value={userInfo[key]}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, [key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      className="flex-1 box-border bg-[rgba(245,158,11,0.05)] border border-amber-700/20 rounded-xl px-2.5 py-2 text-[12px] sm:text-[13.5px] text-amber-900 outline-none focus:border-amber-400 transition-all"
                      value={userInfo[key]}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, [key]: e.target.value })
                      }
                    />
                  )
                ) : (
                  <span
                    className={`text-[12px] sm:text-[13.5px] text-right flex-1 truncate ${userInfo[key] ? "text-[#44260a]" : "text-amber-700/25"}`}
                  >
                    {userInfo[key] || "Not set"}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white border border-amber-700/10 rounded-2xl shadow-sm relative overflow-hidden p-4 sm:p-7 flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div>
                <div className="text-[9px] sm:text-[10px] tracking-[0.22em] text-amber-700/45 uppercase font-semibold mb-1">
                  Order History
                </div>
                <h2 className="font-['Cinzel',serif] text-[13px] sm:text-[16px] font-semibold text-[#44260a] m-0">
                  Your Orders
                </h2>
              </div>
              {recentOrders.length > 0 && (
                <button
                  onClick={() => navigate("/orders")}
                  className="text-[10px] sm:text-[11px] font-semibold text-amber-700 border border-amber-700/20 bg-transparent px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg cursor-pointer hover:bg-amber-50 transition-all font-['DM_Sans',sans-serif]"
                >
                  See All →
                </button>
              )}
            </div>

            {ordersLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-400/8 border border-dashed border-amber-700/20 flex items-center justify-center text-[22px] sm:text-[28px]">
                  🛒
                </div>
                <p className="font-['Cormorant_Garamond',serif] italic text-amber-700/45 text-[14px] sm:text-[16px] text-center leading-normal m-0">
                  Your sacred shopping
                  <br />
                  journey begins here.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-1 bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 border-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-[10px] font-['Cinzel',serif] text-[9px] sm:text-[10.5px] font-semibold tracking-[0.12em] uppercase cursor-pointer hover:opacity-90 hover:-translate-y-px transition-all shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div
                className="flex-1 overflow-x-auto flex gap-2 sm:gap-3 pb-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(180,83,9,0.2) transparent",
                }}
              >
                {recentOrders.map((o, i) => {
                  const sc =
                    statusColor[o.status] ||
                    "bg-gray-100 text-gray-600 border-gray-200";
                  const img = o.productImage || o.items?.[0]?.image || "";
                  const name =
                    o.productName || o.items?.[0]?.productName || "Order";
                  const date =
                    o.createdAt
                      ?.toDate?.()
                      ?.toLocaleDateString?.("en-IN", {
                        day: "numeric",
                        month: "short",
                      }) || "";
                  return (
                    <div
                      key={o.id}
                      onClick={() => navigate("/orders")}
                      className="shrink-0 w-32 sm:w-42 bg-[#fdf8f0] border border-amber-700/10 rounded-xl p-2 sm:p-3 cursor-pointer hover:border-amber-700/22 hover:shadow-[0_4px_16px_rgba(120,53,15,0.1)] transition-all"
                      style={{
                        animation: `slideInRight 0.4s ease ${i * 0.08}s both`,
                      }}
                    >
                      <div className="w-full h-16 sm:h-20 rounded-lg overflow-hidden bg-amber-50 flex items-center justify-center mb-2 border border-amber-700/8">
                        {img ? (
                          <img
                            src={img}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl sm:text-2xl">🛍️</span>
                        )}
                      </div>
                      <p className="font-['Cinzel',serif] text-[10px] sm:text-[11px] font-semibold text-[#44260a] truncate mb-1">
                        {name}
                      </p>
                      <p className="font-['Cinzel',serif] text-[11px] sm:text-[12px] font-bold text-amber-700 mb-1.5">
                        ₹{o.total || o.grandTotal || 0}
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold border ${sc}`}
                        >
                          {o.status}
                        </span>
                        {date && (
                          <span className="text-[9px] sm:text-[10px] text-amber-700/40">
                            {date}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div
                  onClick={() => navigate("/orders")}
                  className="shrink-0 w-20 sm:w-25 bg-linear-to-br from-amber-50 to-amber-100/60 border border-amber-700/15 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400/40 hover:shadow-[0_4px_16px_rgba(245,158,11,0.15)] transition-all p-2 sm:p-3"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-400/15 flex items-center justify-center text-amber-700 text-base sm:text-lg">
                    →
                  </div>
                  <p className="font-['Cinzel',serif] text-[9px] sm:text-[10px] font-semibold text-amber-700 text-center leading-tight">
                    View All
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-amber-700/10 rounded-2xl shadow-sm relative overflow-hidden p-4 sm:p-7">
          <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
          <div className="absolute -top-5 -left-5 pointer-events-none opacity-[0.04]">
            <div style={{ animation: "spin 30s linear infinite" }}>
              <MandalaRing size={100} opacity={1} />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <div>
              <div className="text-[9px] sm:text-[10px] tracking-[0.22em] text-amber-700/45 uppercase font-semibold mb-1">
                Curated For You
              </div>
              <h2 className="font-['Cinzel',serif] text-[14px] sm:text-[17px] font-semibold text-[#44260a] m-0">
                Inspired by Your Journey
              </h2>
            </div>
            <span className="font-['Cormorant_Garamond',serif] italic text-[11px] sm:text-[13px] text-amber-700/40">
              Vedic selections
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="sm:shrink-0 sm:w-65 w-full">
              <div
                key={featuredKey}
                className="relative rounded-2xl overflow-hidden cursor-pointer w-full border"
                style={{
                  background: featured.color,
                  borderColor: featured.accent + "22",
                  animation: "featuredIn 0.5s ease",
                  height: "220px",
                }}
              >
                <span className="absolute top-3 left-3 bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 font-['Cinzel',serif] text-[8px] font-bold tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-xl">
                  ✦ Featured
                </span>
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 py-5">
                  <div className="relative flex items-center justify-center">
                    <div
                      className="absolute opacity-15"
                      style={{ animation: "spin 30s linear infinite" }}
                    >
                      <MandalaRing size={90} opacity={1} />
                    </div>
                    <div
                      className="text-[44px] sm:text-[56px] relative z-10"
                      style={{
                        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))",
                      }}
                    >
                      {featured.icon}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-['Cinzel',serif] text-[13px] sm:text-[15px] font-semibold text-[#44260a] mb-0.5">
                      {featured.name}
                    </p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[11px] sm:text-[13px] text-amber-700/60 mb-1">
                      {featured.sub}
                    </p>
                    <p className="text-[11px] sm:text-xs text-amber-900 leading-normal opacity-75 px-2">
                      {featured.desc}
                    </p>
                  </div>
                  <div
                    className="text-white text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full font-['DM_Sans',sans-serif]"
                    style={{
                      background: featured.accent,
                      boxShadow: `0 4px 12px ${featured.accent}44`,
                    }}
                  >
                    View Product →
                  </div>
                </div>
              </div>
              <div className="h-0.5 bg-amber-700/10 rounded overflow-hidden mt-2 sm:mt-3">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded"
                  style={{
                    width: `${progress}%`,
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
              <div className="flex justify-center gap-1.5 mt-2">
                {carouselProducts.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => goTo(i)}
                    className="cursor-pointer rounded-sm transition-all"
                    style={{
                      width: i === featuredIdx ? 18 : 7,
                      height: 7,
                      borderRadius: i === featuredIdx ? 3 : "50%",
                      background:
                        i === featuredIdx ? "#f59e0b" : "rgba(180,83,9,0.2)",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-3 content-start">
              {carouselProducts.map((p, i) => {
                const active = i === featuredIdx;
                return (
                  <div
                    key={p.name}
                    onClick={() => goTo(i)}
                    className="rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1.5 py-3 px-1 sm:py-4 sm:px-2 border-[1.5px] transition-all"
                    style={{
                      background: active ? p.color : "#fdf8f0",
                      borderColor: active ? p.accent : "rgba(180,83,9,0.1)",
                      boxShadow: active
                        ? `0 0 0 2px rgba(245,158,11,0.18)`
                        : "none",
                    }}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className="absolute"
                        style={{
                          opacity: active ? 0.2 : 0.08,
                          animation: "spin 30s linear infinite",
                        }}
                      >
                        <MandalaRing size={40} opacity={1} />
                      </div>
                      <div className="text-[20px] sm:text-[26px] relative z-10">
                        {p.icon}
                      </div>
                    </div>
                    <div className="text-center">
                      <p
                        className={`font-['Cinzel',serif] text-[9px] sm:text-[11px] font-semibold leading-[1.3] ${active ? "text-[#44260a]" : "text-amber-900"}`}
                      >
                        {p.name}
                      </p>
                      <p
                        className="font-['Cormorant_Garamond',serif] italic text-[9px] sm:text-[11px] mt-0.5"
                        style={{
                          color: active ? p.accent : "rgba(180,83,9,0.45)",
                        }}
                      >
                        {p.sub}
                      </p>
                    </div>
                    {active && (
                      <div
                        className="w-5 h-0.5 rounded"
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

        <div className="mt-10 sm:mt-13 text-center">
          <div
            className="inline-block"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <OmLogo size={44} />
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-amber-700/35 mt-2.5 text-[13px] tracking-[0.18em]">
            Pure • Energised • Lab Certified
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
        @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(180,83,9,0.3)}70%{box-shadow:0 0 0 12px rgba(180,83,9,0)}100%{box-shadow:0 0 0 0 rgba(180,83,9,0)} }
        @keyframes featuredIn { from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}
