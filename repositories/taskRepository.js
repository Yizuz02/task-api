const { db, insertTask } = require("../db");

const findAll = (filters) => {
  let queryTasks = "SELECT * FROM tasks WHERE 1=1";
  const params = {};
  if (filters.search){
    queryTasks += " AND lower(title) LIKE lower(@title)";
    params.title = `%${filters.search}%`;
  }
  if (filters.done){
    queryTasks += " AND done = @done";
    params.done = filters.done === "true" ? 1 : 0;
  }
  if (filters.sort === "title"){
    queryTasks += " ORDER BY title";
  }
  return db.prepare(queryTasks).all(params);
};

const findById = (id) => {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
};

const create = (task) => {
  insertTask.run(task);
};

const update = (id, data) => {
  let updateQuery = "UPDATE tasks SET ";
  let params = {};

  params.id = id;

  if ("title" in data){
    updateQuery += "title = @title, ";
    params.title = data.title;
  }

  if ("done" in data){
    updateQuery += "done = @done, ";
    params.done = data.done === true ? 1 : 0;
  }

  updateQuery += "updated_at = CURRENT_TIMESTAMP WHERE id = @id";

  db.prepare(updateQuery).run(params);

  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
};

const remove = (id) => {
  return db.prepare("DELETE FROM tasks WHERE id = @id").run({ id: id });
};

const countAll = () => {
  return db.prepare("SELECT COUNT(*) as count FROM tasks;").get().count;
};

const countDone = () => {
  return db.prepare("SELECT COUNT(*) as count FROM tasks WHERE done = 1;").get().count;
};

module.exports = { findAll, findById, create, update, remove, countAll, countDone };
