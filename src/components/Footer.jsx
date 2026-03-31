import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OmLogo } from "./Navbar";

const ORBIT_DOTS = [0, 45, 90, 135, 180, 225, 270, 315];

const Keyframes = () => (
  <style>{`
    @keyframes ftSpin  { to { transform: rotate(360deg); } }
    @keyframes ftSpinR { to { transform: rotate(-360deg); } }
    @keyframes ftPulse { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.4;transform:scale(1.08)} }
    @keyframes ftFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    .ft-spin  { animation: ftSpin  22s linear infinite; }
    .ft-spinr { animation: ftSpinR 16s linear infinite; }
    .ft-pulse { animation: ftPulse 4.5s ease-in-out infinite; }
    .ft-float { animation: ftFloat 5.5s ease-in-out infinite; }
  `}</style>
);

const OmBg = () => (
  <div className="absolute right-0 bottom-0 w-64 h-64 pointer-events-none select-none opacity-[0.15]">
    <div
      className="absolute inset-0 rounded-full ft-pulse"
      style={{
        background:
          "radial-gradient(circle,rgba(217,119,6,0.2) 0%,transparent 70%)",
      }}
    />
    <div
      className="absolute rounded-full border border-amber-500/20 ft-spin"
      style={{ inset: 8 }}
    />
    <div
      className="absolute rounded-full border border-amber-600/20 ft-spinr"
      style={{ inset: 22, borderStyle: "dashed" }}
    />
    {ORBIT_DOTS.map((deg, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-amber-600/30"
        style={{
          width: 3,
          height: 3,
          top: `${50 - 44 * Math.cos((deg * Math.PI) / 180)}%`,
          left: `${50 + 44 * Math.sin((deg * Math.PI) / 180)}%`,
          transform: "translate(-50%,-50%)",
        }}
      />
    ))}
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute ft-float"
      style={{
        inset: 34,
        width: "calc(100% - 68px)",
        height: "calc(100% - 68px)",
      }}
    >
      <text
        x="100"
        y="140"
        textAnchor="middle"
        fontSize="112"
        fontFamily="serif"
        fill="#b45309"
      >
        ॐ
      </text>
    </svg>
  </div>
);

const InstagramIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FacebookIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const socials = [
  { icon: <InstagramIcon />, label: "Instagram", href: "#" },
  { icon: <FacebookIcon />, label: "Facebook", href: "#" },
  { icon: <YoutubeIcon />, label: "YouTube", href: "#" },
  { icon: <WhatsAppIcon />, label: "WhatsApp", href: "#" },
];

const footerLinks = {
  Shop: [
    { label: "Rudraksha Beads", href: "/shop?cat=Rudraksha" },
    { label: "Sacred Gemstones", href: "/shop?cat=Gemstones" },
    { label: "Vedic Bracelets", href: "/shop?cat=Bracelets" },
    { label: "Puja Samagri", href: "/shop?cat=Puja Samagri" },
    { label: "Yantras", href: "/shop?cat=Yantras" },
  ],
  Support: [
    { label: "Book Consultation", href: "https://www.seemaaastrologer.com/" },
    { label: "Track Your Order", href: "/orders" },
    { label: "Returns & Exchange", href: "/policy" },
    { label: "Shipping Policy", href: "/policy" },
    { label: "FAQ", href: "/faq" },
  ],
  Company: [
    { label: "Our Story", href: "#about" },
    { label: "Astrologer Profile", href: "#" },
    { label: "Lab Certifications", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const trustBadges = [
  { icon: "🔬", text: "Lab Certified" },
  { icon: "🙏", text: "Energised & Blessed" },
  { icon: "🚚", text: "Pan India Delivery" },
  { icon: "↩️", text: "Easy Returns" },
];

const contacts = [
  { icon: "📍", text: "Chandigarh, India" },
  { icon: "📞", text: "+91 98765 43210" },
  { icon: "✉️", text: "hello@diviyavedic.com" },
  { icon: "🕐", text: "Mon–Sat, 10 AM–7 PM" },
];

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <>
      <Keyframes />

      <div
        className="w-full border-t border-b border-amber-900/10 py-3"
        style={{ background: "#fff" }}
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustBadges.map((b) => (
            <div
              key={b.text}
              className="flex items-center justify-center gap-2.5"
            >
              <span className="text-lg">{b.icon}</span>
              <span
                className="text-amber-900 font-semibold"
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                }}
              >
                {b.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <footer className="relative overflow-hidden bg-stone-50">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 15% 50%,rgba(180,83,9,0.03) 0%,transparent 65%)," +
              "repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(217,119,6,0.02) 60px,rgba(217,119,6,0.02) 61px)," +
              "repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(217,119,6,0.02) 60px,rgba(217,119,6,0.02) 61px)",
          }}
        />
        <OmBg />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-6">
          <div
            className="flex flex-col lg:flex-row gap-8 mb-8 pb-8"
            style={{ borderBottom: "1px solid rgba(180,83,9,0.1)" }}
          >
            <div className="lg:w-72 shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <OmLogo size={40} />
                <div className="flex flex-col leading-none">
                  <span
                    className="text-stone-900 font-semibold"
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: 13,
                      letterSpacing: "0.08em",
                    }}
                  >
                    Diviya Vedic Shop
                  </span>
                  <span
                    className="text-amber-700/60 italic mt-1"
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: 11,
                      letterSpacing: "0.15em",
                    }}
                  >
                    vedic astrology &amp; gemstones
                  </span>
                </div>
              </div>

              <p
                className="italic leading-relaxed mb-5"
                style={{
                  fontFamily: "'EB Garamond',serif",
                  fontSize: 13,
                  color: "rgba(28,25,23,0.7)",
                  lineHeight: 1.7,
                }}
              >
                Ancient Vedic wisdom for modern lives through sacred gemstones
                and Rudraksha, energised with intention.
              </p>

              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex items-center justify-center w-8 h-8 rounded-lg no-underline transition-all duration-200"
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(180,83,9,0.15)",
                      color: "rgba(180,83,9,0.6)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#b45309";
                      e.currentTarget.style.color = "#b45309";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(180,83,9,0.15)";
                      e.currentTarget.style.color = "rgba(180,83,9,0.6)";
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex-1 lg:pl-6">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-px flex-1"
                  style={{
                    background:
                      "linear-gradient(90deg,rgba(180,83,9,0.15),transparent)",
                  }}
                />
                <span
                  className="uppercase text-amber-700"
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: "8px",
                    letterSpacing: "0.3em",
                  }}
                >
                  Newsletter
                </span>
                <div
                  className="h-px flex-1"
                  style={{
                    background:
                      "linear-gradient(270deg,rgba(180,83,9,0.15),transparent)",
                  }}
                />
              </div>

              <h3
                className="text-stone-900 font-light text-center mb-1"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "24px",
                }}
              >
                Receive <em className="text-amber-700 italic">Cosmic</em>{" "}
                Updates
              </h3>

              {subscribed ? (
                <div className="flex items-center justify-center py-3 rounded-xl bg-amber-50 border border-amber-200 mt-4">
                  <span
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: "10px",
                      color: "#b45309",
                      letterSpacing: "0.1em",
                    }}
                  >
                    ✦ Blessings sent to your inbox
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-2 mt-4 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2 rounded-lg outline-none text-sm border border-stone-200 bg-white focus:border-amber-500 transition-all"
                    style={{ fontFamily: "'EB Garamond',serif" }}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                    style={{
                      background: "linear-gradient(135deg,#b45309,#92400e)",
                      color: "#fff",
                      fontFamily: "'Cinzel',serif",
                      fontSize: "9px",
                      letterSpacing: "0.15em",
                    }}
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 pb-6"
            style={{ borderBottom: "1px solid rgba(180,83,9,0.1)" }}
          >
            {Object.entries(footerLinks).map(([col, links]) => (
              <div key={col}>
                <h4
                  className="uppercase mb-4"
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: "8.5px",
                    letterSpacing: "0.25em",
                    color: "#b45309",
                  }}
                >
                  {col}
                </h4>

                <ul className="list-none m-0 p-0 flex flex-col gap-2">
                  {links.map((lnk) => (
                    <li key={lnk.label}>
                      <button
                        onClick={() => {
                          if (lnk.href.startsWith("/")) {
                            navigate(lnk.href);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          } else if (lnk.href.startsWith("#")) {
                            const element = document.querySelector(lnk.href);
                            element?.scrollIntoView({ behavior: "smooth" });
                          } else {
                            window.open(lnk.href, "_blank");
                          }
                        }}
                        className="bg-transparent border-none p-0 italic text-left transition-colors duration-200 text-stone-600 hover:text-amber-700 cursor-pointer"
                        style={{
                          fontFamily: "'EB Garamond',serif",
                          fontSize: 13,
                        }}
                      >
                        {lnk.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-between gap-4 mb-8">
            {contacts.map((c) => (
              <div key={c.text} className="flex items-center gap-2">
                <span className="text-sm shrink-0">{c.icon}</span>
                <span
                  className="italic text-stone-500"
                  style={{ fontFamily: "'EB Garamond',serif", fontSize: 12 }}
                >
                  {c.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200 pt-6">
            <p
              className="italic m-0 text-stone-400"
              style={{ fontFamily: "'EB Garamond',serif", fontSize: 12 }}
            >
              © {new Date().getFullYear()} Diviya Vedic Shop.
            </p>

            <div className="flex items-center gap-2">
              <span
                className="italic text-stone-400"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 12,
                  letterSpacing: "0.05em",
                }}
              >
                Pure · Energised · Lab Certified
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
