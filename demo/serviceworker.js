self.addEventListener('push', function(event) {
  console.log('push event', event);
  event.waitUntil(self.registration.showNotification('ServiceWorker Cookbook', {
    body: 'Demo notification'
  }));
});

self.addEventListener("notificationclick", function(event) {
  event.waitUntil(
    clients.openWindow("http://localhost:8888/")
  );
});
