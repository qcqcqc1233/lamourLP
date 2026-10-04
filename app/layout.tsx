import type { Metadata, Viewport } from "next"
import { Jost } from "next/font/google"

import "./globals.css"

// One family for everything: Jost, a clean geometric sans that stays legible
// at every size. The stencil wordmark carries the brand's character.
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
    <html lang="en-GB" className={jost.variable}>
      <body>{children}</body>
    </html>
  )
}
