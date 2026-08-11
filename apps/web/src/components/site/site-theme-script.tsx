import { SITE_THEME_STORAGE_KEY, SITE_THEME_DEFAULT } from '@/lib/site-theme';

/** Runs before paint to align `data-site-theme` with localStorage (avoids flash). */
export function SiteThemeScript() {
  const code = `(function(){try{var k='${SITE_THEME_STORAGE_KEY}';var t=localStorage.getItem(k);var el=document.getElementById('homepage');if(!el)return;var theme=(t==='light'||t==='dark')?t:'${SITE_THEME_DEFAULT}';el.setAttribute('data-site-theme',theme);}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
