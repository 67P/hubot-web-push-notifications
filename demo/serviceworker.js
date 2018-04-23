self.addEventListener('push', function(event) {
  debugger;
  event.waitUntil(self.registration.showNotification('ServiceWorker Cookbook', {
    body: 'Demo notification'
  }));
});
