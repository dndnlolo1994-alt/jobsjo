const CACHE_NAME = "jojobs-os-v2";
const STATIC_ASSETS = [
  "/",
  "/jobs",
  "/pricing",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/maskable.svg",
  "/images/hero-jojobs.png"
];

/* ─── Install: pre-cache static assets ─── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

/* ─── Activate: clean old caches ─── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

/* ─── Fetch: network-first with cache fallback ─── */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/me") || url.pathname.startsWith("/employer") || url.pathname.startsWith("/api")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
  );
});

/* ─── Push Notifications ─── */
self.addEventListener("push", (event) => {
  let data = { title: "جوبز الأردن", body: "لديك إشعار جديد", url: "/" };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        url: payload.url || data.url,
        icon: payload.icon || undefined,
        image: payload.image || undefined,
        badge: payload.badge || undefined,
        tag: payload.tag || undefined,
      };
    }
  } catch {
    // If parsing fails, use text as body
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/icon-96x96.png",
    image: data.image || undefined,
    tag: data.tag || "jojobs-notification",
    dir: "rtl",
    lang: "ar",
    vibrate: [100, 50, 100],
    data: { url: data.url },
    actions: [
      { action: "open", title: "فتح" },
      { action: "close", title: "إغلاق" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

/* ─── Notification Click: navigate to URL ─── */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open new window
        return self.clients.openWindow(url);
      })
  );
});
