/**
 * Exécuté avant le premier rendu (inline dans <head>) : pose la classe `dark` ainsi que `lang`
 * sans flash. Doit rester synchronisé avec `applyTheme` (hooks/use-appearance.ts) et
 * `applyDocumentLocale` (lib/i18n/store.ts).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var r=document.documentElement;var a=localStorage.getItem('appearance');var d=a==='dark'||((a!=='light')&&window.matchMedia('(prefers-color-scheme: dark)').matches);r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';var l=localStorage.getItem('locale');if(l==='fr'||l==='en'){r.lang=l}}catch(e){}})()`;
