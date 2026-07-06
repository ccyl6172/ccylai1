export function parseJsonSafe(value, fallback = null) {
  if (!value) return fallback;

  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}
