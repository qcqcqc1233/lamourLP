import type { Metadata, Viewport } from "next"
import { Bodoni_Moda, Jost } from "next/font/google"

import "./globals.css"

// Bodoni for display: the same hairline-and-weight contrast as the stencil
// wordmark. Jost for everything a visitor reads or taps.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
})

const jost = Jost({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-jost",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://lamoure-eyebag.vercel.app"),
}

export const viewport: Viewport = {
  themeColor: "#f4f0e7",
  colorScheme: "light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${bodoni.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  )
}
