const express = require('express');
const app = express();

const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

const tasks = [
  {id: 1, title: "Study JavaScript", done: false},
  {id: 2, title: "Develop To-Do list API for Intership", done: false},
  {id: 3, title: "Buy groceries", done: true}
]

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

app.get('/tasks', (req, res) => {
  res.send(tasks);
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