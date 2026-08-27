# AI-Assisted Task Review Application

A small task-triage application built for the **Junior Software Engineer technical assessment**.

It allows users to view incoming tasks, update their status, and use **Google Gemini** to generate a suggested category, priority, summary, and recommended next action.

## Tech Stack

* **Backend:** Node.js, Express, TypeScript
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Database:** SQLite with `better-sqlite3`
* **AI:** Google Gemini using the official `@google/genai` SDK
* **Testing:** Jest + Supertest

## Architecture

The backend follows a **module-based layered architecture**.

```text
backend/src/
├── config/
├── middlewares/
├── utils/
└── modules/
    ├── tasks/
    │   ├── routes/
    │   ├── controller/
    │   ├── service/
    │   ├── repository/
    │   └── validation/
    └── ai/
        ├── client/
        ├── service/
        └── ...
```

Instead of having global `controllers/`, `services/`, `repositories/`, and `routes/` folders, related files are grouped by **feature/module**.

This keeps feature-specific code together and makes the application easier to navigate, maintain, and scale. Adding a new feature means adding a new module rather than spreading its files across multiple global layer folders.

Each module still follows:

**Route → Controller → Service → Repository**

This keeps HTTP handling, business logic, and database access separated.

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── seed.ts
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── modules/
│   │       ├── tasks/
│   │       └── ai/
│   └── tests/
│
└── frontend/
    ├── app/
    │   ├── dashboard/
    │   ├── task/
    │   └── task/[id]/
    ├── components/
    └── lib/
```

## Running Locally

### Requirements

* Node.js 18+
* Google Gemini API key

### Gemini API Key Setup

1. Open **Google AI Studio**.
2. Create a new Google AI Studio project if you don't already have one.
3. Go to **API Keys**.
4. Select **Create API key** / **Create API key in new project**.
5. Copy the generated API key.
6. Add it to the backend `.env` file:

```env
GEMINI_API_KEY=your_api_key
```

The application uses the **real Gemini API**, not a mocked AI response.

> **Note:** Because this assessment uses a real Gemini API and a lightweight Flash model, AI analysis may take a few seconds depending on API/network latency. This is acceptable for the assessment. In a production environment, a faster or more optimized model can be selected based on the application's latency and cost requirements.

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Add your Gemini API key to `.env`, then start the server:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

The SQLite database is created automatically and sample tasks are seeded on the first run.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

Open the application, select a task, and click **Analyse with AI**.

## API

| Method | Endpoint             | Description                             |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/tasks`             | List tasks, optionally filter by status |
| GET    | `/tasks/:id`         | Get a task                              |
| POST   | `/tasks`             | Create a task                           |
| PATCH  | `/tasks/:id/status`  | Update task status                      |
| POST   | `/tasks/:id/analyse` | Generate Gemini analysis                |

Valid statuses:

```text
NEW
IN_PROGRESS
COMPLETED
```

Invalid status values are rejected with `400` before the database is modified.

## AI Analysis

The application uses Google's official **`@google/genai` SDK** to communicate with Gemini rather than making manual REST/fetch requests.

Gemini generates:

```text
category
priority
summary
recommendedAction
```

The request uses Gemini's structured JSON response configuration to specify the expected response shape. The backend additionally parses and validates the returned data before passing it to the frontend.

The AI integration is designed to fail safely. API failures, timeouts, invalid keys, empty responses, and unexpected response structures are converted into consistent API errors instead of crashing the server or passing invalid data to the frontend.

## Frontend

The UI includes:

* Task dashboard and filtering
* Task details
* Status updates
* AI analysis
* Loading/skeleton states
* Error states with retry
* Empty states

## Testing

Run the backend tests:

```bash
cd backend
npm test
```

Tests cover:

* Successful status updates
* Invalid status rejection
* Missing task (`404`)
* AI failure handling

## AI-Assisted Development

I used **OpenCode** to help scaffold the backend/frontend and generate some boilerplate.

I reviewed and tested the generated code rather than accepting it as-is. In particular, I improved Gemini response validation and error handling, and switched the AI integration to Google's official `@google/genai` SDK for a cleaner and more maintainable integration.

## Future Improvements

With more time, I would add:

* Persisted AI analysis to avoid repeated Gemini calls
* Zod-based request validation
* Pagination for larger task lists
* Authentication and authorization
* Playwright E2E tests
