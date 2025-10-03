import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shadr - Mesmerizing Shader Canvas",
  description: "Experience stunning GLSL animations in your browser. 4 unique shaders including wavy patterns, fluid ether, swirling vortex, and interactive lines. Install as PWA for full-screen immersion.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  keywords: ["shader", "webgl", "glsl", "animation", "pwa", "art", "visual", "canvas", "interactive"],
  authors: [{ name: "Shadr Team" }],
  creator: "Shadr",
  publisher: "Shadr",
  robots: "index, follow",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shadr"
  },
  openGraph: {
    title: "Shadr - Mesmerizing Shader Canvas ✨",
    description: "🎨 Experience stunning GLSL animations in your browser\n🌊 4 unique visual experiences\n📱 Install as PWA for full-screen magic\n⚡ Real-time WebGL rendering",
    type: "website",
    url: "https://shadr.vercel.app",
    siteName: "Shadr",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shadr - Mesmerizing shader canvas with beautiful GLSL animations",
        type: "image/png"
      }
    ],
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadr - Mesmerizing Shader Canvas ✨",
    description: "🎨 Experience stunning GLSL animations in your browser. 4 unique visual experiences. Install as PWA for full-screen magic!",
    images: ["/og-image.png"],
    creator: "@shadr_app",
    site: "@shadr_app"
  },
  alternates: {
    canonical: "https://shadr.vercel.app"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Shadr" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* Additional Open Graph tags */}
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        
        {/* Twitter tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-image.png" />
        
        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
