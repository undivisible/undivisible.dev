/**
 * True when the page is running inside someone else's frame — a preview
 * embed, an artifact host, a reader.
 *
 * Framed hosts routinely apply a content-security-policy that blocks every
 * request to an outside origin and a permissions-policy that withholds
 * browser APIs. Both look identical to "the feature is broken" from inside,
 * so anything that can fail this way should say which it was.
 */
export function isFramed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    // A cross-origin parent throws on access, which is itself the answer.
    return true;
  }
}
