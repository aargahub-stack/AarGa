"use client";

const PARTNERS = [
  { name: "AarCode", src: "/partners/AarCode.png", needsInvert: false },
  { name: "NexFix", src: "/partners/nexfix-logo.png", needsInvert: false },
  { name: "Artxa Frames", src: "/partners/artsa-frames-dark.webp", needsInvert: true },
  { name: "Namma Stay", src: "/partners/namma-stay-dark.webp", needsInvert: true },
  { name: "SNX", src: "/partners/snx-dark.webp", needsInvert: true },
  { name: "Tamizhar Startup", src: "/partners/tamizhar-startup-dark.webp", needsInvert: true },
  { name: "SaaS Connect", src: "/partners/saas-connect.webp", needsInvert: false },
  { name: "TN-34", src: "/partners/tn-34.png", needsInvert: false },
];

export default function BrandCarousel() {
  return (
    <section className="relative w-full overflow-hidden bg-paper border-b border-slate-200/80 py-8 sm:py-10">
      {/* Subtle background matrix grid dots matching MatrixHero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,240,118,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,118,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Caption Header */}
        <div className="text-center pb-5 sm:pb-6">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.28em] text-slate-500 uppercase">
            Ecosystem Partners &amp; Allies
          </p>
        </div>

        {/* Marquee Strip with optical side gradient masks */}
        <div className="relative w-full overflow-hidden mask-gradient py-2">
          <div className="animate-marquee flex items-center gap-12 sm:gap-16 md:gap-20">
            {/* Primary Set */}
            <div className="flex items-center gap-12 sm:gap-16 md:gap-20 shrink-0">
              {PARTNERS.map((partner, idx) => (
                <div
                  key={`partner-1-${idx}`}
                  className="flex h-12 sm:h-14 items-center justify-center shrink-0 px-2 cursor-pointer transition-all duration-300 hover:scale-105"
                  title={partner.name}
                >
                  <img
                    src={partner.src}
                    alt={partner.name}
                    className={`h-8 sm:h-9 w-auto max-w-[130px] sm:max-w-[160px] object-contain transition-all duration-300 ${
                      partner.needsInvert
                        ? "brightness-0 opacity-65 hover:opacity-100"
                        : "opacity-75 hover:opacity-100"
                    }`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Cloned Set for Seamless Infinite Loop */}
            <div className="flex items-center gap-12 sm:gap-16 md:gap-20 shrink-0" aria-hidden="true">
              {PARTNERS.map((partner, idx) => (
                <div
                  key={`partner-2-${idx}`}
                  className="flex h-12 sm:h-14 items-center justify-center shrink-0 px-2 cursor-pointer transition-all duration-300 hover:scale-105"
                  title={partner.name}
                >
                  <img
                    src={partner.src}
                    alt={partner.name}
                    className={`h-8 sm:h-9 w-auto max-w-[130px] sm:max-w-[160px] object-contain transition-all duration-300 ${
                      partner.needsInvert
                        ? "brightness-0 opacity-65 hover:opacity-100"
                        : "opacity-75 hover:opacity-100"
                    }`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
