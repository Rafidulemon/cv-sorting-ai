"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { UploadOverlayProvider } from "./components/upload/UploadOverlayProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UploadOverlayProvider>{children}</UploadOverlayProvider>
    </SessionProvider>
  );
}
