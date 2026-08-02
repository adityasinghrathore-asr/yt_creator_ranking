/**
 * frontend/next.config.ts
 * ------------------------
 * All values come from the monorepo-root config.yaml via config.ts.
 * To change the API URL, image domains, or port — edit config.yaml only.
 */

import type { NextConfig } from "next";
import { frontendConfig } from "./config";

const nextConfig: NextConfig = {
  images: {
    domains: frontendConfig.imageDomains,
  },

  env: {
    NEXT_PUBLIC_API_BASE_URL: frontendConfig.apiBaseUrl,
    NEXT_PUBLIC_APP_NAME: frontendConfig.appName,
    NEXT_PUBLIC_APP_VERSION: frontendConfig.appVersion,
    NEXT_PUBLIC_DATA_MODE: frontendConfig.dataMode,
    NEXT_PUBLIC_CONFIRMATION_MIN_DWELL_MS: String(
      frontendConfig.confirmationMinDwellMs
    ),
  },

  // Static export for Cloud Storage deployment
  output: "export",
};

export default nextConfig;
