self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  event.waitUntil(
    self.clients.matchAll().then(clientList => {
      let focused = clientList.some(client => client.focused);
      let notificationMessage;
      let payload;

      // No need to notify, when user is looking at the app
      if (focused) { return; }

      // Payload format:
      // {
      //   "channel": "#kosmos-dev",
      //   "author": "raucao",
      //   "message": "galfert: ring me up!"
      // }
      try {
        payload = event.data ? event.data.json() : 'no payload';
        console.log('Push payload:', payload);
      } catch(e) {
        console.log('No payload received, or not valid JSON format');
        return;
      }
      let title = `Highlighted message from ${payload.author} in ${payload.channel}`;
      let body = payload.message;

      return self.registration.showNotification(title, {
        body: body
      });
    })

  );
});

self.addEventListener("notificationclick", function(event) {
  event.waitUntil(
    // Retrieve a list of the clients of this service worker.
    self.clients.matchAll().then(function(clientList) {
      // If there is at least one client, focus it.
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      // Otherwise, open a new page.
      return self.clients.openWindow('/');
    })
  );
});
