const { pool, insertTask } = require("../db");

const findAll = async (filters) => {
  let queryTasks = "SELECT * FROM tasks WHERE 1=1";
  const params = [];
  if (filters.search){
    queryTasks += " AND lower(title) LIKE lower($1)";
    params.push(`%${filters.search}%`);
  }
  if (filters.done){
    queryTasks += " AND done = $2";
    params.push(filters.done === "true" ? 1 : 0);
  }
  if (filters.sort === "title"){
    queryTasks += " ORDER BY title";
  }

  const result = await pool.query(
    queryTasks,
    params
  );
  console.log(result);

  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE id = $1",
    [id]
  );

  return result.rows[0];
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

