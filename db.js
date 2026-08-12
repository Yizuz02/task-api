const Database = require("better-sqlite3");

const db = new Database("tasks.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INT NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

const insertTask = db.prepare(`
    INSERT INTO tasks (title, done)
    VALUES (@title, @done)
`);

const insertManyTask = db.transaction((tasks) => {
  for (const task of tasks) insertTask.run(task);
});

const numRows = db.prepare("SELECT COUNT(*) as count FROM tasks;").get().count;

if (numRows === 0){
  insertManyTask([
    {title: "Study JavaScript", done: 0},
    {title: "Develop To-Do list API for Intership", done: 0},
    {title: "Buy groceries", done: 1}
  ]);
}

module.exports = { db, insertTask };
