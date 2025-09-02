// i18n.ts
import { ref, readonly } from 'vue';
import { createI18n, type NamedValue, type TranslateOptions } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';

// ---- Types -----------------------------------------------------------------
// If you have a message schema, you can import and pass it to createI18n for stronger typing.
// For now we keep it generic.

// ---- Constants --------------------------------------------------------------
const STORAGE_KEY = 'app.locale';

const DEFAULT_AVAILABLE = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
] as const;

// Some regional languages in Spain that you might want to map to 'es' (adjust as needed)
const ES_REGIONALS = new Set(['es', 'gl', 'ca', 'eu']);

// ---- Safe browser language detection (SSR-safe) -----------------------------
function getNavigatorLanguages(): string[] {
  if (typeof navigator === 'undefined') return [];
  return (navigator.languages ?? [navigator.language]).filter(Boolean).map((l) => l.toLowerCase());
}

function getBase(lang: string): string {
  return lang.split(/[-_]/)[0];
}

// ---- Initial locale selection ----------------------------------------------
function resolveInitialLocale(available: string[]): string {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && available.includes(stored)) {
    return stored;
  }

  const nav = getNavigatorLanguages();
  const exact = nav.find((l) => available.includes(l));
  if (exact) return exact;

  const bases = nav.map(getBase);
  const baseMatch = bases.find((b) => available.includes(b));
  if (baseMatch) return baseMatch;

  const firstBase = bases[0];
  if (firstBase && ES_REGIONALS.has(firstBase) && available.includes('es')) {
    return 'es';
  }

  return available.includes('en') ? 'en' : available[0] ?? 'en';
}

// ---- Reactive available locales --------------------------------------------
const _availableLocales = ref<{ label: string; value: string }[]>([...DEFAULT_AVAILABLE]);
export const availableLocales = readonly(_availableLocales);

// ---- I18n instance ----------------------------------------------------------
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

// ---- Sync helper ------------------------------------------------------------
function syncI18nAvailableLocales() {
  const keep = new Set(_availableLocales.value.map((l) => l.value));

  // Remove locales not in keep
  for (const loc of i18n.global.availableLocales) {
    if (!keep.has(loc)) {
      const anyGlobal = i18n.global as any;
      if (typeof anyGlobal.removeLocaleMessage === 'function') {
        anyGlobal.removeLocaleMessage(loc);
      } else {
        i18n.global.setLocaleMessage(loc as string, {}); // fallback
      }
    }
  }

  // Ensure locales in keep are registered
  for (const loc of keep) {
    if (!i18n.global.availableLocales.includes(loc)) {
      i18n.global.setLocaleMessage(loc, (messages as any)[loc] ?? {});
    }
  }
}

// ---- Init ------------------------------------------------------------------
(function initLocale() {
  const resolved = resolveInitialLocale(_availableLocales.value.map((l) => l.value));
  i18n.global.locale.value = resolved;
  syncI18nAvailableLocales();
})();

// ---- Public API -------------------------------------------------------------
export function updateI18nLocale(newLocale: string) {
  if (!_availableLocales.value.some((l) => l.value === newLocale)) {
    _availableLocales.value.push({ label: newLocale, value: newLocale });
    syncI18nAvailableLocales();
  }
  i18n.global.locale.value = newLocale;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, newLocale);
  }
}

export function updateI18nAvailableLocales(languages?: Array<{ code: string }>) {
  if (languages && languages.length > 0) {
    const bases = new Set(languages.map((l) => getBase(l.code)));
    const filtered = DEFAULT_AVAILABLE.filter((locale) => bases.has(locale.value));
    _availableLocales.value = filtered.length > 0 ? filtered.slice() : [...DEFAULT_AVAILABLE];
  } else {
    _availableLocales.value = [...DEFAULT_AVAILABLE];
  }

  syncI18nAvailableLocales();

  const current = i18n.global.locale.value as string;
  if (!_availableLocales.value.some((l) => l.value === current)) {
    const next = resolveInitialLocale(_availableLocales.value.map((l) => l.value));
    i18n.global.locale.value = next;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  return availableLocales;
}

// ---- Typed t() wrapper with overloads --------------------------------------
export function t(key: string): string;
export function t(key: string, params: NamedValue | unknown[]): string;
export function t(
  key: string,
  params: NamedValue | unknown[],
  options: TranslateOptions<string>
): string;
export function t(
  key: string,
  params?: NamedValue | unknown[],
  options?: TranslateOptions<string>
): string {
  const g = i18n.global;
  if (options !== undefined && params !== undefined) {
    return g.t(key, params as any, options) as string;
  }
  if (params !== undefined) {
    return g.t(key, params as any) as string;
  }
  return g.t(key) as string;
}
