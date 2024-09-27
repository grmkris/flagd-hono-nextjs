'use client';

import { FlagdWebProvider } from '@openfeature/flagd-web-provider';
import {
  InMemoryProvider,
  OpenFeature,
  OpenFeatureProvider,
} from '@openfeature/react-sdk';

export default function FeaturesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const flagd = new FlagdWebProvider({
    host: 'localhost',
    port: 8013,
    tls: false,
  });
  OpenFeature.setProviderAndWait(flagd);
  OpenFeature.setContext({
    workspaceId: 'workspace5',
  });
  return <OpenFeatureProvider>{children}</OpenFeatureProvider>;
}
