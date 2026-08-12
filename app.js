const Database = require("better-sqlite3");

const db = new Database("tasks.db");

const express = require("express");
const app = express();

const port = 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INT NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

const insertTask = db.prepare(`
    INSERT INTO tasks (title, done)
    VALUES (@title, @done)
`);

const insertManyTask = db.transaction((tasks) => {
  for (const task of tasks) insertTask.run(task);
});

const numRows = db.prepare("SELECT COUNT(*) as count FROM tasks;").get().count;



if (numRows === 0){
  insertManyTask([
    {title: "Study JavaScript", done: 0},
    {title: "Develop To-Do list API for Intership", done: 0},
    {title: "Buy groceries", done: 1}
  ]);
}

app.get("/", (req, res) => {
  res.send({
    "name": "Task API",
    "version": "1.5",
    "endpoints": ["/tasks"]
  });
});

app.get("/health", (req, res) => {
  res.send({
     "status": "ok" 
    });
});

app.get("/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as count FROM tasks;").get().count;
  const done = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE done = 1;").get().count;; 
  const open = total - done;
  res.send({ "total": total, "done": done, "open": open });
});

app.post("/reset", (req, res) => {
  tasks = originalTasks.map(task => ({
    id: task.id,
    title: task.title,
    done: task.done
  }));
  res.send(tasks);
});

app.get("/tasks", (req, res) => {
  const query = req.query

  let queryTasks = "SELECT * FROM tasks WHERE 1=1"
  const params = {};
  if (query.search){
    queryTasks += " AND lower(title) LIKE lower(@title)";
    params.title = `%${query.search}%`;
  }
  if (query.done){
    queryTasks += " AND done = @done";
    params.done = query.done === "true" ? 1 : 0;
  }
  if (query.sort === "title"){
    queryTasks += " ORDER BY title";
  }
  res.send(db.prepare(queryTasks).all(params));
});

app.get("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const foundTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id)
  if (foundTask){
    res.send(foundTask);
  } else {
    res.status(404).send({ "error": `Task ${id} not found` });
  }
});

app.post("/tasks", (req, res) => {
  const task = req.body;

  if (!task.title){
    return res.status(400).send({ "error": "Title is required" });
  }
  if (typeof task.title !== "string" || task.title.trim() === ""){
    return res.status(400).send({ "error": "Invalid title" });
  }

  const newTask = {title: task.title, done: 0};
  insertTask.run(newTask)

  res.status(201).send(newTask);
});

app.put("/tasks/:id", (req, res) => {
  const body = req.body;

  if (!("title" in body) && !("done" in body)){
    return res.status(400).send({ "error": "Title or done status is required" });
  }
  
  const { id } = req.params;

  let updateQuery = "UPDATE tasks SET ";
  let params = {}

  params.id = id

  if ("title" in body){
    if (typeof body.title !== "string" || body.title.trim() === ""){
      return res.status(400).send({ "error": "Invalid title" });
    }
    updateQuery += "title = @title, ";
    params.title = body.title;
  }


  if ("done" in body){
    if (typeof body.done !== "boolean"){
      return res.status(400).send({ "error": "Invalid done status" });
    }
    updateQuery += "done = @done, ";
    params.done = body.done === true ? 1 : 0;
  }

  updateQuery += "updated_at = CURRENT_TIMESTAMP WHERE id = @id"

  const updateTask = db.prepare(updateQuery);

  const result = updateTask.run(params);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!task){
    return res.status(404).send({ "error": `Task ${id} not found` });
  }
  
  res.send(task);
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const deleteTask = db.prepare("DELETE FROM tasks WHERE id = @id");

  const result = deleteTask.run({id: id});

  if (result.changes === 0){
    return res.status(404).send({ "error": `Task ${id} not found` });
  }

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`To-do API listening on port ${port}`);
});