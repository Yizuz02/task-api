# Task API

A simple REST API for a To-Do List with full CRUD functionality.

The project is built with **JavaScript** and **Express.js** and includes **Swagger UI** for interactive API documentation.

## Features

- Full CRUD operations for tasks
- RESTful API
- Input validation
- OpenAPI 3.0 documentation
- Swagger UI interface

## Tech Stack

- JavaScript
- Node.js
- Express.js
- Swagger UI Express
- OpenAPI 3.0

## Getting Started

### Prerequisites

- Node.js (recommended version 18 or newer)
- npm

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

Start the server with:

```bash
node app.js
```

The server runs by default on:

```
http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/{id}` | Get a task by its ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |

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