# Avisa Voice App

Full-stack voice call application for Avisa visa experts and clients.

## What it does

- Agents open the **Agent Dashboard** from the PHP portal.
- Users click **Call** on the consultant page.
- The Node app bridges both sides via JWT authentication.
- WebRTC provides peer-to-peer audio calls.
- Socket.io handles call signaling (incoming call, accept/reject, offer/answer/ICE).

## Project structure

```
voice-app/
  server.js              # Express + Socket.io backend
  package.json           # Node dependencies
  .env.example           # Environment variables template
  public/                # Frontend HTML/JS/CSS
    index.html
    auth-callback.html   # Reads JWT token and redirects
    dashboard.html      # Agent incoming call dashboard
    call.html           # User call page
    css/style.css
```

## Quick start (local development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` from the example:
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. The app runs on `http://localhost:3000`.

## Endpoints

- `POST /api/auth/php-bridge` — PHP portal calls this to get a JWT.
- `GET /api/health` — Health check.
- Socket.io namespace `/` — WebRTC signaling and presence.

## Frontend routes

- `/auth-callback?token=JWT` — Entry point from PHP portals.
- `/dashboard` — Agent call dashboard.
- `/call?agentId=123&agentName=Name` — User initiates a call to an agent.

## Deployment notes

This app uses **Socket.io** for real-time signaling. Standard Vercel serverless functions do **not** support persistent WebSocket connections. For production, deploy to a Node.js host that supports long-running processes, such as:

- Render (https://render.com)
- Railway (https://railway.app)
- Heroku
- A VPS with PM2

For Vercel deployment, you would need a separate WebSocket-compatible service or a third-party WebRTC provider (e.g., Daily.co, Twilio).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default 3000) |
| `PHP_BRIDGE_SECRET` | Yes | Must match the PHP portal secret |
| `JWT_SECRET` | Yes | Strong random string for signing JWTs |
| `TRUSTED_ORIGINS` | No | Comma-separated allowed CORS origins |
| `MONGODB_URI` | No | Optional MongoDB connection (app uses memory store if not set) |
| `TURN_SERVER` | No | Optional TURN server for NAT traversal |
| `TURN_USERNAME` | No | TURN username |
| `TURN_PASSWORD` | No | TURN password |

## Important: local testing with PHP portals

While testing locally, set the PHP portal config to:

```php
define('VOICE_APP_URL', 'http://localhost:3000');
```

For production, change it to your deployed Node app URL.

## Security checklist

- [ ] Change `JWT_SECRET` to a strong random 256-bit secret in production.
- [ ] Use HTTPS in production (the app rejects non-HTTPS requests when `NODE_ENV=production`).
- [ ] Add a real TURN server for reliable NAT traversal.
- [ ] Replace in-memory store with MongoDB for production.
- [ ] Keep `PHP_BRIDGE_SECRET` secret and never expose it in frontend code.

## Next steps

1. Test locally with the agent portal and user site both pointing to `http://localhost:3000`.
2. Deploy the Node app to a Node.js host.
3. Update both PHP portal configs to the production URL.
4. Add a TURN server for reliable production calls.
5. (Optional) Replace in-memory store with MongoDB.
