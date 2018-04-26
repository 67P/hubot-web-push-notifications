const util = require('util');
const cors = require('cors');
const webPush = require('web-push');

module.exports = function(robot) {

  //
  // Setup
  //

  robot.router.use(cors());

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    robot.logger.info('You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY '+
      'environment variables. You can use the following ones:');
    robot.logger.info(webPush.generateVAPIDKeys());
    process.exit(1);
  }

  const vapidSubject = process.env.VAPID_SUBJECT || 'https://hyperchannel.kosmos.org';
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const gcmAPIKey = process.env.GCM_API_KEY || '';

  if (!gcmAPIKey) {
    robot.logger.info('Warning: You should set a GCM_API_KEY for Web Push notifications');
  }

  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const notificationOptions = {
    gcmAPIKey: gcmAPIKey,
    // TODO evaluate all possible options
    // TTL: <Number>,
  }

  let subscriptions;

  robot.brain.on('loaded', function() {
    subscriptions = robot.brain.get('web-push-subscriptions');
    robot.logger.debug('Web push subscriptions : ' + util.inspect(subscriptions));
  });

  // robot.brain.on('save', function() {
  //   robot.logger.debug('brain saved. memory vs redis:');
  //   robot.logger.debug(util.inspect(subscriptions.length));
  //   robot.logger.debug(util.inspect(robot.brain.get('web-push-subscriptions').length));
  // });

  //
  // Subscription management
  //

  function findSubscription (endpoint) {
    robot.logger.debug('Finding subscription ', endpoint);
    const sub = subscriptions.find(s => s.details.endpoint === endpoint);
    if (sub) {
      robot.logger.debug('Found subscription ', endpoint);
      return sub;
    } else {
      robot.logger.debug('Not found ', endpoint);
      return undefined;
    }
  }

  function registerSubscription (user, subscription) {
    let sub = { user: user, details: subscription };
    subscriptions.push(sub);
    robot.logger.debug('Subscription registered ' + subscription.endpoint);
  }

  function unregisterSubscription (endpoint) {
    let subIndex = subscriptions.findIndex(function(s){
       return s.details.endpoint === endpoint;
    })
    if (subIndex !== -1) {
      subscriptions.splice(subIndex, 1)
      robot.logger.debug('Subscription unregistered ' + endpoint);
    };
  }

  //
  // HTTP API
  //

  robot.router.get('/web-push/vapid-public-key', (req, res) => {
    res.send(vapidPublicKey);
  });

  robot.router.post('/web-push/register', (req, res) => {
    const user = req.body.user;
    const subscription = req.body.subscription;

    if (!findSubscription(subscription.endpoint)) {
      registerSubscription(user, subscription);
    }

    res.send(201);
  });

  robot.router.post('/web-push/unregister', (req, res) => {
    const subscription = req.body.subscription;

    if (findSubscription(subscription.endpoint)) {
      unregisterSubscription(subscription.endpoint);
    }

    res.send(204);
  });

  //
  // Notifications
  //

  function sendNotification(subscription, payload) {
    let endpoint = subscription.endpoint;
    webPush.sendNotification(subscription, payload, notificationOptions).then(function() {
      robot.logger.info('Notification sent to ' + endpoint);
    }).catch(function() {
      unregisterSubscription(endpoint);
      robot.logger.info('Error in sending Notification, endpoint removed ' + endpoint);
    });
  }

  robot.listen(message => {
    // Not all message objects support matching
    if (!message.match) { return false; }

    // TODO match only valid IRC nicks
    const match = message.match(/^(.+): /);

    if (match && subscriptions.map(s => s.user).includes(match[1])) {
      return match[1];
    } else {
      return false;
    }
  }, res => {
    const room = res.message.user.room;
    const user = res.match;
    const usersOnline = robot.adapter.getChanData(room).users;
    robot.logger.debug(`Subscribed user mentioned: ${user}`);

    if (!Object.keys(usersOnline).includes(user)) {
      robot.logger.debug('User not present. Sending web push notification...');
      payload = JSON.stringify({
        "channel": room,
        "author": res.message.user.name,
        "message": res.message.text
      });
      sendNotification(subscriptions[0].details, payload);
    } else {
      robot.logger.debug('User is present. Nothing to do.');
    }
  });

};
