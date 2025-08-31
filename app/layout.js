'use client';

import { SessionProvider } from "next-auth/react";
import "./globals.css";

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

        <meta property="og:title" content="Fire Mission - Dashboard" />
        <meta property="og:description" content="Manage your notes, goals, and events in one place." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fire-mission.vercel.app" />
        <meta property="og:image" content="https://fire-mission.vercel.app/og-image.png" />
        <meta property="og:site_name" content="Fire Mission" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fire Mission - Dashboard" />
        <meta name="twitter:description" content="Manage your notes, goals, and events in one place." />
        <meta name="twitter:image" content="https://fire-mission.vercel.app/og-image.png" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="relative">
        <SessionProvider>{children}</SessionProvider>

        {/* Buy Me a Beer Button */}
        <div className="fixed bottom-4 right-4 z-50">
          <a
            href="https://www.buymeacoffee.com/Jessew"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gray-700 text-white font-bold rounded-lg shadow-lg hover:bg-orange-500 transition-colors flex items-center space-x-2"
          >
            <span>🍺 Buy me a beer</span>
          </a>
        </div>
      </body>
    </html>
  );
}

