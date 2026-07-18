const express = require('express');
const app = express();

const port = 3000;
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

  if (!task.title || task.title.trim() === ""){
    return res.status(400).send({ "error": "Title is required" });
  }
  
  const newId = Math.max(...tasks.map(task => task.id)) + 1;
  const newTask = {id: newId, title: task.title, done: false};
  tasks.push(newTask);
  res.status(201).send(newTask);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});