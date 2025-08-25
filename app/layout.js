'use client'

import { SessionProvider } from "next-auth/react"
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Fire Mission - Dashboard</title>
        <meta name="description" content="Fire Mission - Your personal notes, goals, and events dashboard." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="background-color" content="#ffffff" />
        <meta name="author" content="Jesse Roper" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://fire-mission.vercel.app" />

        {/* Open Graph */}
        <meta property="og:title" content="Fire Mission - Dashboard" />
        <meta property="og:description" content="Manage your notes, goals, and events in one place." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fire-mission.vercel.app" />
        <meta property="og:image" content="https://fire-mission.vercel.app/og-image.png" />
        <meta property="og:site_name" content="Fire Mission" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fire Mission - Dashboard" />
        <meta name="twitter:description" content="Manage your notes, goals, and events in one place." />
        <meta name="twitter:image" content="https://fire-mission.vercel.app/og-image.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
