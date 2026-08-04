const VERSION = "lexia-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "LEXIA",
    body: "Vous avez une nouvelle notification.",
    url: "/tableau-de-bord",
    tag: VERSION,
    badge: 1,
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil((async () => {
    if (self.navigator && "setAppBadge" in self.navigator) {
      try {
        await self.navigator.setAppBadge(Number(payload.badge || 1));
      } catch {
        // Le badge n'est pas disponible sur tous les appareils.
      }
    }

    await self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon",
      badge: "/icon",
      tag: payload.tag,
      renotify: true,
      data: { url: payload.url },
    });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/tableau-de-bord", self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin)) {
        await client.focus();
        if ("navigate" in client) await client.navigate(targetUrl);
        return;
      }
    }
    await self.clients.openWindow(targetUrl);
  })());
});
