# Stock Price Checker

A full-stack web application for checking real-time stock prices with user authentication.

## Prerequisites

- **Docker & Docker Compose v2+**
- **Finnhub API key** (set as `FINNHUB_API_KEY` environment variable)
- **Optional:** Python 3.11+, Playwright for e2e tests and Node 20+ for local development

## Getting Started

1. **Build & Run**

   ```bash
   docker compose up --build
   ```

2. **Services**

   - **Database:** MySQL with `stockapp` schema on port `4444` and test database on port `4445`
   - **Backend:** FastAPI server on port `7777`  
   - **Frontend:** Next.js application on port `3000`  

## Database Setup

FastAPI automatically creates fresh tables on startup using:

```python
Base.metadata.create_all()
```

## Running Tests

All tests use a separate `stockapp_test` database for isolation.

### Backend Tests

```bash
docker compose --profile test run --rm backend-test
```

### Frontend Tests
**Note:** Make sure your app (frontend, backend, and any services) is up and running via `docker-compose up -d` before you run these tests.
#### Unit Tests (Jest)

```bash
docker compose run --rm frontend npm test
```

_Covers: authentication context, form validation, user interactions._

#### E2E Tests (Playwright)


```bash
cd frontend && npm run e2e
```

_Covers: complete user workflows, authentication flow, stock lookup, cross-browser compatibility._
