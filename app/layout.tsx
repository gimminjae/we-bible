import { ThemeModeScript } from "flowbite-react"
import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/header/Header"
import { Geist, Geist_Mono } from "next/font/google"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "We Bible",
  description: "we bible together",
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
