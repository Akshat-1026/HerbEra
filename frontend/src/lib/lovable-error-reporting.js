export function reportLovableError(error, details) {
  if (import.meta.env.DEV) {
    console.error("Lovable error reported:", error, details);
  }
}
