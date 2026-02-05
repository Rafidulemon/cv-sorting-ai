import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

// Offline-safe font fallbacks: avoid build-time fetch from Google Fonts
const ibmPlexSans = { variable: "" };
const jetbrainsMono = { variable: "" };

export const metadata: Metadata = {
  title: "CV Sort AI",
  description: "AI-driven CV analysis and shortlisting dashboard",
  icons: {
    icon: "/logo/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
