import "./globals.css"

import type { Metadata } from "next"

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
      <body className="bg-gray-100 text-black">
        {children}
      </body>
    </html>
  )
}