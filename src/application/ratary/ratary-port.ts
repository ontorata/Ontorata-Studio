import type { CapabilityManifestView } from '../../infrastructure/ratary/studio-ratary-client';

/** Ratary data-plane port — implemented by StudioRataryClient adapter. */
export interface RataryPort {
  getCapabilities(): Promise<CapabilityManifestView>;
  getHealth(): Promise<{ status: string }>;
}
