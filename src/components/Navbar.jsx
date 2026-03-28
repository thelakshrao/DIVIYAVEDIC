import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "./Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* ─── OM Logo ─── */
export function OmLogo({ size = 52 }) {
  const DOTS = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <div
      className="flex items-center justify-center relative shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(180,83,9,0.10) 60%, transparent 100%)",
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
      {DOTS.map((deg, i) => (
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
        className="relative z-10"
        style={{
          width: "64%",
          height: "64%",
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

/* ─── Icon components ─── */
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
    href: "#",
    dropdown: [
      { label: "Dhan Yog Bracelets", sub: "Wealth & prosperity" },
      { label: "Rudraksha Beads", sub: "Protection & healing" },
      { label: "Gemstone Rings", sub: "Planetary balance" },
      { label: "Shree Yantra", sub: "Sacred geometry" },
      { label: "Vastu Pyramids", sub: "Energy harmonisers" },
      { label: "All Products", sub: "Browse everything" },
    ],
  },
  { label: "Rudraksha", href: "/rudraksha" },
  { label: "Gemstones", href: "/gemstones" },
  { label: "Puja Samagri", href: "/puja" },
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
  const formRef = useRef();
  const [isSending, setIsSending] = useState(false);
  const [otpRef] = useState({ current: "" });
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOpenedManually && !isLoggedIn) setShowSidebar(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasOpenedManually, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const saved = localStorage.getItem("user");
      if (saved) setLoggedInUser(JSON.parse(saved));
    }
  }, [isLoggedIn]);

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
      alert("Invalid OTP.");
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

  /* ─── INPUT / BUTTON STYLES ─── */
  const sidebarInputCls =
    "w-full px-3 py-3 rounded-lg border border-amber-700/20 bg-white text-[#44260a] text-sm outline-none font-dm focus:border-amber-500 transition-colors";
  const sidebarBtnCls =
    "w-full py-3.5 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white font-semibold text-sm uppercase tracking-[0.05em] border-none cursor-pointer mt-2.5 shadow-[0_4px_12px_rgba(180,83,9,0.2)] hover:opacity-90 transition-opacity";

  return (
    <>
      {/* ── TOP BANNER ── */}
      <div
        className="text-center py-1.5 px-5 font-dm text-[11.5px] tracking-[0.06em] text-amber-100 border-b border-amber-700/30"
        style={{
          background:
            "linear-gradient(90deg,#92400e 0%,#b45309 50%,#92400e 100%)",
        }}
      >
        ✦ Free shipping on orders above ₹999 &nbsp;·&nbsp; All products
        energised &amp; lab-certified
      </div>

      {/* ── NAVBAR ── */}
      <nav
        className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "navbar-scrolled" : ""}`}
        style={{
          background: "rgba(255,251,242,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(180,83,9,0.12)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-18">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-3 no-underline hrink-0 mr-9 "
            >
              <OmLogo size={54} />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-cinzel text-[16px] font-semibold tracking-[0.12em] text-amber-900">
                  Diviya Vedic Shop
                </span>
                <span className="font-cormorant italic text-[11.5px] tracking-[0.2em] text-[#b08050] mt-0.75">
                  vedic astrology &amp; gemstones
                </span>
              </div>
            </a>

            {/* Desktop nav */}
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
                    className={`nav-link flex items-center gap-1 ${location.pathname === link.href ? "active" : ""}`}
                  >
                    {link.label} {link.dropdown && <ChevronDown />}
                  </a>

                  {link.dropdown && activeDropdown === i && (
                    <div
                      className="dropdown-menu absolute left-0 z-200"
                      style={{ top: "100%", paddingTop: 8 }}
                    >
                      <div className="bg-[#fffbf2] border border-amber-700/15 rounded-[10px] min-w-55 py-2 shadow-[0_12px_40px_rgba(120,53,15,0.12)]">
                        <div
                          className="h-0.5 rounded-t-lg mb-1.5"
                          style={{
                            background:
                              "linear-gradient(90deg,#f59e0b,#fcd34d,#f59e0b)",
                          }}
                        />
                        {link.dropdown.map((item, j) => (
                          <a
                            key={j}
                            href="#"
                            className="flex items-start gap-3 no-underline px-4.5 py-2.5 hover:bg-amber-700/5 transition-colors"
                          >
                            <div className="w-1.25 h-1.25 rounded-full bg-amber-400 mt-1.25 shrink-0" />
                            <div>
                              <p className="font-dm text-[12.5px] text-amber-900 font-medium m-0">
                                {item.label}
                              </p>
                              <p className="font-dm text-[11px] text-[#b08050] mt-0.5 m-0">
                                {item.sub}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="w-px h-4.5 bg-amber-700/18 mx-1 shrink-0" />
              <a
                href="#"
                className="font-dm text-[10px] tracking-[0.06em] uppercase text-amber-50 px-3 py-1.75 mx-0.5 rounded-full font-medium no-underline"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                }}
              >
                Book Consult
              </a>
            </div>

            {/* Right icons */}
            <div className="flex items-center ml-auto gap-0.5">
              {/* Search */}
              <div className="hidden lg:flex items-center relative mr-2">
                <div className="absolute left-2.75 top-1/2 -translate-y-1/2 text-[#b08050]">
                  <SearchIcon />
                </div>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search..."
                />
              </div>

              {/* Wishlist */}
              <button
                className="icon-btn flex sm:flex  items-center justify-center w-9.5 h-9.5 rounded-lg border-none bg-transparent text-amber-800 cursor-pointer hover:text-amber-700 hover:bg-amber-700/8 transition-colors relative"
                title="Wishlist"
              >
                <HeartIcon />
                <span className="absolute top-1.25 right-1.25 bg-red-600 border-[1.5px] border-[#fffbf2] text-white text-[9px] font-bold w-3.75 h-3.75 rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* Account */}
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
                  className="flex items-center justify-center w-9.5 h-9.5 rounded-lg border-none bg-transparent text-amber-800 cursor-pointer hover:text-amber-700 hover:bg-amber-700/8 transition-colors"
                  title="My Account"
                  onClick={handleAccountClick}
                >
                  <UserIcon />
                </button>
              )}

              {/* Cart */}
              <button
                className="flex items-center justify-center w-9.5 h-9.5 rounded-lg border-none bg-transparent text-amber-800 cursor-pointer hover:text-amber-700 hover:bg-amber-700/8 transition-colors relative"
                title="Cart"
              >
                <CartIcon />
                <span className="absolute top-1.25 right-1.25 bg-amber-700 border-[1.5px] border-[#fffbf2] text-amber-100 text-[9px] font-bold w-3.75 h-3.75 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Hamburger */}
              <button
                className="flex items-center justify-center w-9.5 h-9.5 rounded-lg border-none bg-transparent text-amber-800 cursor-pointer lg:hidden desktop-hide-hamburger"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Gold bottom line */}
        <div
          className="h-0.5 opacity-45"
          style={{
            background:
              "linear-gradient(90deg,transparent 0%,#f59e0b 25%,#fcd34d 50%,#f59e0b 75%,transparent 100%)",
          }}
        />

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#fffbf2] border-t border-amber-700/10">
            <div className="p-3.5 pb-2.5">
              <div className="relative">
                <div className="absolute left-2.75 top-1/2 -translate-y-1/2 text-[#b08050]">
                  <SearchIcon />
                </div>
                <input
                  className="search-input w-full box-border"
                  type="text"
                  placeholder="Search gems, yantras…"
                />
              </div>
            </div>

            {navLinks.map((link, i) => (
              <div key={i}>
                {link.dropdown ? (
                  <>
                    <button
                      onClick={() => setMobDropOpen((v) => !v)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-transparent border-none border-b border-amber-700/8 cursor-pointer font-dm text-[13px] tracking-[0.07em] uppercase text-amber-900 font-normal"
                    >
                      {link.label}{" "}
                      {mobDropOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {mobDropOpen && (
                      <div className="bg-amber-400/4 border-b border-amber-700/8">
                        {link.dropdown.map((item, j) => (
                          <a
                            key={j}
                            href="#"
                            className="flex items-center gap-2.5 px-7 py-2.5 no-underline border-b border-amber-700/5 last:border-0"
                          >
                            <div className="w-1.25 h-1.25 rounded-full bg-amber-400 shrink-0" />
                            <div>
                              <p className="font-dm text-[13px] text-amber-900 font-medium m-0">
                                {item.label}
                              </p>
                              <p className="font-dm text-[11px] text-[#b08050] m-0">
                                {item.sub}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={link.href}
                    className="block no-underline px-5 py-3.5 font-dm text-[13px] tracking-[0.07em] uppercase text-amber-900 font-normal border-b border-amber-700/8"
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}

            <div className="p-4 flex items-center gap-2.5">
              <a
                href="#"
                className="flex-1 text-center font-dm text-xs tracking-[0.07em] uppercase text-amber-50 px-5 py-2.5 rounded-3xl no-underline font-medium"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                }}
              >
                Book Consult
              </a>
              <button className="flex items-center justify-center w-11 h-11 border border-amber-700/20 rounded-[10px] bg-transparent text-amber-800 cursor-pointer shrink-0">
                <HeartIcon />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── LOGIN SIDEBAR ── */}
      <div
        className="backdrop-fade fixed inset-0 bg-amber-950/40 backdrop-blur-sm z-100"
        onClick={() => setShowSidebar(false)}
        style={{
          opacity: showSidebar ? 1 : 0,
          pointerEvents: showSidebar ? "auto" : "none",
        }}
      />

      <div
        className="sidebar-container fixed top-0 right-0 h-full w-87.5 bg-[#fffbf2] shadow-[-10px_0_30px_rgba(120,53,15,0.15)] z-101 p-10 flex flex-col font-dm"
        style={{
          transform: showSidebar ? "translateX(0)" : "translateX(100%)",
          opacity: showSidebar ? 1 : 0.9,
        }}
      >
        <button
          onClick={() => setShowSidebar(false)}
          className="absolute top-5 right-5 bg-transparent border-none cursor-pointer text-amber-900"
        >
          <CloseIcon />
        </button>

        <h2 className="font-cinzel text-[20px] text-amber-900 mb-2 mt-5">
          Welcome to Diviya Vedics
        </h2>
        <p className="text-[#b08050] text-sm mb-8">
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
              className={sidebarInputCls}
            />
            <input
              required
              name="user_email"
              type="email"
              placeholder="Email Address"
              className={sidebarInputCls}
            />
            <input
              required
              name="user_phone"
              type="tel"
              placeholder="Phone Number"
              className={sidebarInputCls}
            />

            <div className="my-2.5">
              <p className="text-xs text-amber-900 mb-2 font-medium">
                Receive OTP via:
              </p>
              <div className="flex gap-5">
                <label className="flex items-center gap-2 text-[13px] text-amber-900 cursor-pointer">
                  <input
                    type="radio"
                    name="otp_method"
                    value="Email"
                    defaultChecked
                    style={{ accentColor: "#b45309" }}
                  />{" "}
                  Email
                </label>
                <label className="flex items-center gap-2 text-[13px] text-amber-900 cursor-pointer">
                  <input
                    type="radio"
                    name="otp_method"
                    value="SMS"
                    style={{ accentColor: "#b45309" }}
                  />{" "}
                  SMS
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className={`${sidebarBtnCls} ${isSending ? "opacity-70" : ""}`}
            >
              {isSending ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleVerifyOtp}
            className="flex flex-col gap-4 flex-1"
          >
            <p className="text-sm text-amber-900 text-center mb-2.5">
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
              className="p-4 rounded-lg border-2 border-amber-700/20 text-center text-[24px] tracking-[8px] bg-white text-amber-900 outline-none"
            />
            <button type="submit" className={sidebarBtnCls}>
              Verify &amp; Access Account
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-transparent border-none text-[#b08050] cursor-pointer text-xs mt-2.5"
            >
              ← Edit Details
            </button>
          </form>
        )}

        <div className="mt-auto flex flex-col items-center gap-2.5 opacity-80 pb-5">
          <OmLogo size={60} />
          <span className="font-cormorant italic text-xs text-[#b08050]">
            Pure • Energised • Lab Certified
          </span>
        </div>
      </div>
    </>
  );
}
