import '@/styles/site.css';
import { SiteRootShell } from '@/components/site/site-root-shell';
import { SiteThemeProvider } from '@/components/site/site-theme-provider';
import { getApiEnv } from '@/lib/env';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const apiEnv = getApiEnv();

  return (
    <SiteThemeProvider>
      <SiteRootShell apiEnv={apiEnv}>{children}</SiteRootShell>
    </SiteThemeProvider>
  );
}
