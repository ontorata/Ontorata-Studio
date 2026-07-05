import type { ReactNode } from 'react';
import { useCapabilities } from '../hooks/useCapabilities';

export function CapabilityGate({
  flag,
  children,
  fallback = null,
}: {
  flag: keyof NonNullable<ReturnType<typeof useCapabilities>['capabilities']> | string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { capabilities, loading } = useCapabilities();
  if (loading) return null;
  if (!capabilities[flag]) return <>{fallback}</>;
  return <>{children}</>;
}
