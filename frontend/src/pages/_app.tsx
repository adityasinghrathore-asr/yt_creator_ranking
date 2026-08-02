/**
 * frontend/src/pages/_app.tsx
 * ----------------------------
 * Next.js App wrapper. Provides TanStack Query client to the whole app.
 */

import type { AppProps } from "next/app";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
