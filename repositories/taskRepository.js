const { pool, insertTask } = require("../db");

const findAll = async (filters) => {
  let queryTasks = "SELECT * FROM tasks WHERE 1=1";
  const params = [];

  if (filters.search){
    params.push(`%${filters.search}%`);
    queryTasks += ` AND lower(title) LIKE lower($${params.length})`;
  }

  if (filters.done){
    params.push(filters.done);
    queryTasks += ` AND done = $${params.length}`;
   
  }
  if (filters.sort === "title"){
    queryTasks += " ORDER BY title";
  }

  const result = await pool.query(
    queryTasks,
    params
  );

  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

const create = async (title) => {
  const result = await pool.query(
    "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *",
    [title, 0]
  );

  return result.rows[0];
};

const update = async (id, title, done) => {
  let updateQuery = "UPDATE tasks SET ";
  

  const params = [];

  if (title){
    params.push(title)
    updateQuery += `title = $${params.length}, `;
  }

  if (done){
    params.push(done)
    updateQuery += `done = $${params.length}, `;
  }

  params.push(id)
  updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`;

  const result = await pool.query(
    updateQuery,
    params
  );

  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1',
    [id]
  )

  return result.rowCount
};

const countAll = async () => {
  const result = await pool.query(
    "SELECT COUNT(*) AS count FROM tasks"
  )

  return Number(result.rows[0].count)
};

const countDone = async () => {
  const result = await pool.query(
    "SELECT COUNT(*) AS count FROM tasks WHERE done = TRUE"
  )

  return Number(result.rows[0].count)
};

module.exports = { findAll, findById, create, update, remove, countAll, countDone };

