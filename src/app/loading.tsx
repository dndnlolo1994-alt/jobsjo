// Root loading boundary.
// Intentionally renders NOTHING: a root-level loading.tsx wraps the whole app
// in a Suspense boundary, so any visible fallback here would flash on EVERY
// navigation. Navigation feedback is handled globally by <NextTopLoader /> (the
// thin green progress bar in the layout). Returning null keeps the streaming
// benefit of the boundary without a full-screen overlay on every page.
// Heavy routes can still provide their own scoped loading.tsx (e.g. /employer).
export default function GlobalLoading() {
  return null;
}
