# Hubot Web Push Notifications

This Hubot script allows your users to subscribe to Web Push notifications from
a Web client/frontend, and then receive notifications, when someone mentions
their name while they're away.

It is part of the [Kosmos](https://kosmos.org) project and has been created for
usage with the [Hyperchannel](https://github.com/67P/hyperchannel/) Web client
and other related programs.

## Setup

_Caveat: as Hubot's user management is somewhat broken at the moment, this is
currently only implemented for the IRC adapter. Also, you need the following
commit for the adapter to expose channel attendance data:
https://github.com/67P/hubot-irc/commit/af2d43c46364702e04129c7ec5cf25231f6d40a0_

### 1. In your Hubot

Install the script package:

    npm i --save hubot-web-push-notifications

Add it to `external-scripts.json`:

```json
[
  "hubot-redis-brain",
  "hubot-web-push-notifications"
]
```

_Hint: You should persist the robot's brain using something like
[hubot-redis-brain](https://github.com/hubotio/hubot-redis-brain)._

### 2. In your Web client/front-end

You can check out a working demo client in the `demo/` directory, and copy all
necessary code from there. Start it from this repo's root using:

    npm run demo-client

## Configuration

As usual, config options are set via environment variables.

| Key | Description |
| --- | --- |
| `GCM_API_KEY` | Google Cloud Messaging API key |
| `VAPID_SUBJECT` | VAPID subject (mailto address or URL) |
| `VAPID_PUBLIC_KEY` | URL-safe base64-encoded public key |
| `VAPID_PRIVATE_KEY` | URL-safe base64-encoded private key |

You can generate the VAPID keys using:

    npm run generate-vapid-keys

## Questions, support, high fives

Join us in #kosmos-dev on Freenode IRC, or open an issue on GitHub.
