const express = require("express");
const router = express.Router();
const taskService = require("../services/taskService");

router.get("/", (req, res) => {
  res.send({
    "name": "Task API",
    "version": "1.5",
    "endpoints": ["/tasks"]
  });
});

router.get("/health", (req, res) => {
  res.send({
    "status": "ok"
  });
});

router.get("/stats", (req, res) => {
  res.send(taskService.getStats());
});

router.get("/tasks", (req, res) => {
  res.send(taskService.getAllTasks(req.query));
});

router.get("/tasks/:id", (req, res) => {
  const { id } = req.params;
  try {
    res.send(taskService.getTaskById(id));
  } catch (error) {
    res.status(error.status).send({ "error": error.message });
  }
});

router.post("/tasks", (req, res) => {
  try {
    res.status(201).send(taskService.createTask(req.body));
  } catch (error) {
    res.status(error.status).send({ "error": error.message });
  }
});

router.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  try {
    res.send(taskService.updateTask(id, req.body));
  } catch (error) {
    res.status(error.status).send({ "error": error.message });
  }
});

router.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  try {
    taskService.deleteTask(id);
    res.status(204).send();
  } catch (error) {
    res.status(error.status).send({ "error": error.message });
  }
});

module.exports = router;
