/**
 * Source Connector Registry
 *
 * Manages all available source connectors and provides
 * a unified interface for the sourcing engine.
 */

import type { SourceConnector, SourceType, SourceConfig } from "@/types/sourcing";
import { googleCSEConnector } from "./google-cse";
import { githubConnector } from "./github";
import { internalDBConnector } from "./internal-db";
import { resumeSearchConnector } from "./resume-search";

// All available source configurations
export const SOURCE_CONFIGS: SourceConfig[] = [
  {
    id: "internal_db",
    name: "Candidate DB",
    icon: "Database",
    enabled: true,
    requiresAuth: false,
    description: "Search existing candidate database",
  },
  {
    id: "resume_upload",
    name: "Resumes",
    icon: "FileText",
    enabled: true,
    requiresAuth: false,
    description: "Search uploaded resumes",
  },
  {
    id: "google_cse",
    name: "Google",
    icon: "Globe",
    enabled: true,
    requiresAuth: false,
    description: "Search via Google Custom Search Engine",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "Github",
    enabled: true,
    requiresAuth: false,
    description: "Search GitHub profiles and repositories",
  },
  // Prepared for future integrations
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "Linkedin",
    enabled: false,
    requiresAuth: true,
    description: "LinkedIn profile search (coming soon)",
  },
  {
    id: "apollo",
    name: "Apollo",
    icon: "Rocket",
    enabled: false,
    requiresAuth: true,
    description: "Apollo.io people search (coming soon)",
  },
  {
    id: "hunter",
    name: "Hunter",
    icon: "Target",
    enabled: false,
    requiresAuth: true,
    description: "Hunter.io email finder (coming soon)",
  },
  {
    id: "contactout",
    name: "ContactOut",
    icon: "Users",
    enabled: false,
    requiresAuth: true,
    description: "ContactOut profile search (coming soon)",
  },
];

// Connector registry
const connectors: Map<SourceType, SourceConnector> = new Map([
  ["google_cse", googleCSEConnector],
  ["github", githubConnector],
  ["internal_db", internalDBConnector],
  ["resume_upload", resumeSearchConnector],
]);

export function getConnector(source: SourceType): SourceConnector | undefined {
  return connectors.get(source);
}

export function getAvailableConnectors(): SourceConnector[] {
  return Array.from(connectors.values()).filter((c) => c.isAvailable);
}

export function getEnabledSources(): SourceConfig[] {
  return SOURCE_CONFIGS.filter((s) => s.enabled);
}

export function getAllSources(): SourceConfig[] {
  return SOURCE_CONFIGS;
}

export function isSourceAvailable(source: SourceType): boolean {
  const connector = connectors.get(source);
  return connector?.isAvailable ?? false;
}

// Re-export individual connectors
export { googleCSEConnector } from "./google-cse";
export { githubConnector } from "./github";
export { internalDBConnector } from "./internal-db";
export { resumeSearchConnector } from "./resume-search";
