/**
 * hubConfig.ts — Integration Hub Configuration Helper
 *
 * Kopiuj do: server/lib/hubConfig.ts w każdym nowym projekcie.
 * Pobiera konfigurację z Integration Hub z hierarchicznym mergem:
 * Owner defaults → Client overrides → Project-specific
 *
 * Wymagane zmienne środowiskowe:
 *   INTEGRATION_HUB_URL    = https://integration-hub.manus.space
 *   INTEGRATION_HUB_KEY    = [api key z Integration Hub]
 *   INTEGRATION_HUB_CLIENT = [slug klienta, np. "owner" lub "acme-corp"]
 */

interface ConfigEntry {
  value: string;
  source: "owner" | "client" | "project";
  integrationSlug: string;
  keyName: string;
}

interface HubConfig {
  clientSlug: string;
  projectSlug: string;
  clientName: string;
  projectName: string;
  resolvedAt: string;
  config: Record<string, ConfigEntry>;
}

// Cache konfiguracji w pamięci (TTL: 5 minut)
let _cache: { data: HubConfig; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Pobiera pełną konfigurację z Integration Hub.
 * Używa cache żeby nie odpytywać przy każdym requeście.
 */
export async function getHubConfig(projectSlug?: string): Promise<HubConfig | null> {
  const hubUrl = process.env.INTEGRATION_HUB_URL;
  const hubKey = process.env.INTEGRATION_HUB_KEY;
  const clientSlug = process.env.INTEGRATION_HUB_CLIENT;

  if (!hubUrl || !clientSlug) {
    console.warn("[HubConfig] INTEGRATION_HUB_URL or INTEGRATION_HUB_CLIENT not set");
    return null;
  }

  // Zwróć z cache jeśli świeże
  if (_cache && _cache.expiresAt > Date.now()) {
    return _cache.data;
  }

  try {
    const slug = projectSlug ?? process.env.INTEGRATION_HUB_PROJECT ?? "main";
    const url = `${hubUrl}/api/config/${clientSlug}/${slug}`;

    const response = await fetch(url, {
      headers: hubKey ? { "x-api-key": hubKey } : {},
    });

    if (!response.ok) {
      console.warn(`[HubConfig] Failed to fetch config: ${response.status}`);
      return null;
    }

    const data: HubConfig = await response.json();
    _cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch (err) {
    console.error("[HubConfig] Error fetching config:", err);
    return null;
  }
}

/**
 * Pobiera wartość konkretnego klucza konfiguracji.
 * Fallback na zmienną środowiskową jeśli Integration Hub niedostępny.
 *
 * @example
 * const apiKey = await getConfigValue("OPENAI_API_KEY");
 */
export async function getConfigValue(keyName: string, projectSlug?: string): Promise<string | null> {
  const config = await getHubConfig(projectSlug);
  if (config?.config[keyName]) {
    return config.config[keyName].value;
  }
  // Fallback na lokalne env
  return process.env[keyName] ?? null;
}

/**
 * Pobiera wszystkie klucze dla konkretnej integracji.
 *
 * @example
 * const openaiKeys = await getIntegrationKeys("openai");
 * // { OPENAI_API_KEY: "sk-..." }
 */
export async function getIntegrationKeys(
  integrationSlug: string,
  projectSlug?: string
): Promise<Record<string, string>> {
  const config = await getHubConfig(projectSlug);
  if (!config) return {};

  return Object.fromEntries(
    Object.entries(config.config)
      .filter(([, entry]) => entry.integrationSlug === integrationSlug)
      .map(([key, entry]) => [key, entry.value])
  );
}

/**
 * Invaliduje cache — wywołaj po zmianie konfiguracji w Integration Hub.
 */
export function invalidateHubConfigCache(): void {
  _cache = null;
}

/**
 * Sprawdza czy Integration Hub jest dostępny i skonfigurowany.
 */
export async function checkHubConnection(): Promise<{
  connected: boolean;
  clientSlug: string | null;
  error?: string;
}> {
  const hubUrl = process.env.INTEGRATION_HUB_URL;
  const clientSlug = process.env.INTEGRATION_HUB_CLIENT ?? null;

  if (!hubUrl) return { connected: false, clientSlug, error: "INTEGRATION_HUB_URL not set" };

  try {
    const response = await fetch(`${hubUrl}/api/trpc/system.health`, { method: "GET" });
    return { connected: response.ok, clientSlug };
  } catch (err) {
    return { connected: false, clientSlug, error: String(err) };
  }
}
