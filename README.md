# Task API

A simple REST API for a To-Do List with full CRUD functionality, containerized with Docker and backed by a persistent PostgreSQL database.

The project is built with **JavaScript** and **Express.js**, uses **node-postgres (`pg`)** for database management, and includes **Swagger UI** for interactive API documentation.

## Tech Stack

- JavaScript (Node.js v24)
- Express.js
- PostgreSQL (v17)
- Docker & Docker Compose
- Swagger UI Express
- OpenAPI 3.0

## Layered Architecture

The application is organized into three layers — **route → service → repository** — to separate HTTP handling, business logic, and data access:

| Layer | File | Responsibility |
| --- | --- | --- |
| Route | `routes/taskRoutes.js` | Defines the Express routes and handles HTTP requests/responses (parsing input and setting status codes). |
| Service | `services/taskService.js` | Contains validation and business logic, and calls the repository layer. |
| Repository | `repositories/taskRepository.js` | Contains all SQL queries and database access. |
| Database | `db.js` | Opens the SQLite connection, creates the table, and seeds the initial data. |

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine installed
- `git`

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Yizuz02/task-api](https://github.com/Yizuz02/task-api)
   cd task-api
   ```
2. **Environment Configuration:**
Copy the example environment file to create your local .env:

    ```bash
    cp .env.example .env
    ```
3. **Start the Stack:**
Run the entire multi-container stack with a single command:
    ```bash
    docker compose up --build
    ```
  Automatic Database Setup & Persistence:

  - Docker Compose starts both the Express API and the PostgreSQL database container.

  - The API service waits for the PostgreSQL database health check (service_healthy) before initializing.

  - On startup, the application connects using DATABASE_URL, automatically creates the tasks table if missing, and seeds three default example tasks if the database is empty.

  - Data is persisted across container restarts using a named Docker volume (taskdata).

The server runs by default on:

```
http://localhost:3000
```
---

### Environment Variables


The application relies on environment variables for database connections. Local secrets are stored in `.env` (which is git-ignored).

A template file `.env.example` is provided in the repository:

```env
# Database Connection String
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
```

When running with Docker Compose, the connection string is injected using the service name (db) as host:

```bash
DATABASE_URL=postgres://postgres:dev@db:5432/tasks
```


## Example Request

The API supports case-insensitive search using the `search` query parameter evaluated via SQL.

```bash
curl -i "http://localhost:3000/tasks?search=JAVASCRIPT"
```

Output:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
  {
    "id": 1,
    "title": "Study JavaScript",
    "done": false
  }
]
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/tasks` | Get all tasks. Supports filtering by `done` status and searching by `title` using query parameters. |
| GET | `/tasks/{id}` | Get a specific task by ID. |
| POST | `/tasks` | Create a new task. |
| PUT | `/tasks/{id}` | Update an existing task's title and/or completion status. |
| DELETE | `/tasks/{id}` | Delete a task by ID. |
| GET | `/stats` | Get calculated statistics about tasks. |


---

## Database Direct Inspection

The containerized PostgreSQL database is mapped and accessible on your host machine at port `5432`. You can connect to it using any visual database administration tool. 

In this project, **DBeaver** is used to connect to the database, inspect the schema, and view the persisted tasks directly.

**DBeaver Preview**

![DBeaver Database Inspection](dbeaver.png)
 
## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/docs
```

Swagger UI displays all available endpoints, request parameters, request bodies, response examples, and status codes. You can also test every endpoint directly from the browser.

**Swagger UI Preview**

![Local Screenshot](swagger.png)

## Internship

This project was developed as part of the **FlyRank AI Internship**.

## Extras

### Schema Changes & Timestamps (Old)

Adding created_at and updated_at columns required dropping the existing tasks.db table so SQLite could recreate the schema with the new columns. Updating the table structure manually felt slightly brittle and disruptive to existing data, which highlighted why dedicated database migration tools are essential for handling schema changes cleanly in production.

## AI vs Me (Old)

### Prompt

```text
You are an AI Backend developer. You need to implement an API for a To-do list in JavaScript using Express, and everything must be documented in Swagger using an OpenAPI JSON file.

The API must implement a complete CRUD for tasks:
- View all tasks with filtering options.
- View an individual task by id.
- Create a task by adding a title in the request body.
- Update an existing task.
- Delete a task.

Additionally, the API must have these endpoints:
- A health endpoint.
- A stats endpoint that shows how many tasks exist in total and how many are in each completion state.
- A reset endpoint to restore the tasks to the example tasks.

There is NO connection to a database, so tasks must be stored only in RAM. When the server starts, it must add 3 example tasks into a list so they can be used.

Tasks have these fields:
- id
- title
- done (completion status)

Keep all the JavaScript code in a single file. The environment is already created. Everything must be inside a folder called ai-version/.

Provide the command to start the application.

Swagger documentation must be available at /docs and the API must run on port 3000.
```

> **Note:** The `/reset` endpoint was later removed from the API. It only appears here as part of the original prompt and comparison.

### Running the AI Version

The AI generated a complete project that worked without modifications. I only had to extract the downloaded files into the `ai-version/` folder, install the dependencies, and start the server.

```bash
cd ai-version
npm install
node app.js
```

### Comparison

The generated API started successfully on the first attempt.

All CRUD operations worked correctly, but the endpoints were not exactly the same as mine because I did not explicitly specify their names in the prompt. The AI generated the following endpoints:

- `GET /api/tasks` — list all tasks with optional `done` and `search` filters.
- `GET /api/tasks/:id` — get a task by id.
- `POST /api/tasks` — create a task.
- `PUT /api/tasks/:id` — update a task.
- `DELETE /api/tasks/:id` — delete a task.
- `GET /api/health` — health check.
- `GET /api/stats` — returns `{ total, done, pending }`.
- `POST /api/reset` — restores the three example tasks.

### What the AI did better

- The Swagger documentation was better organized. It grouped the endpoints into sections such as **Task CRUD operations** and **System Health, Stats and Reset utilities**, making the documentation easier to navigate.
- The generated code was cleaner because it separated common logic into helper functions instead of placing everything inside the route handlers. For example, it created helper functions such as `findTaskIndex(id)`.
- The search endpoint was implemented as **case-insensitive**, even though I did not explicitly mention this in my prompt. Interestingly, I implemented it the same way in my own solution.

### What the AI got wrong or decided on its own

- I did not specify the exact endpoint paths, so it chose to prefix every route with `/api/`.
- I did not specify the response status codes. Even so, it implemented almost all of them correctly and even added additional validation that I had not considered, for example:

```javascript
res.status(400).json({ error: "Task id must be an integer" });
```

when the task id is invalid.

### What my prompt forgot to specify

My prompt did not specify:

- The exact endpoint paths.
- The expected HTTP status codes for each operation.
- Validation rules for invalid task IDs.
- How the code should be organized internally.

The AI made reasonable decisions for all of these details.

### Rematch

I did not generate a second version of the prompt because the first generated solution worked correctly and met the requested functionality.

