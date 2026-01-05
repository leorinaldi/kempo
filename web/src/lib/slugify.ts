// Convert article title to URL-friendly slug
// This is a pure function that can be used on both client and server
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')           // Remove apostrophes
    .replace(/[^a-z0-9]+/g, '-')    // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '')        // Trim leading/trailing dashes
}
