import "./globals.css"

import type { Metadata } from "next";
import { ThemeProvider } from "../../components/ThemeProvider";

export const metadata: Metadata = {
  title: "Memrise Alike",
  description: "Swipe-based learning app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="">
        <ThemeProvider>
        {children}
        </ThemeProvider>
      </body>
    </html>
  )
}