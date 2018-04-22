# [WORK IN PROGRESS] Hubot Web Push Notifications

This Hubot plugin allows your users to subscribe to Web Push notifications from
a Web client/frontend, and then receive notifications when someone mentions
their name, while they're away.

## Configuation

| Key | Description |
| --- | --- |
| `GCM_API_KEY` | Google Cloud Messaging API key |
| `VAPID_SUBJECT` | VAPID subject (mailto address or URL) |
| `VAPID_PUBLIC_KEY` | URL-safe base64-encoded public key |
| `VAPID_PRIVATE_KEY` | URL-safe base64-encoded private key |
