# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a to-do list application with two deployment modes:

1. **Production (Vercel)**: Serverless architecture with in-memory storage
2. **Development (Local)**: Express server with JSON file storage

The frontend (`index.html`) is a single-page app that works in both modes by making API calls to `/api/tasks`.

## Deployment Modes

### Vercel (Production)
- API implemented as serverless function in `api/tasks.js`
- Uses **in-memory storage** (module-level `let tasks = []`)
- Data **resets on cold starts** (~5-15 min of inactivity)
- Routing configured in `vercel.json` with rewrites
- API endpoints use query parameters: `/api/tasks?id=123` (not path params)

### Local Development
- Express server in `server.js` (not used by Vercel)
- Persists data to `tasks.json` file
- Run with: `npm start`

## Important Routing Details

The API uses **query parameters** instead of path parameters for Vercel compatibility:
- ✅ `/api/tasks?id=123` (works with Vercel)
- ❌ `/api/tasks/123` (doesn't work with Vercel rewrites)

All HTTP methods (GET, POST, PUT, DELETE) go through the same `/api/tasks` endpoint and are differentiated by the `req.method` property.

## Development Commands

```bash
# Local development with persistent storage
npm start

# Deploy to Vercel (requires authentication)
vercel --prod

# Or deploy via GitHub push (auto-deploys if connected)
git push origin main
```

## Storage Limitations

**Critical**: The Vercel deployment uses in-memory storage which means:
- Tasks are lost on function cold starts
- Tasks are not shared between function instances
- Not suitable for production use without adding a database

To add persistent storage, consider:
- Vercel KV (Redis)
- Vercel Postgres
- External database service

## API Endpoints

Single endpoint `/api/tasks` handles all operations:
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task (body: `{text: string}`)
- `PUT /api/tasks?id=123` - Update task (body: `{text?, completed?}`)
- `DELETE /api/tasks?id=123` - Delete task
