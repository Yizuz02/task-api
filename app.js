const express = require("express");
const app = express();

const port = 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");

const taskRouter = require("./routes/taskRoutes");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

app.use("/", taskRouter);

app.listen(port, () => {
  console.log(`To-do API listening on port ${port}`);
});
