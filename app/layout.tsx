import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CV Sort AI",
  description: "AI-driven CV analysis and shortlisting dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="relative min-h-screen overflow-hidden bg-transparent text-[#DCE8FA]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#38BDF8]/10 blur-3xl" />
            <div className="absolute top-1/3 -left-20 h-[28rem] w-[28rem] rounded-full bg-[#38BDF8]/06 blur-3xl" />
            <div className="absolute bottom-[-12rem] right-1/4 h-[22rem] w-[22rem] rounded-full bg-[#38BDF8]/04 blur-3xl" />
          </div>

          <Header />

          <main className="relative py-10 sm:py-12">
            <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">{children}</div>
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
