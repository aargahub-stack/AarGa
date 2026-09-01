import { Urbanist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "AarGa — One Ecosystem. Two Missions.",
  description:
    "AarGa unifies social impact with enterprise engineering — powering NexFix, Exora, and AarVed from one shared platform core.",
  metadataBase: new URL("https://aarga.org"),
  icons: {
    icon: "/aarga-logo.png",
    shortcut: "/aarga-logo.png",
    apple: "/aarga-logo.png",
  },
  openGraph: {
    title: "AarGa — One Ecosystem. Two Missions.",
    description:
      "AarGa unifies social impact with enterprise engineering.",
    url: "https://aarga.org",
    siteName: "AarGa",
    images: [
      {
        url: "/aarga-logo.png",
        width: 1200,
        height: 630,
        alt: "AarGa Ecosystem Logo",
      },
    ],
    type: "website",
  },
};

import GlobalLoadingIndicator from "@/components/GlobalLoadingIndicator";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${urbanist.variable} ${jetbrainsMono.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans bg-paper text-ink antialiased selection:bg-emerald-200">
        <GlobalLoadingIndicator />
        <SiteHeader />
        <div className="min-h-screen">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
