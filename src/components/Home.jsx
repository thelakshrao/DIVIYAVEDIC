import { useState, useEffect } from "react";

import gemsImg from "../img/gems.png";
import navratriImg from "../img/navratrisamagri.png";
import pujaImg from "../img/pujasamagri.png";
import rudrashaImg from "../img/rudraksha.png";
import vedicImg from "../img/vedicbracelets.png";
import CollageSection from "./CollageSection";
import ItemsAtFront from "./ItemsAtFront";
import Consult from "./Consult";

const heroSlides = [
  {
    img: navratriImg,
    headline: "Celebrate the Sacred",
    sub: "Navratri Kits Now Available",
  },
  {
    img: gemsImg,
    headline: "Wear Your Destiny",
    sub: "Planetary Gems, Blessed & Certified",
  },
  {
    img: rudrashaImg,
    headline: "Connect with Shiva",
    sub: "Authentic Himalayan Rudraksha",
  },
];

const ORBIT_DOTS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function Home() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setSlide((s) => (s + 1) % heroSlides.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 text-stone-800 font-serif-base">
      {/* ── HERO ── */}
      <section id="home" className="relative h-[50vh] min-h-80 overflow-hidden">
        {/* Slides */}
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === slide ? 1 : 0 }}
          >
            <div className="w-full h-full overflow-hidden">
              <img
                src={s.img}
                alt={s.headline}
                className="w-full object-cover object-center"
                style={{ height: "calc(100% + 32px)", marginTop: "-4px" }}
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-r from-amber-950/70 via-amber-900/30 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-l from-amber-950/60 via-amber-900/20 to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between px-5 md:px-20 max-w-7xl mx-auto w-full">
          {/* Text */}
          <div className="max-w-[58%] md:max-w-xl">
            <span className="inline-block mb-2 md:mb-3 text-amber-300 text-[10px] md:text-xs uppercase tracking-[4px] md:tracking-[5px]">
              Diviya Vedic Shop
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-snug">
              {heroSlides[slide].headline}
            </h1>
            <p className="mt-2 md:mt-3 text-amber-200 text-sm md:text-lg">
              {heroSlides[slide].sub}
            </p>
            <div className="mt-5 md:mt-8 flex flex-col md:flex-row gap-2 md:gap-3">
              <a
                href="#products"
                className="px-5 md:px-7 py-2.5 md:py-3 rounded-full bg-amber-600 text-white text-xs md:text-sm font-semibold hover:bg-amber-700 transition-all duration-200 shadow-lg text-center"
              >
                Shop Sacred Items
              </a>
              <a
                href="#about"
                className="px-5 md:px-7 py-2.5 md:py-3 rounded-full border border-white text-white text-xs md:text-sm hover:bg-white/10 transition-all duration-200 text-center"
              >
                Our Story
              </a>
            </div>
          </div>

          {/* OM Symbol */}
          <div
            className="flex items-center justify-center relative shrink-0"
            style={{
              width: "clamp(130px,28vw,320px)",
              height: "clamp(130px,28vw,320px)",
            }}
          >
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full animate-pulse-glow"
              style={{
                background:
                  "radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(180,83,9,0.10) 60%, transparent 100%)",
              }}
            />
            {/* Spinning rings */}
            <div
              className="absolute rounded-full border border-amber-300/25 animate-spin-slow"
              style={{ inset: "5%" }}
            />
            <div
              className="absolute rounded-full border border-amber-300/15 animate-spin-reverse-28"
              style={{ inset: "10%" }}
            />

            {/* Orbit dots */}
            {ORBIT_DOTS.map((deg, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-amber-300/60"
                style={{
                  width: "2.5%",
                  height: "2.5%",
                  top: `${50 - 44 * Math.cos((deg * Math.PI) / 180)}%`,
                  left: `${50 + 44 * Math.sin((deg * Math.PI) / 180)}%`,
                  transform: "translate(-50%,-50%)",
                }}
              />
            ))}

            {/* OM SVG */}
            <svg
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 animate-float"
              style={{
                width: "62%",
                height: "62%",
                filter:
                  "drop-shadow(0 0 24px rgba(251,191,36,0.7)) drop-shadow(0 0 8px rgba(251,191,36,0.9))",
              }}
            >
              <defs>
                <linearGradient id="omGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="30%" stopColor="#fcd34d" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient
                  id="omGold2"
                  x1="100%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fef9c3" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <filter id="glow">
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
                fill="url(#omGold)"
                filter="url(#glow)"
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
                stroke="url(#omGold2)"
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
                stroke="url(#omGold)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>

            {/* दिव्य label */}
            <div className="absolute bottom-[9%] left-1/2 -translate-x-1/2 z-10 text-center whitespace-nowrap">
              <p
                className="text-amber-300/90 uppercase font-serif tracking-[5px]"
                style={{ fontSize: "clamp(7px,1.6vw,10px)" }}
              >
                दिव्य
              </p>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === slide ? "bg-amber-400 w-5" : "bg-white/50 w-2"}`}
            />
          ))}
        </div>
      </section>

      <CollageSection />
      <ItemsAtFront />
      <Consult />
    </div>
  );
}
