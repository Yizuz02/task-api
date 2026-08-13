const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function createTable() {
  const result = await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

async function insertTask({ title, done }) {
  const result = await pool.query(
    `
      INSERT INTO tasks (title, done)
      VALUES ($1, $2)
      RETURNING *
    `,
    [title, done]
  )

  return result.rows[0]
}

async function insertManyTask(tasks) {
  if (tasks.length === 0) {
    return []
  }

  const values = []
  const placeholders = []

  tasks.forEach((task, index) => {
    const offset = index * 2

    placeholders.push(`($${offset + 1}, $${offset + 2})`)
    values.push(task.title, task.done)
  })

  const result = await pool.query(
    `
      INSERT INTO tasks (title, done)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `,
    values
  )

  return result.rows
}


async function manageDatabase() {
  await createTable()

  const result = await pool.query('SELECT COUNT(*) FROM tasks')
  const numRows = Number(result.rows[0].count)

  if (numRows === 0) {
    const tasks = await insertManyTask([
      { title: 'Study JavaScript', done: false },
      { title: 'Develop To-Do list API for Intership', done: false },
      { title: 'Buy groceries', done: true }
    ])

    console.log(tasks)
  }
}

manageDatabase()

module.exports = { pool, insertTask };

process.on('SIGINT', async () => {
  await pool.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await pool.end()
  process.exit(0)
})
