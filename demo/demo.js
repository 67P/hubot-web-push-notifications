//
// The code in this file is mostly adapted from
// https://serviceworke.rs/push-subscription-management_index_doc.html
//
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// TODO get from form field
const backendURL = 'http://localhost:4242/web-push';

let subscriptionButton = document.getElementById('subscriptionButton');

// Register a Service Worker.
navigator.serviceWorker.register('serviceworker.js');

// When the Service Worker is ready, enable the UI (button),
// and see if we already have a subscription set up.
navigator.serviceWorker.ready.then(function(registration) {
  console.log('service worker registered');
  subscriptionButton.removeAttribute('disabled');

  return registration.pushManager.getSubscription();
}).then(function(subscription) {
  if (subscription) {
    console.log('Already subscribed', subscription.endpoint);
    setUnsubscribeButton();
  } else {
    setSubscribeButton();
  }
});

// Get the `registration` from service worker and create a new
// subscription using `registration.pushManager.subscribe`. Then
// register received new subscription by sending a POST request with
// the subscription to the server.
function subscribe() {
  navigator.serviceWorker.ready.then(async function(registration) {
    // Get the server's public key
    const response = await fetch(backendURL+'/vapid-public-key');
    const vapidPublicKey = await response.text();
    // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
    // urlBase64ToUint8Array() is defined in /tools.js
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    // Subscribe the user
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  }).then(function(subscription) {
    console.log('Subscribed', subscription.endpoint);
    return fetch(backendURL+'/register', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        user: 'raucao', // TODO
        subscription: subscription
      })
    });
  }).then(setUnsubscribeButton);
}

// Get existing subscription from service worker, unsubscribe
// (`subscription.unsubscribe()`) and unregister it in the server with
// a POST request to stop sending push messages to
// unexisting endpoint.
function unsubscribe() {
  navigator.serviceWorker.ready
  .then(function(registration) {
    return registration.pushManager.getSubscription();
  }).then(function(subscription) {
    return subscription.unsubscribe()
      .then(function() {
        console.log('Unsubscribed', subscription.endpoint);
        return fetch(backendURL+'/unregister', {
          method: 'post',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            subscription: subscription
          })
        });
      });
  }).then(setSubscribeButton);
}

// Change the subscription button's text and action.
function setSubscribeButton() {
  subscriptionButton.onclick = subscribe;
  subscriptionButton.textContent = 'Subscribe!';
}

function setUnsubscribeButton() {
  subscriptionButton.onclick = unsubscribe;
  subscriptionButton.textContent = 'Unsubscribe!';
}
