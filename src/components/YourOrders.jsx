import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./Firebase";
import {
  collection, getDocs, query, orderBy, where,
} from "firebase/firestore";

const statusColor = {
  Pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed:  "bg-blue-100   text-blue-700   border-blue-200",
  Processing: "bg-purple-100 text-purple-700 border-purple-200",
  Shipped:    "bg-indigo-100 text-indigo-700 border-indigo-200",
  Delivered:  "bg-green-100  text-green-700  border-green-200",
  Cancelled:  "bg-red-100    text-red-600    border-red-200",
};

const statusIcon = {
  Pending:    "🕐",
  Confirmed:  "✅",
  Processing: "⚙️",
  Shipped:    "🚚",
  Delivered:  "📦",
  Cancelled:  "❌",
};

export default function YourOrders() {
  const navigate = useNavigate();
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = (user.email || "").toLowerCase();

  // Auth guard
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") { navigate("/"); }
  }, [navigate]);

  // Load orders + related products
  useEffect(() => {
    if (!userEmail) return;
    const load = async () => {
      setLoading(true);
      try {
        // Fetch all orders, filter by email client-side (avoids index requirement)
        const ordSnap = await getDocs(
          query(collection(db, "orders"), orderBy("createdAt", "desc"))
        );
        const allOrders = ordSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Match by customerEmail or email field
        const myOrders = allOrders.filter(o =>
          (o.customerEmail || "").toLowerCase() === userEmail ||
          (o.email || "").toLowerCase() === userEmail ||
          (o.address?.email || "").toLowerCase() === userEmail
        );
        setOrders(myOrders);

        // Fetch some products for "You May Also Like"
        const prodSnap = await getDocs(
          query(collection(db, "products"), orderBy("purchases", "desc"))
        );
        setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 12));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [userEmail]);

  // Filter + search
  const filtered = orders.filter(o => {
    const matchFilter = filter === "All" || o.status === filter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || (o.orderId || o.id).toLowerCase().includes(q) ||
      (o.productName || "").toLowerCase().includes(q) ||
      (o.items || []).some(i => (i.productName || "").toLowerCase().includes(q)) ||
      (o.status || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const FILTERS = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

  return (
    <div className="min-h-screen bg-[#fdf8f0] font-['DM_Sans',sans-serif]">
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <span className="text-[520px] font-serif text-amber-700/[0.022] select-none leading-none">ॐ</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8 pb-20">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate("/account")}
              className="text-amber-700/50 hover:text-amber-700 transition-colors text-sm cursor-pointer bg-transparent border-none font-['DM_Sans',sans-serif]">
              ← Account
            </button>
            <span className="text-amber-700/30 text-sm">/</span>
            <span className="text-amber-700 text-sm font-medium">Your Orders</span>
          </div>
          <h1 className="font-['Cinzel',serif] text-[28px] font-bold text-[#44260a] m-0 mb-1 tracking-wide">Your Orders</h1>
          <p className="font-['Cormorant_Garamond',serif] italic text-[16px] text-[#b08050] m-0">
            {orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? "s" : ""} placed` : "Your sacred order history"}
          </p>
        </div>

        <div className="flex gap-8 items-start">

          <div className="flex-1 min-w-0">

            <div className="bg-white border border-amber-700/10 rounded-2xl p-4 mb-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

              <div className="relative mb-3">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700/40 pointer-events-none"
                  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search orders by ID, product name, or status…"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#fdf8f0] border border-amber-700/15 rounded-xl text-[13.5px] text-amber-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all placeholder:text-amber-700/30"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700/40 hover:text-amber-700 bg-transparent border-none cursor-pointer text-sm">✕</button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-all ${filter === f
                      ? "bg-amber-400 text-white border-amber-500 shadow-sm"
                      : "bg-white text-amber-700/60 border-amber-700/15 hover:border-amber-400/50 hover:text-amber-700"
                    }`}>
                    {f}
                    {f !== "All" && (
                      <span className="ml-1 opacity-70">({orders.filter(o => o.status === f).length})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white border border-amber-700/10 rounded-2xl p-5 shadow-sm animate-pulse">
                    <div className="h-4 bg-amber-100 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-amber-100 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-amber-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-amber-700/10 rounded-2xl p-12 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
                <div className="text-6xl mb-4 opacity-20">🛒</div>
                {orders.length === 0 ? (
                  <>
                    <p className="font-['Cinzel',serif] text-[18px] font-semibold text-amber-800 mb-2">No Orders Yet</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[16px] text-amber-700/50 mb-6">
                      Your sacred shopping journey begins here.<br />Start exploring our vedic collection.
                    </p>
                    <button onClick={() => navigate("/shop")}
                      className="bg-linear-to-br from-amber-400 to-amber-600 text-white border-none px-8 py-3 rounded-xl font-['Cinzel',serif] text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(245,158,11,0.4)] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)]">
                      Start Ordering →
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-['Cinzel',serif] text-[16px] font-semibold text-amber-800 mb-2">No Results Found</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[15px] text-amber-700/45 mb-4">Try a different search or filter.</p>
                    <button onClick={() => { setSearch(""); setFilter("All"); }}
                      className="text-amber-700 border border-amber-700/25 bg-transparent px-5 py-2 rounded-xl text-[12px] font-medium cursor-pointer hover:bg-amber-50 transition-all">
                      Clear Filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(o => {
                  const sc = statusColor[o.status] || "bg-gray-100 text-gray-600 border-gray-200";
                  const si = statusIcon[o.status] || "📋";
                  const date = o.createdAt?.toDate?.()?.toLocaleDateString?.("en-IN", { day:"numeric", month:"long", year:"numeric" }) || "—";
                  const items = o.items || [];
                  const coverImg = o.productImage || items[0]?.image || "";
                  const productName = o.productName || items[0]?.productName || "—";

                  return (
                    <div key={o.id} className="bg-white border border-amber-700/10 rounded-2xl shadow-sm relative overflow-hidden hover:shadow-[0_4px_24px_rgba(120,53,15,0.1)] hover:border-amber-700/18 transition-all">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

                      <div className="flex items-center justify-between px-5 py-3 border-b border-amber-700/6 bg-amber-50/40 flex-wrap gap-2">
                        <div className="flex items-center gap-6 flex-wrap">
                          <div>
                            <div className="text-[9px] text-amber-700/45 uppercase tracking-widest font-semibold mb-0.5">Order Placed</div>
                            <div className="text-[12px] text-amber-900 font-medium">{date}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-amber-700/45 uppercase tracking-widest font-semibold mb-0.5">Total</div>
                            <div className="font-['Cinzel',serif] text-[14px] font-bold text-amber-700">₹{o.total || o.grandTotal || 0}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-amber-700/45 uppercase tracking-widest font-semibold mb-0.5">Payment</div>
                            <div className="text-[12px] text-amber-900/70">{o.paymentMode === "cod" ? "Cash on Delivery" : "Online"}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-amber-700/45 uppercase tracking-widest font-semibold mb-0.5">Order ID</div>
                          <div className="font-['Cinzel',serif] text-[13px] font-bold text-amber-700">{o.orderId || o.id}</div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-amber-700/10 shrink-0 bg-amber-50 flex items-center justify-center">
                            {coverImg
                              ? <img src={coverImg} alt={productName} className="w-full h-full object-cover" />
                              : <span className="text-3xl">🛍️</span>
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-['Cinzel',serif] text-[14px] font-semibold text-[#44260a] mb-1 truncate">{productName}</p>
                            {items.length > 1 && (
                              <p className="text-[12px] text-amber-700/50 mb-1">+{items.length - 1} more item{items.length > 2 ? "s" : ""}</p>
                            )}
                            <p className="text-[12px] text-amber-700/60 mb-2">
                              Qty: {o.qty || items.reduce((s,i) => s+(i.qty||1), 0)}
                              {o.deliveryFee > 0 ? ` · Delivery ₹${o.deliveryFee}` : " · Free Delivery"}
                            </p>

                            {o.address && (
                              <p className="font-['Cormorant_Garamond',serif] italic text-[13px] text-amber-700/50">
                                📍 {o.address.line1}{o.address.line2?`, ${o.address.line2}`:""}, {o.address.city}, {o.address.state} — {o.address.pincode}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${sc}`}>
                                <span>{si}</span>
                                {o.status || "Pending"}
                              </span>
                            </div>
                            {o.status === "Delivered" && o.deliveredAt && (
                              <p className="text-[11px] text-green-600 font-medium">
                                Delivered {o.deliveredAt?.toDate?.()?.toLocaleDateString?.("en-IN", {day:"numeric",month:"short"}) || ""}
                              </p>
                            )}
                            {o.status === "Shipped" && (
                              <p className="text-[11px] text-indigo-600 font-medium">On the way 🚚</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-700/6 flex-wrap">
                          {o.productId && (
                            <button onClick={() => navigate(`/buy/${o.productId}`)}
                              className="text-[11px] font-semibold px-3.5 py-1.5 rounded-lg border cursor-pointer transition-all bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
                              View Product
                            </button>
                          )}
                          {o.status === "Delivered" && o.productId && (
                            <button onClick={() => navigate(`/buy/${o.productId}`)}
                              className="text-[11px] font-semibold px-3.5 py-1.5 rounded-lg border cursor-pointer transition-all bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                              Buy Again
                            </button>
                          )}
                          {["Pending","Confirmed"].includes(o.status) && (
                            <span className="text-[11px] text-amber-700/45 italic font-['Cormorant_Garamond',serif]">
                              Contact us to cancel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-72 shrink-0 hidden lg:block">
            <div className="bg-white border border-amber-700/10 rounded-2xl shadow-sm relative overflow-hidden top-6">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
              <div className="p-5 border-b border-amber-700/6">
                <p className="font-['Cinzel',serif] text-[13px] font-semibold text-amber-900 mb-0.5">You May Also Like</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-[12px] text-amber-700/45">Vedic items for you</p>
              </div>
              <div className="p-3 max-h-[calc(100vh-180px)] overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-center py-8 font-['Cormorant_Garamond',serif] italic text-[13px] text-amber-700/40">No products yet.</p>
                ) : (
                  <div className="space-y-2">
                    {products.map(p => {
                      const disc = p.mrp && p.price ? Math.round(((p.mrp-p.price)/p.mrp)*100) : 0;
                      return (
                        <div key={p.id} onClick={() => navigate(`/buy/${p.id}`)}
                          className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-amber-50 transition-all group border border-transparent hover:border-amber-700/10">
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-amber-700/10 shrink-0 bg-amber-50 flex items-center justify-center">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                              : <span className="text-xl">🛍️</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-['Cinzel',serif] text-[11px] font-semibold text-[#44260a] truncate group-hover:text-amber-700 transition-colors">{p.name}</p>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[11px] text-amber-700/50 truncate">{p.brand || p.category}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-['Cinzel',serif] text-[12px] font-bold text-amber-700">₹{p.price}</span>
                              {disc > 0 && <span className="text-[10px] text-green-600 font-semibold">{disc}% off</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-amber-700/6">
                      <button onClick={() => navigate("/shop")}
                        className="w-full py-2.5 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 text-white border-none font-['Cinzel',serif] text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-all shadow-[0_3px_12px_rgba(245,158,11,0.25)]">
                        See All Products →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
