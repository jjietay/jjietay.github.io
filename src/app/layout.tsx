import type { Metadata } from "next";
import { DM_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const text = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-text" });
const head = Space_Grotesk({ subsets: ["latin"], weight: ["500"], variable: "--font-head" });

export const metadata: Metadata = {
  title: { default: "Juen Jie Tay, robotics and AI", template: "%s | Juen Jie Tay" },
  description: "Juen Jie Tay builds embodied AI for real robots: a UR5e VLA comparison, an autonomous tank and RF drone detection.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${text.variable} ${head.variable}`}>
      <body>
        {/* The filter that gives lines their hand-drawn wobble. */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="wob"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="7" /></filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
