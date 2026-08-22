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
    "AarGa is a multi-product SaaS ecosystem with grassroots NGO roots — powering PayCircle, Nexfix, AarFlow, Exora, VeriSkill, and GridPay from one shared platform core.",
  metadataBase: new URL("https://aarga.org"),
  openGraph: {
    title: "AarGa — One Ecosystem. Two Missions.",
    description:
      "A multi-product SaaS ecosystem with grassroots NGO roots.",
    url: "https://aarga.org",
    siteName: "AarGa",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${urbanist.variable} ${jetbrainsMono.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans bg-paper text-ink antialiased selection:bg-emerald-200">
        <SiteHeader />
        <main className="min-h-screen">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
