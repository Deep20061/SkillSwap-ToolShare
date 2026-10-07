import redis from "../../lib/redis"

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
const TTL = 60 * 60 * 24 * 7 // 7 days
const HEADERS = { "User-Agent": "SkillSwap-ToolShare/1.0 (contact@skillswap.app)" }

export async function reverseGeocode(lat: number, lng: number, zoom?: number): Promise<string | null> {
  const key = `geocode:rev:${lat.toFixed(3)}:${lng.toFixed(3)}:${zoom ?? "full"}`
  const cached = await redis.get(key)
  if (cached) return cached

  const params = new URLSearchParams({ format: "json", lat: String(lat), lon: String(lng) })
  if (zoom !== undefined) params.set("zoom", String(zoom))
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`, { headers: HEADERS })
  if (!res.ok) return null

  const data = await res.json() as { display_name?: string }
  const name = data.display_name ?? null
  if (name) await redis.setEx(key, TTL, name)
  return name
}

interface ForwardResult {
  displayName: string
  lat: number
  lng: number
}

export async function forwardGeocode(q: string): Promise<ForwardResult[]> {
  const normalized = q.toLowerCase().trim()
  const key = `geocode:fwd:${normalized}`
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached) as ForwardResult[]

  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(normalized)}&limit=5`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) return []

  const data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>
  const results: ForwardResult[] = data.map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }))
  if (results.length > 0) await redis.setEx(key, TTL, JSON.stringify(results))
  return results
}
