Here is the fully updated **`README.md`** incorporating all the required database documentation, setup details, and updated architecture context.

---

# Task API

A simple REST API for a To-Do List with full CRUD functionality and persistent SQLite storage.

The project is built with **JavaScript** and **Express.js**, uses **better-sqlite3** for database management, and includes **Swagger UI** for interactive API documentation.

## Why SQLite?

In this updated version, storage was migrated from in-memory (RAM) to a **SQLite** database. SQLite was chosen because:

* **Single File:** The entire database resides in a single, local file (`tasks.db`).


* **Zero Setup:** Requires no external database server installation or configuration.


* **Data Persistence:** Data survives server restarts and crashes, providing reliable persistence.



## Tech Stack

* JavaScript
* Node.js
* Express.js
* SQLite (`better-sqlite3`)
* Swagger UI Express
* OpenAPI 3.0

## Getting Started

### Prerequisites

* Node.js (recommended version 18 or newer)


* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Yizuz02/task-api
cd task-api

```

Install the dependencies:

```bash
npm install

```

### Run the server

Start the project with a single command:

```bash
node app.js

```

> **Database Setup & Automatic Initialization:**
> The database file `tasks.db` lives in the project root directory. It is ignored by Git (`.gitignore`) so that every clone starts fresh.
> 
> 
> When you run `node app.js`, the application automatically:
> 1. Creates `tasks.db` if it does not exist.
> 
> 
> 2. Creates the `tasks` table with columns `id`, `title`, and `done`.
> 
> 
> 3. Seeds the three default example tasks if the database is empty.
> 
> 
> 
> 

The server runs by default on:

```
http://localhost:3000

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
    "done": 0
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
| POST | `/reset` | Restore the task list to the initial example data. |


## Database Direct Inspection

The database structure and contents can be directly viewed and edited using **DB Browser for SQLite**.

**DB Browser Preview**

![Local Screenshot](dbbrowser.png)


### Executed SQL Query Example

The following query was run directly on the database to delete all completed tasks:

```sql
DELETE FROM tasks WHERE done = 1;

```

**Result:** The query executed successfully without errors and removed 1 completed task from the `tasks` table, which was immediately reflected across API requests.

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

