const Database = require('better-sqlite3');

const db = new Database('tasks.db');

const express = require('express');
const app = express();

const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INT NOT NULL DEFAULT 0
    )
`);

const insertTask = db.prepare(`
    INSERT INTO tasks (title, done)
    VALUES (@title, @done)
`);

const insertManyTask = db.transaction((tasks) => {
  for (const task of tasks) insertTask.run(task);
});

const numRows = db.prepare('SELECT COUNT(*) as count FROM tasks;').get().count;



if (numRows === 0){
  insertManyTask([
    {title: "Study JavaScript", done: 0},
    {title: "Develop To-Do list API for Intership", done: 0},
    {title: "Buy groceries", done: 1}
  ]);
}



const originalTasks = [
  {id: 1, title: "Study JavaScript", done: false},
  {id: 2, title: "Develop To-Do list API for Intership", done: false},
  {id: 3, title: "Buy groceries", done: true}
]

var tasks = originalTasks.map(task => ({
    id: task.id,
    title: task.title,
    done: task.done
  }));


app.get('/', (req, res) => {
  res.send({
    "name": "Task API",
    "version": "1.0",
    "endpoints": ["/tasks"]
  });
});

app.get('/health', (req, res) => {
  res.send({
     "status": "ok" 
    });
});

app.get('/stats', (req, res) => {
  const total = tasks.length;
  const done = tasks.filter(task => task.done === true); 
  const doneTotal = done.length;
  const open = total - doneTotal;
  res.send({ "total": total, "done": doneTotal, "open": open });
});

app.post('/reset', (req, res) => {
  tasks = originalTasks.map(task => ({
    id: task.id,
    title: task.title,
    done: task.done
  }));
  res.send(tasks);
});

app.get('/tasks', (req, res) => {
  const query = req.query

  let filteredTasks = tasks
  if (query.search){
    filteredTasks = filteredTasks.filter(task => task.title.toLowerCase().includes(query.search.toLowerCase())); 
  }
  if (query.done){
    filteredTasks = filteredTasks.filter(task => task.done === (query.done.toLowerCase() === "true")); 
  }
  res.send(filteredTasks);
});

app.get('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const foundTask = tasks.find(task => task.id === Number(id))
  if (foundTask){
    res.send(foundTask);
  } else {
    res.status(404).send({ "error": `Task ${id} not found` });
  }
});

app.post('/tasks', (req, res) => {
  const task = req.body;

  if (!task.title){
    return res.status(400).send({ "error": "Title is required" });
  }
  if (typeof task.title !== "string" || task.title.trim() === ""){
    return res.status(400).send({ "error": "Invalid title" });
  }

  const newId = Math.max(...tasks.map(task => task.id)) + 1;
  const newTask = {id: newId, title: task.title, done: false};
  tasks.push(newTask);
  res.status(201).send(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const foundTaskIndex = tasks.findIndex(task => task.id === Number(id))

  if (foundTaskIndex === -1){
    return res.status(404).send({ "error": `Task ${id} not found` });
  }

  const body = req.body;

  if (!("title" in body) && !("done" in body)){
    return res.status(400).send({ "error": "Title or done status is required" });
  }

  if ("title" in body){
    if (typeof body.title !== "string" || body.title.trim() === ""){
      return res.status(400).send({ "error": "Invalid title" });
    }
    tasks[foundTaskIndex].title = body.title
  }

  if ("done" in body){
    if (typeof body.done !== "boolean"){
      return res.status(400).send({ "error": "Invalid done status" });
    }
    tasks[foundTaskIndex].done = body.done
  }
  
  res.send(tasks[foundTaskIndex]);
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const foundTaskIndex = tasks.findIndex(task => task.id === Number(id));
  if (foundTaskIndex === -1){
    return res.status(404).send({ "error": `Task ${id} not found` });
  }
  tasks.splice(foundTaskIndex, 1)
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});