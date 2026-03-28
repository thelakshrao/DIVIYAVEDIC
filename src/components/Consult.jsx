import React from "react";
import consultorImg from "../img/consultor.png";

const Particles = () => {
  const glyphs = ["ॐ", "✦", "◈", "✧", "◇", "⋆", "✦", "◈"];
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-amber-400 font-serif"
          style={{
            bottom: "-20px",
            left: `${5 + ((i * 6.3) % 90)}%`,
            fontSize: `${10 + ((i * 3) % 16)}px`,
            opacity: 0.04 + (i % 4) * 0.025,
            animation: `float ${8 + ((i * 1.1) % 10)}s linear ${(i * 0.7) % 6}s infinite`,
          }}
        >
          {glyphs[i % glyphs.length]}
        </span>
      ))}
    </div>
  );
};

const OmGlyph = ({ size = 155 }) => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: size, height: size }}
  >
    <defs>
      <linearGradient id="omGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="35%" stopColor="#fcd34d" />
        <stop offset="70%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
    </defs>
    <circle
      cx="100"
      cy="100"
      r="94"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="1"
      strokeDasharray="5 4"
      opacity="0.28"
    />
    <circle
      cx="100"
      cy="100"
      r="80"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="0.6"
      opacity="0.18"
    />
    <text
      x="100"
      y="140"
      textAnchor="middle"
      fontSize="112"
      fontFamily="serif"
      fill="url(#omGold)"
    >
      ॐ
    </text>
    <circle cx="100" cy="158" r="3" fill="#fcd34d" opacity="0.85" />
    <line
      x1="68"
      y1="165"
      x2="132"
      y2="165"
      stroke="url(#omGold)"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const Keyframes = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Cinzel:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
    @keyframes float      { 0%{transform:translateY(0) rotate(0deg);opacity:0} 10%{opacity:1} 90%{opacity:.5} 100%{transform:translateY(-110vh) rotate(360deg);opacity:0} }
    @keyframes spin-slow  { to{transform:rotate(360deg)} }
    @keyframes spin-rev   { to{transform:rotate(-360deg)} }
    @keyframes glow-pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
    @keyframes om-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes dot-blink  { 0%,100%{opacity:.4} 50%{opacity:1} }
    .spin-slow  { animation: spin-slow  28s linear infinite }
    .spin-rev   { animation: spin-rev   18s linear infinite }
    .glow-pulse { animation: glow-pulse 4.5s ease-in-out infinite }
    .om-float   { animation: om-float   6s ease-in-out infinite }
    .dot-blink  { animation: dot-blink  2s ease-in-out infinite }
  `}</style>
);

const Consult = () => {
  return (
    <>
      <Keyframes />

      {/* ── Section wrapper ── */}
      <section className="relative w-full overflow-hidden bg-stone-950 py-20">
        {/* Radial background glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 50% -5%, rgba(180,83,9,0.28) 0%, transparent 65%), " +
              "radial-gradient(ellipse 45% 38% at 8% 95%, rgba(120,53,15,0.2) 0%, transparent 55%), " +
              "radial-gradient(ellipse 35% 45% at 92% 85%, rgba(251,191,36,0.07) 0%, transparent 50%), " +
              "repeating-linear-gradient(0deg,transparent,transparent 64px,rgba(251,191,36,0.013) 64px,rgba(251,191,36,0.013) 65px), " +
              "repeating-linear-gradient(90deg,transparent,transparent 64px,rgba(251,191,36,0.013) 64px,rgba(251,191,36,0.013) 65px)",
          }}
        />
        <Particles />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div
                className="h-px w-12"
                style={{
                  background: "linear-gradient(90deg,transparent,#f59e0b)",
                }}
              />
              <span
                className="text-amber-400 uppercase tracking-widest"
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: "9.5px",
                  letterSpacing: "0.38em",
                }}
              >
                Vedic Wisdom
              </span>
              <div
                className="h-px w-12"
                style={{
                  background: "linear-gradient(270deg,transparent,#f59e0b)",
                }}
              />
            </div>

            <h2
              className="text-amber-50 font-light leading-tight mb-3"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(34px,4.5vw,58px)",
              }}
            >
              Consult Our <em className="text-amber-400 italic">Expert</em>{" "}
              Astrologer
            </h2>

            <p
              className="text-amber-200 italic"
              style={{
                fontFamily: "'EB Garamond',serif",
                fontSize: "14px",
                letterSpacing: "0.07em",
                opacity: 0.45,
              }}
            >
              Ancient knowledge · Personal guidance · Cosmic alignment
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px_1fr] gap-5 items-start">
            <div
              className="relative rounded-2xl overflow-hidden transition-all duration-300 border"
              style={{
                background: "rgba(255,255,255,0.028)",
                borderColor: "rgba(251,191,36,0.15)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(251,191,36,0.35)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(251,191,36,0.15)")
              }
            >
              {[
                ["top-3 left-3 border-t border-l", ""],
                ["top-3 right-3 border-t border-r", ""],
                ["bottom-3 left-3 border-b border-l", ""],
                ["bottom-3 right-3 border-b border-r", ""],
              ].map(([cls], i) => (
                <div
                  key={i}
                  className={`absolute w-5 h-5 border-amber-400 ${cls}`}
                  style={{ opacity: 0.2 }}
                />
              ))}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(251,191,36,0.04) 0%,transparent 55%)",
                }}
              />

              <div className="flex">
                <div
                  className="relative shrink-0 overflow-hidden"
                  style={{ width: 125 }}
                >
                  <img
                    src={consultorImg}
                    alt="Seemaa Singh"
                    className="w-full h-full object-cover object-top"
                    style={{ minHeight: 230 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to right,transparent 42%,rgba(12,8,5,0.75))",
                    }}
                  />
                  <div
                    className="absolute right-0 top-[8%] bottom-[8%] w-px"
                    style={{
                      background:
                        "linear-gradient(to bottom,transparent,rgba(245,158,11,0.6),transparent)",
                    }}
                  />
                </div>

                <div className="flex-1 flex flex-col gap-3 p-5 justify-between">
                  <div>
                    <div
                      className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 px-3 py-1"
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: "8.5px",
                        letterSpacing: "0.26em",
                        color: "#fbbf24",
                      }}
                    >
                      <span className="w-1.25 h-[1.25 rounded-full bg-amber-400 dot-blink" />
                      Expert Astrologer
                    </div>

                    <h3
                      className="text-amber-50 font-normal mt-3 mb-1 leading-tight"
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 27,
                      }}
                    >
                      Seemaa Singh
                    </h3>
                    <p
                      className="text-amber-500 mb-0"
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: "8.5px",
                        letterSpacing: "0.2em",
                      }}
                    >
                      Research Scholar · Vedic Astrologer
                    </p>
                  </div>

                  <p
                    className="italic leading-relaxed"
                    style={{
                      fontFamily: "'EB Garamond',serif",
                      fontSize: 13,
                      color: "rgba(253,230,138,0.52)",
                    }}
                  >
                    Trained at Bhartiya Vidya Bhawan, Chandigarh. Specialises in
                    gemstone prescription, Rudraksha selection and Vedic
                    bracelet alignment using Mithraism &amp; Occultism.
                  </p>

                  <div
                    className="rounded-xl border px-3 py-2"
                    style={{
                      background: "rgba(251,191,36,0.05)",
                      borderColor: "rgba(251,191,36,0.2)",
                    }}
                  >
                    <p
                      className="uppercase mb-1"
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: "7.5px",
                        letterSpacing: "0.26em",
                        color: "rgba(251,191,36,0.42)",
                      }}
                    >
                      Exclusive discount
                    </p>
                    <span
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#fbbf24",
                        letterSpacing: "0.22em",
                      }}
                    >
                      DIVIYAVEDIC
                    </span>
                    <span
                      className="italic ml-2"
                      style={{
                        fontFamily: "'EB Garamond',serif",
                        fontSize: 11.5,
                        color: "rgba(251,191,36,0.38)",
                      }}
                    >
                      → 10% off
                    </span>
                  </div>

                  <a
                    href="https://www.seemaaastrologer.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full no-underline"
                  >
                    <button
                      className="w-full rounded-xl py-3 text-amber-50 border-0 cursor-pointer transition-all duration-200 hover:opacity-85 hover:-translate-y-px active:translate-y-0"
                      style={{
                        background:
                          "linear-gradient(135deg,#78350f 0%,#b45309 50%,#d97706 100%)",
                        fontFamily: "'Cinzel',serif",
                        fontSize: "9.5px",
                        fontWeight: 500,
                        letterSpacing: "0.26em",
                      }}
                    >
                      Book Consultation
                    </button>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center lg:row-span-2">
              <div
                className="relative flex items-center justify-center"
                style={{ width: 240, height: 240 }}
              >
                <div
                  className="absolute inset-0 rounded-full border spin-slow"
                  style={{ borderColor: "rgba(251,191,36,0.13)" }}
                />

                <div
                  className="absolute rounded-full border spin-rev"
                  style={{
                    inset: 14,
                    borderStyle: "dashed",
                    borderColor: "rgba(251,191,36,0.09)",
                  }}
                />

                <div
                  className="absolute rounded-full glow-pulse"
                  style={{
                    inset: 22,
                    background:
                      "radial-gradient(circle,rgba(251,191,36,0.15) 0%,transparent 70%)",
                  }}
                />

                <div
                  className="relative z-10 om-float"
                  style={{
                    filter:
                      "drop-shadow(0 0 28px rgba(251,191,36,0.55)) drop-shadow(0 0 6px rgba(251,191,36,0.9))",
                  }}
                >
                  <OmGlyph size={155} />
                </div>
              </div>

              <p
                className="text-amber-400 font-light mt-3 text-center"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 22,
                  letterSpacing: "0.14em",
                }}
              >
                दिव्य
              </p>
              <p
                className="uppercase text-center mt-1"
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: "8.5px",
                  letterSpacing: "0.38em",
                  color: "rgba(251,191,36,0.38)",
                }}
              >
                Divine Guidance
              </p>

              <div
                className="w-px flex-1 mt-5"
                style={{
                  minHeight: 36,
                  background:
                    "linear-gradient(to bottom,rgba(251,191,36,0.28),transparent)",
                }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { n: "20+", l: "Years Experience" },
                  { n: "50k+", l: "Consultations" },
                  { n: "4.9★", l: "Client Rating" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-2xl text-center py-4 px-2 border transition-all duration-300 cursor-default"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      borderColor: "rgba(251,191,36,0.12)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(251,191,36,0.3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(251,191,36,0.12)")
                    }
                  >
                    <span
                      className="block text-amber-400 font-light leading-none"
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 30,
                      }}
                    >
                      {s.n}
                    </span>
                    <span
                      className="block mt-1 uppercase"
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: "7px",
                        letterSpacing: "0.2em",
                        color: "rgba(251,191,36,0.38)",
                      }}
                    >
                      {s.l}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(251,191,36,0.1)",
                }}
              >
                <p
                  className="uppercase mb-4"
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: "8.5px",
                    letterSpacing: "0.3em",
                    color: "rgba(251,191,36,0.45)",
                  }}
                >
                  Areas of Expertise
                </p>
                {[
                  "Gemstone prescription & alignment",
                  "Rudraksha selection & energisation",
                  "Vedic bracelet compatibility",
                  "Birth chart analysis · Kundali",
                  "Mithraism & Occult studies",
                ].map((item, i, arr) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 py-1.5"
                    style={{
                      borderBottom:
                        i < arr.length - 1
                          ? "1px solid rgba(251,191,36,0.06)"
                          : "none",
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-amber-500 shrink-0"
                      style={{ opacity: 0.55 }}
                    />
                    <span
                      className="italic"
                      style={{
                        fontFamily: "'EB Garamond',serif",
                        fontSize: 13,
                        color: "rgba(253,230,138,0.6)",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="lg:col-span-3 relative rounded-2xl border flex items-start gap-6 px-7 py-6 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.022)",
                borderColor: "rgba(251,191,36,0.11)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg,transparent 5%,rgba(251,191,36,0.45) 30%,rgba(251,191,36,0.45) 70%,transparent 95%)",
                }}
              />

              <div
                className="shrink-0 mt-0.5 leading-none"
                style={{
                  fontFamily: "serif",
                  fontSize: 28,
                  color: "#f59e0b",
                  opacity: 0.65,
                }}
              >
                ☽
              </div>

              <div>
                <p
                  className="uppercase mb-2"
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#fef3c7",
                    letterSpacing: "0.15em",
                  }}
                >
                  Before wearing gemstones or Vedic bracelets
                </p>
                <p
                  className="italic leading-relaxed mb-4"
                  style={{
                    fontFamily: "'EB Garamond',serif",
                    fontSize: 14,
                    color: "rgba(253,230,138,0.48)",
                    lineHeight: 1.72,
                  }}
                >
                  Always consult a certified astrologer before wearing any
                  gemstone or Vedic bracelet. The wrong stone can have adverse
                  effects on your energy and life. Our in-house astrologer
                  Seemaa Singh analyses your birth chart to recommend only what
                  truly aligns with you.
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="italic"
                    style={{
                      fontFamily: "'EB Garamond',serif",
                      fontSize: 13,
                      color: "rgba(253,230,138,0.38)",
                    }}
                  >
                    Consult via our website · use coupon
                  </span>
                  <span
                    className="rounded-full px-3 py-1"
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: "9.5px",
                      fontWeight: 600,
                      letterSpacing: "0.2em",
                      color: "#0a0704",
                      background: "linear-gradient(135deg,#fcd34d,#f59e0b)",
                    }}
                  >
                    DIVIYAVEDIC
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: "9.5px",
                      letterSpacing: "0.14em",
                      color: "#f59e0b",
                    }}
                  >
                    for 10% off your consultation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Consult;
