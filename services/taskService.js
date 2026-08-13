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

const createTask = async (title) => {
  if (!title){
    throw httpError("Title is required", 400);
  }
  if (typeof title !== "string" || title.trim() === ""){
    throw httpError("Invalid title", 400);
  }

  const task = await taskRepository.create(title);

  return task;
};

const updateTask = async (id, title, done) => {
  if (!title && !done){
    throw httpError("Title or done status is required", 400);
  }


  if (title){
    if (typeof title !== "string" || title.trim() === ""){
      throw httpError("Invalid title", 400);
    }
  }

  if (done){
    if (typeof done !== "boolean"){
      throw httpError("Invalid done status", 400);
    }
  }

  const task = await taskRepository.update(id, title, done);

  if (!task){
    throw httpError(`Task ${id} not found`, 404);
  }

  return task;
};

const deleteTask = async (id) => {
  const result = await taskRepository.remove(id);

  if (result === 0){
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
