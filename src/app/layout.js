import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GlobalLoadingIndicator from "@/components/GlobalLoadingIndicator";

export const metadata = {
  title: "AarGa — One Ecosystem. Two Missions.",
  description:
    "AarGa unifies social impact with enterprise engineering — powering NexFix, Exora, AarVed, and AarCode from one shared platform core.",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-paper text-ink antialiased selection:bg-emerald-200">
        <GlobalLoadingIndicator />
        <SiteHeader />
        <div className="min-h-screen">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
