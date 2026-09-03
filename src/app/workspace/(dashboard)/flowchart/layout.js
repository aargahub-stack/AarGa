import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "Flowchart Maker — AarGa Workspace",
  description: "Custom drag-and-drop flowchart builder for AarGa Workspace.",
};

export default function FlowchartLayout({ children }) {
  return (
    <div className={`${spaceGrotesk.variable} font-sans min-h-[calc(100vh-80px)]`}>
      {children}
    </div>
  );
}
