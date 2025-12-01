export function generateId() {
  // Fallback for non-secure contexts (like mobile via IP) where crypto.randomUUID is not available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if it fails
    }
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
