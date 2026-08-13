const taskRepository = require("../repositories/taskRepository");

const httpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getAllTasks = async (filters) => {
  return await taskRepository.findAll(filters);
};

const getTaskById = async (id) => {
  const task = await taskRepository.findById(id);
  if (!task){
    throw httpError(`Task ${id} not found`, 404);
  }
  return task;
};

const createTask = (body) => {
  if (!body.title){
    throw httpError("Title is required", 400);
  }
  if (typeof body.title !== "string" || body.title.trim() === ""){
    throw httpError("Invalid title", 400);
  }

  const newTask = {title: body.title, done: 0};
  taskRepository.create(newTask);

  return newTask;
};

const updateTask = (id, body) => {
  if (!("title" in body) && !("done" in body)){
    throw httpError("Title or done status is required", 400);
  }

  const data = {};

  if ("title" in body){
    if (typeof body.title !== "string" || body.title.trim() === ""){
      throw httpError("Invalid title", 400);
    }
    data.title = body.title;
  }

  if ("done" in body){
    if (typeof body.done !== "boolean"){
      throw httpError("Invalid done status", 400);
    }
    data.done = body.done;
  }

  const task = taskRepository.update(id, data);

  if (!task){
    throw httpError(`Task ${id} not found`, 404);
  }

  return task;
};

const deleteTask = (id) => {
  const result = taskRepository.remove(id);

  if (result.changes === 0){
    throw httpError(`Task ${id} not found`, 404);
  }
};

const getStats = () => {
  const total = taskRepository.countAll();
  const done = taskRepository.countDone();
  const open = total - done;
  return { "total": total, "done": done, "open": open };
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask, getStats };
