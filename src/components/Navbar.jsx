import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "./Firebase";
import { doc, setDoc } from "firebase/firestore";
import CartSidebar from "./Cart";

const sidebarInputStyle = {
  padding: "12px",
  borderRadius: "8px",

  border: "1px solid rgba(180,83,9,0.2)",

  outline: "none",
  fontSize: "14px",

  fontFamily: "'DM Sans',sans-serif",

  width: "100%",
  boxSizing: "border-box",

  color: "#44260a",
  background: "#fff",
};

const sidebarBtnStyle = {
  background: "linear-gradient(135deg,#f59e0b,#d97706)",

  color: "white",
  padding: "14px",
  borderRadius: "8px",

  fontWeight: "600",
  border: "none",
  cursor: "pointer",

  marginTop: "10px",
  boxShadow: "0 4px 12px rgba(180,83,9,0.2)",

  textTransform: "uppercase",
  letterSpacing: "0.05em",

  fontSize: "13px",
  width: "100%",
};

export function OmLogo({ size = 52 }) {
  return (
    <div
      className="flex items-center justify-center relative"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(251,191,36,0.18) 0%,rgba(180,83,9,0.10) 60%,transparent 100%)",
        }}
      />

      <div
        className="absolute rounded-full border border-amber-300/28"
        style={{ inset: "6%" }}
      />

      <div
        className="absolute rounded-full border border-amber-300/16"
        style={{ inset: "13%" }}
      />

      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-amber-300/50"
          style={{
            width: "8%",
            height: "8%",
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
          width: "64%",
          height: "64%",
          position: "relative",
          zIndex: 2,
          filter: "drop-shadow(0 0 8px rgba(251,191,36,0.55))",
        }}
      >
        <defs>
          <linearGradient id="omGoldNav" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="30%" stopColor="#fcd34d" />

            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <filter id="glowNav">
            <feGaussianBlur stdDeviation="2" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <text
          x="100"
          y="135"
          textAnchor="middle"
          fontSize="130"
          fontFamily="serif"
          fill="url(#omGoldNav)"
          filter="url(#glowNav)"
          style={{ letterSpacing: "-4px" }}
        >
          ॐ
        </text>

        <circle cx="100" cy="155" r="3" fill="#fcd34d" opacity="0.9" />

        <line
          x1="72"
          y1="162"
          x2="128"
          y2="162"
          stroke="url(#omGoldNav)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);

const OrderIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10" />
    <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3V5Z" />
    <path d="M10 12h4" />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ChevronDown = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="22"
    height="22"
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

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Products",
    href: "/shop?cat=All",
    dropdown: [
      {
        label: "Dhan Yog Bracelets",
        sub: "Wealth & prosperity",
        cat: "Bracelets",
      },
      {
        label: "Rudraksha Beads",
        sub: "Protection & healing",
        cat: "Rudraksha",
      },
      { label: "Gemstone Rings", sub: "Planetary balance", cat: "Rings" },
      { label: "Shree Yantra", sub: "Sacred geometry", cat: "Yantras" },
      { label: "Vastu Pyramids", sub: "Energy harmonisers", cat: "Vastu" },
      { label: "All Products", sub: "Browse everything", cat: "All" },
    ],
  },
  { label: "Rudraksha", href: "/shop?cat=Rudraksha" },
  { label: "Gemstones", href: "/shop?cat=Gemstones" },
  { label: "Puja Samagri", href: "/shop?cat=Puja Samagri" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [mobDropOpen, setMobDropOpen] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);

  const [hasOpenedManually, setHasOpenedManually] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true",
  );

  const [loggedInUser, setLoggedInUser] = useState(null);

  const [isSending, setIsSending] = useState(false);

  const [userEnteredOtp, setUserEnteredOtp] = useState("");

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const formRef = useRef();

  const otpRef = useRef({ current: "" });

  const location = useLocation();

  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const update = async () => {
      try {
        const { getCartItems } = await import("./Cart");
        const items = await getCartItems();
        setCartCount(items.reduce((s, i) => s + i.qty, 0));
      } catch {}
    };
    update();
    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOpenedManually && !isLoggedIn) setShowSidebar(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasOpenedManually, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const s = localStorage.getItem("user");
      if (s) setLoggedInUser(JSON.parse(s));
    } else setLoggedInUser(null);
  }, [isLoggedIn]);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";

    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const s = localStorage.getItem("user");
      if (s) setLoggedInUser(JSON.parse(s));
    }
  }, [location]);

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

  const handleAccountClick = () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/account");
    } else {
      setHasOpenedManually(true);
      setShowSidebar(true);
      setStep(1);
    }
  };

  const handleOrdersClick = () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/orders");
    } else {
      setHasOpenedManually(true);
      setShowSidebar(true);
      setStep(1);
    }
  };

  const handleSendEmail = (e) => {
    e.preventDefault();

    setIsSending(true);

    const name = formRef.current.user_name.value;

    const email = formRef.current.user_email.value;

    const phone = formRef.current.user_phone.value;

    setFormData({ name, email, phone });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    otpRef.current = newOtp;

    emailjs
      .send(
        "service_19iux99",
        "template_ahpxuy6",
        { user_name: name, user_email: email, otp: newOtp },
        "qWOHMVFvpSPceJAdP",
      )

      .then(() => {
        setIsSending(false);
        setStep(2);
      })

      .catch(() => {
        alert("Error sending OTP");
        setIsSending(false);
      });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (userEnteredOtp.trim() !== otpRef.current) {
      alert("Invalid OTP. Please try again.");
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: "",
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "users", formData.email), userData, { merge: true });
    } catch (err) {
      console.error(err);
    }

    localStorage.setItem("user", JSON.stringify(userData));

    localStorage.setItem("isLoggedIn", "true");

    setIsLoggedIn(true);
    setLoggedInUser(userData);
    setShowSidebar(false);

    navigate("/account");
  };

  const badgeStyle = {
    position: "absolute",
    top: 5,
    right: 5,
    background: "#b45309",
    border: "1.5px solid #fffbf2",
    color: "#fef3c7",
    fontSize: 9,
    fontWeight: 700,
    width: 15,
    height: 15,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <>
      <div
        className="text-center py-1.5 px-5 font-['DM_Sans',sans-serif] text-[11.5px] tracking-wide text-amber-100 border-b border-amber-700/30"
        style={{
          background:
            "linear-gradient(90deg,#92400e 0%,#b45309 50%,#92400e 100%)",
        }}
      >
        ✦ Free shipping on orders above ₹999 &nbsp;·&nbsp; All products
        energised &amp; lab-certified
      </div>

      <nav
        className={`sticky top-0 z-100 transition-shadow duration-300 ${scrolled ? "navbar-scrolled" : ""}`}
        style={{
          background: "rgba(255,251,242,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(180,83,9,0.12)",
        }}
      >
        <div className="mx-auto px-5" style={{ maxWidth: 1280 }}>
          <div className="flex items-center" style={{ height: 72 }}>
            <a
              href="/"
              className="flex items-center gap-3 no-underline"
              style={{ flexShrink: 0, marginRight: 36, textDecoration: "none" }}
            >
              <OmLogo size={54} />

              <div
                className="hidden sm:flex flex-col"
                style={{ lineHeight: 1 }}
              >
                <span className="font-['Cinzel',serif] text-[16px] font-semibold tracking-widest text-amber-800">
                  Diviya Vedic Shop
                </span>

                <span className="font-['Cormorant_Garamond',serif] italic text-[11.5px] tracking-widest text-[#b08050] mt-0.5">
                  vedic astrology &amp; gemstones
                </span>
              </div>
            </a>

            <div className="hidden lg:flex items-center flex-1 gap-0.5">
              {navLinks.map((link, i) => (
                <div
                  key={i}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(i)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    onClick={() => navigate(link.href)}
                    className={`nav-link cursor-pointer flex items-center gap-1 ${location.pathname === link.href ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    {link.label} {link.dropdown && <ChevronDown />}
                  </a>

                  {link.dropdown && activeDropdown === i && (
                    <div
                      className="dropdown-menu absolute left-0"
                      style={{ top: "100%", paddingTop: 8, zIndex: 200 }}
                    >
                      <div
                        style={{
                          background: "#fffbf2",
                          border: "1px solid rgba(180,83,9,0.15)",
                          borderRadius: 10,
                          minWidth: 220,
                          padding: "8px 0",
                          boxShadow: "0 12px 40px rgba(120,53,15,0.12)",
                        }}
                      >
                        <div
                          style={{
                            height: 2,
                            background:
                              "linear-gradient(90deg,#f59e0b,#fcd34d,#f59e0b)",
                            borderRadius: "8px 8px 0 0",
                            marginBottom: 6,
                          }}
                        />

                        {link.dropdown.map((item, j) => (
                          <a
                            key={j}
                            onClick={() => {
                              navigate(`/shop?cat=${item.cat}`);
                              setActiveDropdown(null);
                            }}
                            className="flex items-start gap-3 cursor-pointer no-underline px-4.5 py-2.5 hover:bg-amber-700/5"
                          >
                            <div
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "#f59e0b",
                                marginTop: 5,
                                flexShrink: 0,
                              }}
                            />

                            <div>
                              <div className="font-['DM_Sans',sans-serif] text-[12.5px] text-amber-800 font-medium">
                                {item.label}
                              </div>

                              <div className="font-['DM_Sans',sans-serif] text-[11px] text-[#b08050] mt-px">
                                {item.sub}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="gold-divider" />

              <a
                href="https://www.seemaaastrologer.com/"
                target="_blank"
                rel="noopener noreferrer"
                title="Use code: DIVIYAVEDIC"
                className="font-dm text-[10px] tracking-[0.06em] uppercase text-amber-50 px-3 py-1.75 mx-0.5 rounded-full font-medium no-underline transition-all hover:scale-105 active:scale-95 shadow-md"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                }}
              >
                Book Consult
              </a>
            </div>

            <div className="flex items-center ml-auto gap-0.5">
              <div className="hidden lg:flex items-center relative mr-2">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#b08050]">
                  <SearchIcon />
                </div>

                <input
                  className="search-input"
                  type="text"
                  placeholder="Search..."
                />
              </div>

              {isLoggedIn ? (
                <button
                  className="icon-btn hidden sm:flex"
                  title="Your Orders"
                  onClick={handleOrdersClick}
                >
                  <OrderIcon />
                </button>
              ) : (
                <button className="icon-btn hidden sm:flex" title="Wishlist">
                  <HeartIcon />

                  <span style={{ ...badgeStyle, background: "#dc2626" }}>
                    2
                  </span>
                </button>
              )}

              {isLoggedIn && loggedInUser ? (
                <div
                  className="avatar-circle"
                  title={loggedInUser.name}
                  onClick={handleAccountClick}
                >
                  {getInitials(loggedInUser.name)}
                </div>
              ) : (
                <button
                  className="icon-btn"
                  title="My Account"
                  onClick={handleAccountClick}
                >
                  <UserIcon />
                </button>
              )}

              <button
                className="icon-btn"
                title="Cart"
                style={{ position: "relative" }}
                onClick={() => setCartOpen(true)}
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span style={badgeStyle}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              <button
                className="icon-btn lg:hidden desktop-hide-hamburger"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            height: 2,
            background:
              "linear-gradient(90deg,transparent 0%,#f59e0b 25%,#fcd34d 50%,#f59e0b 75%,transparent 100%)",
            opacity: 0.45,
          }}
        />

        {mobileOpen && (
          <div className="lg:hidden bg-[#fffbf2] border-t border-amber-700/10">
            <div className="p-3.5">
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#b08050]">
                  <SearchIcon />
                </div>

                <input
                  className="search-input"
                  type="text"
                  placeholder="Search gems, yantras…"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {navLinks.map((link, i) => (
              <div key={i}>
                {link.dropdown ? (
                  <>
                    <button
                      onClick={() => setMobDropOpen((v) => !v)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-transparent border-none border-b border-amber-700/8 cursor-pointer font-['DM_Sans',sans-serif] text-[13px] tracking-wide uppercase text-amber-800 font-normal"
                      style={{ borderBottom: "1px solid rgba(180,83,9,0.08)" }}
                    >
                      {link.label}{" "}
                      {mobDropOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {mobDropOpen && (
                      <div
                        style={{
                          background: "rgba(251,191,36,0.04)",
                          borderBottom: "1px solid rgba(180,83,9,0.08)",
                        }}
                      >
                        {link.dropdown.map((item, j) => (
                          <a
                            key={j}
                            href="#"
                            className="flex items-center gap-2.5 no-underline px-7 py-2.5"
                            style={{
                              borderBottom:
                                j < link.dropdown.length - 1
                                  ? "1px solid rgba(180,83,9,0.05)"
                                  : "none",
                              textDecoration: "none",
                            }}
                          >
                            <div
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "#f59e0b",
                                flexShrink: 0,
                              }}
                            />

                            <div>
                              <div className="font-['DM_Sans',sans-serif] text-[13px] text-amber-800 font-medium">
                                {item.label}
                              </div>

                              <div className="font-['DM_Sans',sans-serif] text-[11px] text-[#b08050]">
                                {item.sub}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={link.href}
                    className="block no-underline px-5 py-3.5 font-['DM_Sans',sans-serif] text-[13px] tracking-wide uppercase text-amber-800 font-normal"
                    style={{
                      borderBottom: "1px solid rgba(180,83,9,0.08)",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}

            <div className="p-4 flex items-center gap-2.5">
              <a
                href="https://www.seemaaastrologer.com/"
                target="_blank"
                rel="noopener noreferrer"
                title="Use code: DIVIYAVEDIC"
                className="flex-1 text-center font-dm text-xs tracking-[0.07em] uppercase text-amber-50 px-5 py-2.5 rounded-3xl no-underline font-medium transition-all shadow-lg active:scale-95"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                }}
              >
                Book Consult
              </a>

              {isLoggedIn ? (
                <button
                  className="icon-btn"
                  style={{
                    border: "1px solid rgba(180,83,9,0.2)",
                    borderRadius: 10,
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                  }}
                  onClick={handleOrdersClick}
                >
                  <OrderIcon />
                </button>
              ) : (
                <button
                  className="icon-btn"
                  style={{
                    border: "1px solid rgba(180,83,9,0.2)",
                    borderRadius: 10,
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                  }}
                >
                  <HeartIcon />
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <div
        className="backdrop-fade"
        onClick={() => setShowSidebar(false)}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(68,38,10,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          opacity: showSidebar ? 1 : 0,
          pointerEvents: showSidebar ? "auto" : "none",
        }}
      />

      <div
        className="sidebar-container"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 350,
          backgroundColor: "#fffbf2",
          boxShadow: "-10px 0 30px rgba(120,53,15,0.15)",
          zIndex: 101,
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans',sans-serif",
          transform: showSidebar ? "translateX(0)" : "translateX(100%)",
          opacity: showSidebar ? 1 : 0.9,
        }}
      >
        <button
          onClick={() => setShowSidebar(false)}
          className="absolute top-5 right-5 bg-transparent border-none cursor-pointer text-amber-800"
        >
          <CloseIcon />
        </button>

        <h2 className="font-['Cinzel',serif] text-[20px] text-amber-800 mb-2 mt-5">
          Welcome to Diviya Vedics
        </h2>

        <p className="text-[14px] text-[#b08050] mb-8">
          Login to track orders and view your profile.
        </p>

        {step === 1 ? (
          <form
            ref={formRef}
            onSubmit={handleSendEmail}
            className="flex flex-col gap-4 flex-1"
          >
            <input
              required
              name="user_name"
              type="text"
              placeholder="Full Name"
              style={sidebarInputStyle}
            />

            <input
              required
              name="user_email"
              type="email"
              placeholder="Email Address"
              style={sidebarInputStyle}
            />

            <input
              required
              name="user_phone"
              type="tel"
              placeholder="Phone Number"
              style={sidebarInputStyle}
            />

            <div className="my-2">
              <p className="text-[12px] text-amber-800 mb-2 font-medium">
                Receive OTP via:
              </p>

              <div className="flex gap-5">
                {["Email", "SMS"].map((opt, i) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-[13px] text-amber-800 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="otp_method"
                      value={opt}
                      defaultChecked={i === 0}
                      style={{ accentColor: "#b45309" }}
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              style={{ ...sidebarBtnStyle, opacity: isSending ? 0.7 : 1 }}
            >
              {isSending ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleVerifyOtp}
            className="flex flex-col gap-4 flex-1"
          >
            <p className="text-[14px] text-amber-800 text-center mb-2">
              Enter the 6-digit code sent to your email.
            </p>

            <input
              required
              type="text"
              placeholder="0 0 0 0 0 0"
              maxLength="6"
              value={userEnteredOtp}
              onChange={(e) =>
                setUserEnteredOtp(e.target.value.replace(/\s/g, ""))
              }
              style={{
                padding: "16px",
                borderRadius: "8px",
                border: "2px solid rgba(180,83,9,0.2)",
                textAlign: "center",
                fontSize: "24px",
                letterSpacing: "8px",
                background: "white",
                color: "#78350f",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            <button type="submit" style={sidebarBtnStyle}>
              Verify &amp; Access Account
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-transparent border-none text-[#b08050] cursor-pointer text-[12px] mt-2"
            >
              ← Edit Details
            </button>
          </form>
        )}

        <div className="mt-auto flex flex-col items-center gap-2.5 opacity-80 pb-5">
          <OmLogo size={60} />

          <span className="font-['Cormorant_Garamond',serif] italic text-[12px] text-[#b08050]">
            Pure • Energised • Lab Certified
          </span>
        </div>
      </div>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
