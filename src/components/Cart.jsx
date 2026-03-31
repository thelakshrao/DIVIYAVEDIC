import { useState, useEffect } from "react";
import { db } from "./Firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const ORBIT_DOTS = [0, 60, 120, 180, 240, 300];
const OmSeal = () => (
  <div
    className="relative flex items-center justify-center"
    style={{ width: 40, height: 40 }}
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
          width: 2,
          height: 2,
          opacity: 0.5,
          top: `${50 - 44 * Math.cos((deg * Math.PI) / 180)}%`,
          left: `${50 + 44 * Math.sin((deg * Math.PI) / 180)}%`,
          transform: "translate(-50%,-50%)",
        }}
      />
    ))}
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: 24,
        height: 24,
        position: "relative",
        zIndex: 2,
        filter: "drop-shadow(0 0 6px rgba(251,191,36,0.7))",
      }}
    >
      <defs>
        <linearGradient id="omCartGold" x1="0%" y1="0%" x2="100%" y2="100%">
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
        fill="url(#omCartGold)"
      >
        ॐ
      </text>
    </svg>
  </div>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export async function addToCart(product, qty = 1) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.email || "guest";
  const cartRef = doc(db, "InCart", `${userId}_${product.id}`);
  const existing = await getDoc(cartRef);
  if (existing.exists()) {
    const d = existing.data();
    await setDoc(cartRef, {
      ...d,
      qty: d.qty + qty,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(cartRef, {
      userId,
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || "",
      price: product.price,
      mrp: product.mrp || product.price,
      category: product.category || "",
      qty,
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  window.dispatchEvent(new Event("cartUpdated"));
}

export async function getCartItems() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.email || "guest";
  const snap = await getDocs(collection(db, "InCart"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((item) => item.userId === userId);
}

export async function removeFromCart(docId) {
  await deleteDoc(doc(db, "InCart", docId));
  window.dispatchEvent(new Event("cartUpdated"));
}

export async function updateCartQty(docId, qty) {
  if (qty < 1) {
    await removeFromCart(docId);
    return;
  }
  await setDoc(
    doc(db, "InCart", docId),
    { qty, updatedAt: serverTimestamp() },
    { merge: true },
  );
  window.dispatchEvent(new Event("cartUpdated"));
}

export default function CartSidebar({ open, onClose, onCheckout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getCartItems();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchCart();
  }, [open]);

  useEffect(() => {
    const handler = () => {
      if (open) fetchCart();
    };
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, [open]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <style>{`
        @keyframes cartSlideIn { from { transform: translateX(-100%); opacity: 0.6; } to { transform: translateX(0); opacity: 1; } }
        @keyframes cartSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0.6; } }
        @keyframes fadeInItem { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .cart-item-anim { animation: fadeInItem 0.3s ease forwards; }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(68,38,10,0.45)",
          backdropFilter: "blur(5px)",
          zIndex: 200,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: 380,
          maxWidth: "95vw",
          backgroundColor: "#fffbf2",
          boxShadow: "10px 0 40px rgba(120,53,15,0.18)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.38s cubic-bezier(0.34,1.1,0.64,1)",
        }}
      >
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg,#f59e0b,#fcd34d,#f59e0b)",
          }}
        />

        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid rgba(180,83,9,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <OmSeal />
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#44260a",
                margin: 0,
                letterSpacing: "0.04em",
              }}
            >
              Sacred Cart
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: 12,
                color: "#b08050",
                margin: 0,
              }}
            >
              {totalItems > 0
                ? `${totalItems} item${totalItems > 1 ? "s" : ""} chosen`
                : "Your cart awaits"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#b08050",
              padding: 6,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                paddingTop: 8,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    background: "white",
                    border: "1px solid rgba(180,83,9,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      background: "rgba(251,191,36,0.1)",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        height: 12,
                        borderRadius: 6,
                        background: "rgba(251,191,36,0.15)",
                        width: "70%",
                      }}
                    />
                    <div
                      style={{
                        height: 10,
                        borderRadius: 6,
                        background: "rgba(251,191,36,0.1)",
                        width: "40%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div
              style={{ textAlign: "center", paddingTop: 60, paddingBottom: 40 }}
            >
              <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.3 }}>
                🛒
              </div>
              <p
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 14,
                  color: "#44260a",
                  marginBottom: 6,
                }}
              >
                Your cart is empty
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "#b08050",
                  lineHeight: 1.6,
                }}
              >
                Add sacred items to begin your journey
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: 20,
                  padding: "10px 24px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#f59e0b,#b45309)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Cinzel',serif",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="cart-item-anim"
                  style={{
                    animationDelay: `${idx * 0.06}s`,
                    display: "flex",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "white",
                    border: "1px solid rgba(180,83,9,0.08)",
                    boxShadow: "0 2px 12px rgba(120,53,15,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid rgba(180,83,9,0.1)",
                      flexShrink: 0,
                    }}
                  >
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "rgba(251,191,36,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                        }}
                      >
                        🛍️
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#44260a",
                        margin: "0 0 2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.productName}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontStyle: "italic",
                        fontSize: 11,
                        color: "#b08050",
                        margin: "0 0 8px",
                      }}
                    >
                      {item.category}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0,
                          border: "1px solid rgba(180,83,9,0.15)",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() => updateCartQty(item.id, item.qty - 1)}
                          style={{
                            width: 26,
                            height: 26,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#b45309",
                          }}
                        >
                          <MinusIcon />
                        </button>
                        <span
                          style={{
                            fontFamily: "'Cinzel',serif",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#44260a",
                            width: 24,
                            textAlign: "center",
                          }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, item.qty + 1)}
                          style={{
                            width: 26,
                            height: 26,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#b45309",
                          }}
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Cinzel',serif",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#b45309",
                          }}
                        >
                          ₹{item.price * item.qty}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#d97706",
                            opacity: 0.6,
                            display: "flex",
                            alignItems: "center",
                            padding: 4,
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div
            style={{
              padding: "14px 20px 20px",
              borderTop: "1px solid rgba(180,83,9,0.1)",
              background: "rgba(255,251,242,0.98)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "#b08050",
                }}
              >
                Subtotal ({totalItems} items)
              </span>
              <span
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#b45309",
                }}
              >
                ₹{subtotal}
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: 11,
                color: "#b08050",
                margin: "0 0 14px",
                opacity: 0.7,
              }}
            >
              Delivery charges calculated at checkout
            </p>
            <button
              onClick={() => {
                onClose();
                onCheckout && onCheckout(items);
              }}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#f59e0b,#b45309)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Cinzel',serif",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
                boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 24px rgba(245,158,11,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(245,158,11,0.3)";
              }}
            >
              ✦ Proceed to Checkout — ₹{subtotal}
            </button>
          </div>
        )}

        <div
          style={{
            padding: "10px 20px 14px",
            borderTop: "1px solid rgba(180,83,9,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "serif",
              fontSize: 13,
              color: "rgba(251,191,36,0.4)",
            }}
          >
            ॐ
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: "italic",
              fontSize: 11,
              color: "rgba(176,128,80,0.5)",
              letterSpacing: "0.05em",
            }}
          >
            Pure · Energised · Lab Certified · Secure
          </span>
          <span
            style={{
              fontFamily: "serif",
              fontSize: 13,
              color: "rgba(251,191,36,0.4)",
            }}
          >
            ॐ
          </span>
        </div>
      </div>
    </>
  );
}
