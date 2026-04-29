/**
 * Strips HTML tags from a string.
 * This is useful for displaying rich text as plain text.
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  // Replace block-level tags and <br> with newlines to preserve formatting
  let text = html.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');

  // Remove remains of any other HTML tags
  text = text.replace(/<[^>]*>?/gm, '');

  // Fix alignment: trim each line and remove redundant whitespace/newlines
  return text
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{2,}/g, '\n') // Collapse excessive newlines
    .trim();
}

/**
 * Ensures that a value fetched from Frappe API (which could be a string or an object for Link fields)
 * is returned as a plain string.
 */
export function getString(val: any): string {
  if (typeof val === 'object' && val !== null) {
    return val.name || val.label || String(val);
  }
  return val === null || val === undefined ? '' : String(val);
}
/**
 * Returns the initials of a name (e.g., "Deepak Ahirwar" -> "DA").
 */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
