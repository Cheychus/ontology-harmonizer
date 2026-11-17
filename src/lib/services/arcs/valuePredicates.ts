/** Recognize complete numeric values, including decimal commas and scientific notation. */
export function isNumericValue(value: string): boolean {
  const normalized = value.trim().replace(",", ".");
  return normalized.length > 0 && Number.isFinite(Number(normalized));
}

/** Recognize complete HTTP(S) URLs, including DOI resolver links. */
export function isWebUrlValue(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
