import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./Firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const generateOrderId = async () => {
  try {
    const snap = await getDocs(collection(db, "orders"));
    const count = snap.size + 1;
    return `DVS2026${String(count).padStart(4, "0")}`;
  } catch {
    return `DVS2026${String(Math.floor(1000 + Math.random() * 9000))}`;
  }
};

const ORBIT_DOTS = [0, 60, 120, 180, 240, 300];
const OmSeal = () => (
  <div
    className="relative flex items-center justify-center"
    style={{ width: 72, height: 72 }}
  >
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background:
          "radial-gradient(circle,rgba(251,191,36,0.18) 0%,transparent 70%)",
      }}
    />
    {ORBIT_DOTS.map((deg, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-amber-300"
        style={{
          width: 3,
          height: 3,
          opacity: 0.5,
          top: `${50 - 44 * Math.cos((deg * Math.PI) / 180)}%`,
          left: `${50 + 44 * Math.sin((deg * Math.PI) / 180)}%`,
          transform: "translate(-50%,-50%)",
        }}
      />
    ))}
    <div
      className="absolute rounded-full border border-amber-300/30"
      style={{ inset: 4 }}
    />
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: 42,
        height: 42,
        position: "relative",
        zIndex: 2,
        filter: "drop-shadow(0 0 10px rgba(251,191,36,0.7))",
      }}
    >
      <defs>
        <linearGradient id="omBuyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="35%" stopColor="#fcd34d" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <text
        x="100"
        y="140"
        textAnchor="middle"
        fontSize="112"
        fontFamily="serif"
        fill="url(#omBuyGold)"
      >
        ॐ
      </text>
      <circle cx="100" cy="158" r="3" fill="#fcd34d" opacity="0.85" />
      <line
        x1="68"
        y1="165"
        x2="132"
        y2="165"
        stroke="url(#omBuyGold)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  </div>
);

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

const inputCls =
  "w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm outline-none transition-all bg-white border border-amber-700/20 text-amber-900 placeholder:text-amber-700/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10";
const selectCls =
  "w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm outline-none transition-all bg-white border border-amber-700/20 text-amber-900 appearance-none cursor-pointer focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10";
const labelCls =
  "text-[10px] uppercase tracking-widest text-amber-700/50 font-semibold mb-1 block";

const EMPTY_ADDR = {
  name: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: STATES[0],
  pincode: "",
};

const StepDots = ({ step }) => (
  <div className="ml-auto flex items-center gap-1.5">
    {[1, 2, 3].map((s) => (
      <div key={s} className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-['Cinzel',serif] transition-all"
          style={{
            background:
              step >= s
                ? "linear-gradient(135deg,#f59e0b,#b45309)"
                : "rgba(180,83,9,0.08)",
            color: step >= s ? "#fff" : "rgba(180,83,9,0.35)",
          }}
        >
          {s}
        </div>
        {s < 3 && (
          <div
            className="w-5 h-px"
            style={{ background: step > s ? "#f59e0b" : "rgba(180,83,9,0.15)" }}
          />
        )}
      </div>
    ))}
  </div>
);

const GoldBtn = ({ children, disabled, onClick, className = "" }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`w-full py-3.5 rounded-xl font-['Cinzel',serif] text-[10px] font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5 border-none flex items-center justify-center gap-2 ${className}`}
    style={{
      background: disabled
        ? "rgba(180,83,9,0.08)"
        : "linear-gradient(135deg,#f59e0b,#b45309)",
      color: disabled ? "rgba(180,83,9,0.3)" : "#fff",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 4px 20px rgba(245,158,11,0.3)",
    }}
  >
    {children}
  </button>
);

function OrderModal({ product, qty, onClose }) {
  const [step, setStep] = useState(1);
  const [payMode, setPayMode] = useState(null);
  const [addr, setAddr] = useState(EMPTY_ADDR);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const overlayRef = useRef();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user") || "{}");
    if (saved.name || saved.phone || saved.email) {
      setAddr((p) => ({
        ...p,
        name: saved.name || "",
        phone: saved.phone || "",
        email: saved.email || "",
      }));
    }
  }, []);

  const total = product.price * qty;
  const deliveryFee = Number(product.deliveryFee) || 0;
  const grandTotal = total + deliveryFee;
  const set = (k, v) => setAddr((p) => ({ ...p, [k]: v }));

  const canStep1 = payMode !== null;
  const canStep2 =
    addr.name &&
    addr.phone &&
    addr.email &&
    addr.line1 &&
    addr.city &&
    addr.pincode;

  const placeOrder = async () => {
    if (!payMode) return;
    setPlacing(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const newOrderId = await generateOrderId();

      const orderData = {
        orderId: newOrderId,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || "",
        category: product.category || "",
        price: product.price,
        qty,
        items: [
          {
            productId: product.id,
            productName: product.name,
            image: product.images?.[0] || "",
            price: product.price,
            qty,
            subtotal: total,
          },
        ],
        deliveryFee,
        total: grandTotal,
        grandTotal,
        paymentMode: payMode,
        paymentStatus: payMode === "cod" ? "Pending" : "Paid",
        status: "Pending",
        address: addr,
        customerEmail: user.email || addr.email,
        customerName: user.name || addr.name,
        email: user.email || addr.email,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "orders", newOrderId), orderData);

      const BOT_TOKEN = "8669188610:AAGwDmjidJ43Nn0GlNR5AWSMTxYfhv5SsBw";
      const CHAT_ID = "6261841518";

      const telegramMsg = `
<b>🚀 NEW ORDER: ${newOrderId}</b>
---------------------------
<b>📦 Product:</b> ${product.name}
<b>🔢 Qty:</b> ${qty}
<b>💰 Total:</b> ₹${grandTotal}
<b>💳 Payment:</b> ${payMode.toUpperCase()}

<b>👤 Customer:</b> ${orderData.customerName}
<b>📞 Phone:</b> ${addr.phone}
<b>📧 Email:</b> ${orderData.email}

<b>📍 Address:</b>
${addr.line1}${addr.line2 ? ", " + addr.line2 : ""},
${addr.city}, ${addr.state} - ${addr.pincode}
---------------------------
      `;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramMsg,
          parse_mode: "HTML",
        }),
      });

      setOrderId(newOrderId);
      setStep(4);
    } catch (e) {
      console.error(e);
      alert("Order failed. Please try again.");
    }
    setPlacing(false);
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(10,7,4,0.72)", backdropFilter: "blur(6px)" }}
    >
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.94) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}} @keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}} .check-pop{animation:checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both}`}</style>

      <div
        className="bg-[#fffbf2] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] w-full max-w-lg max-h-[94vh] overflow-y-auto relative"
        style={{
          animation: "modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{
            background: "linear-gradient(90deg,#f59e0b,#fcd34d,#f59e0b)",
          }}
        />

        {step < 4 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-amber-700/40 hover:text-amber-700 hover:bg-amber-400/10 transition-all text-lg cursor-pointer border-none bg-transparent"
          >
            ✕
          </button>
        )}

        <div className="p-5 sm:p-7 pb-3">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <OmSeal />
            <div>
              <p className="font-['Cinzel',serif] text-[15px] sm:text-[17px] font-semibold text-[#44260a] tracking-wide">
                Diviya Vedic Shop
              </p>
              <p className="font-['Cormorant_Garamond',serif] italic text-[12px] sm:text-[13px] text-[#b08050] tracking-wide">
                Secure Sacred Order
              </p>
            </div>
            {step < 4 && <StepDots step={step} />}
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-2xl mb-5 sm:mb-6 border border-amber-700/10"
            style={{ background: "rgba(251,191,36,0.04)" }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-amber-700/12 shrink-0">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-amber-400/10 flex items-center justify-center text-2xl">
                  🛍️
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-['Cinzel',serif] text-[12px] sm:text-[13px] font-semibold text-[#44260a] truncate">
                {product.name}
              </p>
              <p className="font-['Cormorant_Garamond',serif] italic text-[11px] sm:text-[12px] text-[#b08050]">
                {product.brand || product.category}
              </p>
              <p className="font-['Cinzel',serif] text-[10px] sm:text-[11px] text-amber-700/50 mt-0.5">
                Qty: {qty}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-['Cinzel',serif] text-[14px] sm:text-[16px] font-bold text-[#b45309]">
                ₹{grandTotal}
              </p>
              {deliveryFee > 0 ? (
                <p className="font-['Cormorant_Garamond',serif] italic text-[10px] sm:text-[11px] text-amber-700/40">
                  incl. ₹{deliveryFee} delivery
                </p>
              ) : (
                <p className="font-['Cormorant_Garamond',serif] italic text-[10px] sm:text-[11px] text-green-600">
                  Free delivery
                </p>
              )}
            </div>
          </div>

          {step === 1 && (
            <div>
              <p className="font-['Cinzel',serif] text-[11px] tracking-widest text-amber-700/45 uppercase mb-4">
                Select Payment Method
              </p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  {
                    id: "online",
                    icon: "💳",
                    title: "Pay Online",
                    sub: "UPI · Cards · Net Banking · Wallets",
                    badge: "Instant Confirmation",
                    bc: "#16a34a",
                  },
                  {
                    id: "cod",
                    icon: "📦",
                    title: "Cash on Delivery",
                    sub: "Pay when your order arrives",
                    badge: "No Prepayment",
                    bc: "#b45309",
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setPayMode(opt.id)}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all"
                    style={{
                      borderColor:
                        payMode === opt.id ? "#f59e0b" : "rgba(180,83,9,0.12)",
                      background:
                        payMode === opt.id ? "rgba(251,191,36,0.06)" : "#fff",
                      boxShadow:
                        payMode === opt.id
                          ? "0 0 0 3px rgba(245,158,11,0.12)"
                          : "none",
                    }}
                  >
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
                      style={{
                        background:
                          payMode === opt.id
                            ? "rgba(251,191,36,0.12)"
                            : "rgba(180,83,9,0.05)",
                      }}
                    >
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-['Cinzel',serif] text-[12px] sm:text-[13px] font-semibold text-[#44260a]">
                        {opt.title}
                      </p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[11px] sm:text-[12px] text-[#b08050]">
                        {opt.sub}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor:
                            payMode === opt.id
                              ? "#f59e0b"
                              : "rgba(180,83,9,0.2)",
                        }}
                      >
                        {payMode === opt.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 font-['Cinzel',serif] text-[8px] tracking-widest"
                        style={{
                          color: opt.bc,
                          background: `${opt.bc}14`,
                          border: `1px solid ${opt.bc}30`,
                        }}
                      >
                        {opt.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {payMode === "online" && (
                <div
                  className="flex items-start gap-2.5 p-3 rounded-xl mb-4 border border-amber-400/20"
                  style={{ background: "rgba(251,191,36,0.04)" }}
                >
                  <span className="text-base mt-0.5">ℹ️</span>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[12px] sm:text-[13px] text-[#b08050] leading-relaxed">
                    You will be redirected to our secure payment gateway after
                    filling your address.
                  </p>
                </div>
              )}
              <GoldBtn disabled={!canStep1} onClick={() => setStep(2)}>
                Continue →
              </GoldBtn>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="font-['Cinzel',serif] text-[11px] tracking-widest text-amber-700/45 uppercase mb-4">
                Delivery Address
              </p>
              <div className="flex flex-col gap-3 sm:gap-4 mb-6">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      className={inputCls}
                      placeholder="Rahul Sharma"
                      value={addr.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone *</label>
                    <input
                      className={inputCls}
                      placeholder="+91 98765 43210"
                      value={addr.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="you@email.com"
                    value={addr.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Address Line 1 *</label>
                  <input
                    className={inputCls}
                    placeholder="House No., Street, Area"
                    value={addr.line1}
                    onChange={(e) => set("line1", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Address Line 2</label>
                  <input
                    className={inputCls}
                    placeholder="Landmark (optional)"
                    value={addr.line2}
                    onChange={(e) => set("line2", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className={labelCls}>City *</label>
                    <input
                      className={inputCls}
                      placeholder="City"
                      value={addr.city}
                      onChange={(e) => set("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <select
                      className={selectCls}
                      value={addr.state}
                      onChange={(e) => set("state", e.target.value)}
                    >
                      {STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Pincode *</label>
                    <input
                      className={inputCls}
                      placeholder="110001"
                      maxLength={6}
                      value={addr.pincode}
                      onChange={(e) => set("pincode", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 sm:px-5 py-3.5 rounded-xl border border-amber-700/20 text-amber-700/60 bg-transparent hover:bg-amber-400/6 hover:text-amber-700 transition-all text-xs cursor-pointer font-['Cinzel',serif]"
                >
                  ← Back
                </button>
                <div className="flex-1">
                  <GoldBtn disabled={!canStep2} onClick={() => setStep(3)}>
                    Review Order →
                  </GoldBtn>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="font-['Cinzel',serif] text-[11px] tracking-widest text-amber-700/45 uppercase mb-4">
                Review & Confirm
              </p>
              <div className="rounded-2xl border border-amber-700/10 overflow-hidden mb-4">
                <div
                  className="px-4 py-2.5 border-b border-amber-700/8"
                  style={{ background: "rgba(251,191,36,0.04)" }}
                >
                  <p className="font-['Cinzel',serif] text-[9px] tracking-widest text-amber-700/45 uppercase">
                    Delivering To
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="font-['Cinzel',serif] text-[12px] sm:text-[13px] font-semibold text-[#44260a] mb-1">
                    {addr.name} · {addr.phone}
                  </p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[12px] sm:text-[13px] text-[#b08050] leading-relaxed">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                    {addr.state} — {addr.pincode}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-700/10 overflow-hidden mb-5">
                <div
                  className="px-4 py-2.5 border-b border-amber-700/8"
                  style={{ background: "rgba(251,191,36,0.04)" }}
                >
                  <p className="font-['Cinzel',serif] text-[9px] tracking-widest text-amber-700/45 uppercase">
                    Price Breakdown
                  </p>
                </div>
                {[
                  [`${product.name} × ${qty}`, `₹${total}`],
                  ["Delivery", deliveryFee === 0 ? "Free" : `₹${deliveryFee}`],
                  [
                    "Payment Mode",
                    payMode === "cod" ? "Cash on Delivery" : "Online Payment",
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between px-4 py-2.5 border-b border-amber-700/5 last:border-0"
                  >
                    <span className="font-['Cormorant_Garamond',serif] italic text-[12px] sm:text-[13px] text-[#b08050]">
                      {k}
                    </span>
                    <span className="font-['Cinzel',serif] text-[12px] sm:text-[13px] text-[#44260a]">
                      {v}
                    </span>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between px-4 py-3 border-t border-amber-700/12"
                  style={{ background: "rgba(251,191,36,0.04)" }}
                >
                  <span className="font-['Cinzel',serif] text-[12px] tracking-wide text-[#44260a] font-semibold">
                    Grand Total
                  </span>
                  <span className="font-['Cinzel',serif] text-[16px] sm:text-[18px] font-bold text-[#b45309]">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>
              <div
                className="flex items-center gap-2.5 p-3 rounded-xl mb-5 border border-amber-400/18"
                style={{ background: "rgba(251,191,36,0.04)" }}
              >
                <span className="text-base">🔒</span>
                <p className="font-['Cormorant_Garamond',serif] italic text-[11px] sm:text-[12px] text-[#b08050] leading-snug">
                  Your order is protected. Each item is energised, packed with
                  care and shipped with love.
                </p>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 sm:px-5 py-3.5 rounded-xl border border-amber-700/20 text-amber-700/60 bg-transparent hover:bg-amber-400/6 hover:text-amber-700 transition-all text-xs cursor-pointer font-['Cinzel',serif]"
                >
                  ← Back
                </button>
                <div className="flex-1">
                  <GoldBtn disabled={placing} onClick={placeOrder}>
                    {placing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Placing Order…</span>
                      </>
                    ) : (
                      `✦ ${payMode === "cod" ? "Place COD Order" : "Proceed to Pay"} — ₹${grandTotal}`
                    )}
                  </GoldBtn>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div
                className="check-pop w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#b45309)",
                  boxShadow: "0 0 0 6px rgba(245,158,11,0.15)",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-['Cinzel',serif] text-[16px] sm:text-[18px] font-semibold text-[#44260a] mb-1.5">
                Order Confirmed!
              </p>
              <p className="font-['Cormorant_Garamond',serif] italic text-[14px] sm:text-[15px] text-[#b08050] mb-4">
                May this sacred item bring blessings to your life 🙏
              </p>
              <div
                className="inline-block px-5 py-2 rounded-full mb-6 border border-amber-400/25"
                style={{ background: "rgba(251,191,36,0.07)" }}
              >
                <p className="font-['Cinzel',serif] text-[9px] tracking-widest text-amber-700/45 uppercase mb-1">
                  Order ID
                </p>
                <p className="font-['Cinzel',serif] text-[15px] sm:text-[16px] font-bold text-[#b45309] tracking-widest">
                  {orderId}
                </p>
              </div>
              <div
                className="rounded-2xl border border-amber-700/10 p-4 text-left mb-6"
                style={{ background: "rgba(251,191,36,0.03)" }}
              >
                {[
                  ["Delivery to", `${addr.city}, ${addr.state}`],
                  [
                    "Payment",
                    payMode === "cod" ? "Cash on Delivery" : "Online · Paid",
                  ],
                  ["Amount", `₹${grandTotal}`],
                  ["Delivery", product.deliveryDays || "Standard"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between py-2 border-b border-amber-700/6 last:border-0"
                  >
                    <span className="font-['Cinzel',serif] text-[9px] tracking-widest text-amber-700/40 uppercase">
                      {k}
                    </span>
                    <span className="font-['Cormorant_Garamond',serif] italic text-[12px] sm:text-[13px] text-[#44260a]">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[12px] sm:text-[13px] text-amber-700/45 leading-relaxed mb-5">
                A confirmation will be sent to{" "}
                <span className="text-[#b45309]">{addr.email}</span>.<br />
                {payMode === "cod" &&
                  "Keep the exact amount ready at delivery."}
              </p>
              <GoldBtn onClick={onClose}>Continue Shopping</GoldBtn>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-7 py-4 border-t border-amber-700/8 flex items-center justify-center gap-3">
          <span className="font-serif text-sm text-amber-300/40">ॐ</span>
          <span className="font-['Cormorant_Garamond',serif] italic text-[11px] sm:text-[12px] text-amber-700/35 tracking-wide">
            Pure · Energised · Lab Certified · Secure
          </span>
          <span className="font-serif text-sm text-amber-300/40">ॐ</span>
        </div>
      </div>
    </div>
  );
}

export default function Buy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [showOrder, setShowOrder] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProduct(data);
          setActiveImg(0);
          const relSnap = await getDocs(collection(db, "products"));
          const all = relSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const rel = all
            .filter((p) => p.id !== id && p.category === data.category)
            .slice(0, 4);
          const others = all
            .filter((p) => p.id !== id && p.category !== data.category)
            .slice(0, 4 - rel.length);
          setRelated([...rel, ...others]);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#fdf8f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 items-start">
            <div className="w-full aspect-square rounded-2xl bg-amber-100 animate-pulse" />
            <div className="flex flex-col gap-4">
              {[40, 80, 60, 100, 80, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-8 rounded bg-amber-100 animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-[#fdf8f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
          <div className="text-6xl mb-4 opacity-30">🛍️</div>
          <p className="font-['Cinzel',serif] text-lg text-amber-700/50">
            Product not found
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 bg-transparent border border-amber-700/20 text-amber-700 px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-amber-700/5 transition-all mt-5"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );

  const discount =
    product.mrp && product.price && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const images = product.images || [];
  const tableRows = [
    product.brand && ["Brand", product.brand],
    product.category && ["Category", product.category],
    product.weight && ["Weight", product.weight + "g"],
    product.dimensions && ["Dimensions", product.dimensions],
    product.deliveryDays && ["Delivery", product.deliveryDays],
    [
      "Stock",
      product.stock > 0 ? `${product.stock} available` : "Out of stock",
    ],
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#fdf8f0] font-['DM_Sans',sans-serif]">
      {showOrder && (
        <OrderModal
          product={product}
          qty={qty}
          onClose={() => setShowOrder(false)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
        <div className="flex items-center gap-2 text-xs text-amber-700/50 mb-5 sm:mb-8 flex-wrap">
          <span
            onClick={() => navigate("/")}
            className="cursor-pointer hover:text-amber-700 transition-colors"
          >
            Home
          </span>
          <span className="text-amber-700/25">/</span>
          <span
            onClick={() => navigate("/shop")}
            className="cursor-pointer hover:text-amber-700 transition-colors"
          >
            {product.category}
          </span>
          <span className="text-amber-700/25">/</span>
          <span className="text-amber-700 font-medium truncate max-w-35 sm:max-w-none">
            {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-start mb-12 sm:mb-20">
          <div>
            <div className="rounded-2xl overflow-hidden border border-amber-700/10 bg-white shadow-[0_4px_32px_rgba(120,53,15,0.1)] aspect-square flex items-center justify-center relative mb-3">
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 font-['Cinzel',serif] text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-xl shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  {discount}% OFF
                </div>
              )}
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl opacity-20">🛍️</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer transition-all border-2 ${i === activeImg ? "border-amber-400 shadow-[0_0_0_2px_rgba(245,158,11,0.2)]" : "border-transparent hover:border-amber-400/50"}`}
                  >
                    <img
                      src={src}
                      alt={`img-${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-700/18 text-amber-700 rounded-full px-3 py-0.5 text-[10px] font-semibold tracking-widest uppercase mb-3">
              {product.category}
            </div>
            <h1 className="font-['Cinzel',serif] text-xl sm:text-2xl font-bold text-[#44260a] mb-1.5 tracking-wide leading-tight">
              {product.name}
            </h1>
            {product.brand && (
              <p className="font-['Cormorant_Garamond',serif] italic text-base text-[#b08050] mb-4 sm:mb-5">
                {product.brand}
              </p>
            )}

            <div className="h-px bg-linear-to-r from-amber-700/10 via-amber-700/4 to-transparent my-4 sm:my-5" />

            <div className="flex items-baseline gap-2.5 mb-4 sm:mb-5 flex-wrap">
              <span className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold text-amber-700">
                ₹{product.price}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-base sm:text-lg text-amber-700/40 line-through">
                    ₹{product.mrp}
                  </span>
                  <span className="bg-green-600/10 text-green-600 border border-green-600/20 rounded-lg px-2.5 py-0.5 text-xs font-bold">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="font-['Cormorant_Garamond',serif] text-[15px] sm:text-[17px] text-amber-900 leading-[1.75] mb-4 sm:mb-5 opacity-85">
              {product.description}
            </p>

            {(product.features || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5 sm:mb-6">
                {product.features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-400/8 border border-amber-400/20 text-amber-700 text-[10px] sm:text-[11px] font-semibold tracking-wide"
                  >
                    ✦ {f}
                  </span>
                ))}
              </div>
            )}

            <div className="h-px bg-linear-to-r from-amber-700/10 via-amber-700/4 to-transparent my-4 sm:my-5" />

            {/* Delivery info */}
            <div className="bg-white border border-amber-700/10 rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-5 mb-5 sm:mb-6 flex-wrap">
              {[
                {
                  icon: "🚚",
                  title: "Delivery",
                  sub: product.deliveryDays || "Standard",
                },
                {
                  icon: "💰",
                  title: "Shipping",
                  sub:
                    product.deliveryFee == 0
                      ? "Free"
                      : "₹" + product.deliveryFee,
                },
                {
                  icon: "📦",
                  title: "Stock",
                  sub: product.stock > 0 ? "In Stock" : "Out of Stock",
                  green: product.stock > 0,
                },
              ].map(({ icon, title, sub, green }) => (
                <div
                  key={title}
                  className="flex items-center gap-2 text-xs text-amber-900 flex-1"
                >
                  <span className="text-base sm:text-lg shrink-0">{icon}</span>
                  <div>
                    <p className="font-semibold text-xs m-0">{title}</p>
                    <p
                      className={`text-[10px] sm:text-[11px] m-0 ${green !== undefined ? (green ? "text-green-600 font-semibold" : "text-red-500 font-semibold") : "text-amber-700/50"}`}
                    >
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Qty */}
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-amber-700/20 bg-transparent text-amber-700 text-lg cursor-pointer flex items-center justify-center hover:bg-amber-400/8 hover:border-amber-400 transition-all"
              >
                −
              </button>
              <span className="font-['Cinzel',serif] text-base font-bold text-[#44260a] w-9 text-center">
                {qty}
              </span>
              <button
                onClick={() =>
                  setQty((q) => Math.min(product.stock || 99, q + 1))
                }
                className="w-9 h-9 rounded-lg border border-amber-700/20 bg-transparent text-amber-700 text-lg cursor-pointer flex items-center justify-center hover:bg-amber-400/8 hover:border-amber-400 transition-all"
              >
                +
              </button>
              <span className="text-[11px] text-amber-700/40">
                ({product.stock || 0} left)
              </span>
            </div>

            {/* CTA */}
            <div className="flex gap-2.5 mb-5 sm:mb-6">
              <button
                disabled={product.stock === 0}
                onClick={() => product.stock > 0 && setShowOrder(true)}
                className={`flex-1 bg-linear-to-br from-amber-400 to-amber-600 text-amber-50 border-none py-3 sm:py-3.5 rounded-xl font-['Cinzel',serif] text-xs font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,158,11,0.42)] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)] ${product.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {product.stock > 0 ? "Buy Now" : "Out of Stock"}
              </button>
              <button
                onClick={() => setWishlisted((w) => !w)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-amber-700/20 bg-white flex items-center justify-center text-xl cursor-pointer hover:border-amber-400 hover:bg-amber-400/6 hover:scale-105 transition-all"
                title="Wishlist"
              >
                {wishlisted ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Details table */}
            {tableRows.length > 0 && (
              <>
                <div className="h-px bg-linear-to-r from-amber-700/10 via-amber-700/4 to-transparent my-4 sm:my-5" />
                <p className="font-['Cinzel',serif] text-[12px] sm:text-[13px] font-semibold text-[#44260a] mb-3">
                  Product Details
                </p>
                <table className="w-full border-collapse">
                  <tbody>
                    {tableRows.map(([k, v]) => (
                      <tr key={k} className="even:bg-amber-400/3">
                        <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-[11px] text-amber-700/55 font-semibold tracking-wide uppercase border-b border-amber-700/6 w-24 sm:w-28">
                          {k}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-[12px] sm:text-[13px] text-[#44260a] border-b border-amber-700/6">
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <p className="text-[10px] tracking-widest uppercase text-amber-700/45 font-semibold mb-2">
              You May Also Like
            </p>
            <h2 className="font-['Cinzel',serif] text-lg sm:text-xl font-bold text-[#44260a] mb-1">
              Related Sacred Items
            </h2>
            <div className="h-0.5 w-14 bg-linear-to-r from-amber-400 to-transparent rounded mb-5 sm:mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => {
                const d =
                  p.mrp && p.price
                    ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                    : 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/buy/${p.id}`)}
                    className="bg-white border border-amber-700/10 rounded-2xl overflow-hidden cursor-pointer relative hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(120,53,15,0.12)] hover:border-amber-700/22 transition-all"
                  >
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full aspect-square object-cover block bg-amber-400/5"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-amber-400/5 flex items-center justify-center text-3xl sm:text-4xl">
                        🛍️
                      </div>
                    )}
                    <div className="p-2.5 sm:p-3">
                      <p className="font-['Cinzel',serif] text-[11px] sm:text-xs font-semibold text-[#44260a] mb-1.5 truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Cinzel',serif] text-xs sm:text-sm font-bold text-amber-700">
                          ₹{p.price}
                        </span>
                        {d > 0 && (
                          <span className="text-[10px] text-green-600 font-bold">
                            {d}% off
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
