import { initDatabase } from '../lib/db';
import './globals.css';


if (typeof window === 'undefined') {
  initDatabase().catch(error => {
    console.error('Database initialization failed:', error.message);
 
  });
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>{children}</body>
    </html>
  );
}
