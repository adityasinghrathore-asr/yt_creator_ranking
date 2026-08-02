/**
 * frontend/config.ts
 * ------------------
 * Reads the monorepo-root config.yaml and exposes typed frontend config.
 * This file is consumed by next.config.ts at build time so that all
 * frontend environment variables flow from one place: config.yaml.
 *
 * Usage in next.config.ts:
 *   import { frontendConfig } from "./config";
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// config.yaml lives two levels up: frontend/ → root/
const CONFIG_PATH = path.resolve(__dirname, "../config.yaml");

interface RawConfig {
  app: {
    name: string;
    version: string;
    environment: string;
    debug: boolean;
  };
  data_mode: string;
  infrastructure: {
    backend_port: number;
    frontend_port: number;
  };
  frontend: {
    api_base_url: string;
    image_domains: string[];
    confirmation_min_dwell_ms: number;
  };
  security: {
    cors_origins: string[];
  };
}

function loadConfig(): RawConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      `config.yaml not found at ${CONFIG_PATH}. ` +
        "Run from the monorepo root or check your working directory."
    );
  }
  return yaml.load(fs.readFileSync(CONFIG_PATH, "utf8")) as RawConfig;
}

const raw = loadConfig();

export const frontendConfig = {
  appName: raw.app.name,
  appVersion: raw.app.version,
  environment: raw.app.environment,
  debug: raw.app.debug,
  dataMode: raw.data_mode,

  /** Base URL for all backend API calls */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? raw.frontend.api_base_url,

  /** Domains allowed for next/image optimisation */
  imageDomains: raw.frontend.image_domains,

  /**
   * Minimum milliseconds the marketer must spend on the signal confirmation
   * screen before the Confirm button becomes active.
   */
  confirmationMinDwellMs: raw.frontend.confirmation_min_dwell_ms,

  backendPort: raw.infrastructure.backend_port,
  frontendPort: raw.infrastructure.frontend_port,
} as const;

export type FrontendConfig = typeof frontendConfig;
