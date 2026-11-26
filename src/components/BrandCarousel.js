"use client";

import Image from "next/image";

const PARTNERS = [
  { name: "Artxa Frames", src: "/partners/artsa-frames-dark.webp" },
  { name: "Namma Stay", src: "/partners/namma-stay-dark.webp" },
  { name: "SNX", src: "/partners/snx-dark.webp" },
  { name: "Tamizhar Startup", src: "/partners/tamizhar-startup-dark.webp" },
  { name: "SaaS Connect", src: "/partners/saas-connect.webp" },
  { name: "TN-34", src: "/partners/tn-34.png" },
];

export default function BrandCarousel() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0C0D0E] border-y border-white/10 py-8 sm:py-10 shadow-2xl">
      {/* Subtle background brand watermark */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none opacity-[0.02]"
      >
        <span className="text-8xl sm:text-9xl font-black tracking-widest text-white">
          AARGA
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Caption Header */}
        <div className="text-center pb-5 sm:pb-6">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.28em] text-slate-400 uppercase">
            Backed by Brands Who Bet on Bold
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
                    className="h-8 sm:h-10 w-auto max-w-[130px] sm:max-w-[170px] object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 filter brightness-110"
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
                    className="h-8 sm:h-10 w-auto max-w-[130px] sm:max-w-[170px] object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 filter brightness-110"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optical hairline accent border at bottom */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F076]/30 to-transparent" 
      />
    </section>
  );
}
