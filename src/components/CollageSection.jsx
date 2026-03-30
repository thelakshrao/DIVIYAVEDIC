import { useState, useEffect } from "react";
import gemsImg from "../img/gems.png";
import navratriImg from "../img/navratrisamagri.png";
import pujaImg from "../img/pujasamagri.png";
import rudrashaImg from "../img/rudraksha.png";
import vedicImg from "../img/vedicbracelets.png";

const images = [
  { src: gemsImg, label: "Sacred Gems", accent: "#b45309" },
  { src: navratriImg, label: "Navratri Samagri", accent: "#be123c" },
  { src: pujaImg, label: "Puja Samagri", accent: "#7c3aed" },
  { src: rudrashaImg, label: "Rudraksha", accent: "#854d0e" },
  { src: vedicImg, label: "Vedic Bracelets", accent: "#0f766e" },
];

const ORBIT_DOTS = [0, 45, 90, 135, 180, 225, 270, 315];

function FanCarousel() {
  const [center, setCenter] = useState(0);
  const n = images.length;

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
  );
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCenter((c) => (c + 1) % n), 3000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCenter((c) => (c - 1 + n) % n);
  const next = () => setCenter((c) => (c + 1) % n);

  const getPos = (i) => {
    let d = i - center;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const config = isMobile
    ? {
        "-2": { scale: 0.48, x: "-90%", z: 1, opacity: 0.35, blur: 2 },
        "-1": { scale: 0.66, x: "-52%", z: 2, opacity: 0.65, blur: 1 },
        0: { scale: 0.92, x: "0%", z: 5, opacity: 1.0, blur: 0 },
        1: { scale: 0.66, x: "52%", z: 2, opacity: 0.65, blur: 1 },
        2: { scale: 0.48, x: "90%", z: 1, opacity: 0.35, blur: 2 },
      }
    : {
        "-2": { scale: 0.52, x: "-108%", z: 1, opacity: 0.45, blur: 2 },
        "-1": { scale: 0.72, x: "-62%", z: 2, opacity: 0.7, blur: 1 },
        0: { scale: 1.0, x: "0%", z: 5, opacity: 1.0, blur: 0 },
        1: { scale: 0.72, x: "62%", z: 2, opacity: 0.7, blur: 1 },
        2: { scale: 0.52, x: "108%", z: 1, opacity: 0.45, blur: 2 },
      };

  const cardW = isMobile ? "150px" : "200px";
  const cardH = isMobile ? "200px" : "260px";
  const wrapH = isMobile ? "240px" : "340px";

  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{ height: wrapH }}
    >
      {images.map((img, i) => {
        const d = getPos(i);
        if (Math.abs(d) > 2) return null;
        const c = config[String(d)];
        const isCenter = d === 0;

        return (
          <div
            key={i}
            onClick={() => !isCenter && setCenter(i)}
            className="absolute rounded-2xl overflow-hidden cursor-pointer"
            style={{
              width: cardW,
              height: cardH,
              transform: `translateX(${c.x}) scale(${c.scale})`,
              zIndex: c.z,
              opacity: c.opacity,
              filter: c.blur ? `blur(${c.blur}px)` : "none",
              transition: "all 0.55s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: isCenter
                ? "0 20px 50px rgba(0,0,0,0.25)"
                : "0 6px 20px rgba(0,0,0,0.12)",
            }}
          >
            <img
              src={img.src}
              alt={img.label}
              className="w-full h-full object-cover block"
              style={{ objectPosition: "center 20%" }}
            />
            <div className="absolute bottom-0 right-0 w-30 h-7 bg-black/55 rounded-br-2xl z-10" />

            {isCenter && (
              <div
                className="absolute inset-0 rounded-2xl z-20"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)",
                }}
              />
            )}
            {isCenter && (
              <div className="absolute bottom-3.5 left-0 right-0 z-30 text-center">
                <p className="text-white text-xs font-bold tracking-[1px]">
                  {img.label}
                </p>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8.5 h-8.5 rounded-full bg-white border border-amber-300 shadow-md flex items-center justify-center cursor-pointer text-amber-700 text-lg"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8.5 h-8.5 rounded-full bg-white border border-amber-300 shadow-md flex items-center justify-center cursor-pointer text-amber-700 text-lg"
      >
        ›
      </button>

      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCenter(i)}
            className="h-1.5 rounded-full border-none cursor-pointer p-0 transition-all duration-300"
            style={{
              width: i === center ? "18px" : "6px",
              background: i === center ? "#b45309" : "#fcd34d",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CollageSection() {
  return (
    <section className="bg-white py-12 md:py-20 px-5 md:px-6 relative overflow-hidden">
      <div className="absolute -bottom-20 -right-15 w-87.5 h-87.5 z-0 pointer-events-none select-none">
        <div
          className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,0.12) 0%, rgba(180,83,9,0.06) 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute rounded-full border border-amber-300/20 animate-spin-slow"
          style={{ inset: "14px" }}
        />
        <div
          className="absolute rounded-full border border-amber-300/12 animate-spin-reverse-28"
          style={{ inset: "28px" }}
        />

        {ORBIT_DOTS.map((deg, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-300/40"
            style={{
              width: "3px",
              height: "3px",
              top: `${50 - 44 * Math.cos((deg * Math.PI) / 180)}%`,
              left: `${50 + 44 * Math.sin((deg * Math.PI) / 180)}%`,
              transform: "translate(-50%,-50%)",
            }}
          />
        ))}

        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute animate-float opacity-[0.22]"
          style={{
            inset: "40px",
            width: "200px",
            height: "200px",
            filter:
              "drop-shadow(0 0 18px rgba(251,191,36,0.5)) drop-shadow(0 0 6px rgba(251,191,36,0.7))",
          }}
        >
          <defs>
            <linearGradient id="omGoldBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="30%" stopColor="#fcd34d" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="omGold2Bg" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <filter id="glowBg">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
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
            fill="url(#omGoldBg)"
            filter="url(#glowBg)"
            style={{ letterSpacing: "-4px" }}
          >
            ॐ
          </text>
          <text
            x="100"
            y="135"
            textAnchor="middle"
            fontSize="130"
            fontFamily="serif"
            fill="none"
            stroke="url(#omGold2Bg)"
            strokeWidth="0.5"
            opacity="0.6"
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
            stroke="url(#omGoldBg)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 md:gap-12 items-start font-serif-base relative z-10">
        <div className="lg:w-[42%] w-full">
          <p className="text-xs uppercase tracking-[6px] text-amber-600 mb-2 md:mb-3">
            What We Offer
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 leading-snug mb-3 md:mb-4">
            Authentic Vedic Products
            <br />
            for Body, Mind &amp; Soul
          </h2>
          <div className="w-10 h-1 bg-amber-500 rounded-full mb-4 md:mb-5" />

          <p className="text-stone-500 text-sm leading-relaxed mb-3">
            Diviya brings you sacred gems, Rudraksha beads, puja samagri and
            mantra-engraved jewellery — each piece sourced from artisans who
            have guarded these traditions for generations.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mb-3">
            Setting up a mandir, preparing for a festival, or gifting something
            meaningful — Diviya is your one trusted destination for all things
            Vedic.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mb-4 md:mb-5">
            We also craft custom gemstone rings set with the stone prescribed
            for your birth chart — every piece made with intention, blessed with
            purpose.
          </p>

          <div className="flex gap-3 flex-wrap">
            <a
              href="#productlisted"
              className="px-5 md:px-6 py-2.5 rounded-full bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-all duration-200 shadow-md"
            >
              Browse Collection
            </a>
          </div>
        </div>

        <div className="lg:w-[58%] w-full flex items-center justify-center pt-8 md:pt-10">
          <div className="w-full max-w-120">
            <FanCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
