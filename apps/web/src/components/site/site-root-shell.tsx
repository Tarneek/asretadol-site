'use client';

import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { ApiConfigurationNotice } from '@/components/site/api-configuration-notice';
import { SiteThemeScript } from '@/components/site/site-theme-script';
import { useSiteTheme } from '@/components/site/site-theme-provider';
import type { ApiEnvConfig } from '@/lib/env';

type Props = {
  apiEnv: ApiEnvConfig;
  children: ReactNode;
};

export function SiteRootShell({ apiEnv, children }: Props) {
  const { theme } = useSiteTheme();

  return (
    <div
      className="site-root"
      id="homepage"
      data-site-theme={theme}
      suppressHydrationWarning
    >
      <SiteThemeScript />
      <SiteHeader />
      <div className="RenderBody">
        {apiEnv.status === 'missing' ? (
          <ApiConfigurationNotice config={apiEnv} variant="site" />
        ) : (
          children
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
