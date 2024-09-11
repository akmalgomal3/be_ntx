const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require('http');
const exampleController = require('./app/controllers/exampleController');
const { verifyToken, checkRole } = require('./app/middleware/exampleMiddleware');

dotenv.config();
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: ["http://localhost:8080"],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./app/models");

db.sequelize.sync();

// never enable the code below in production
// force: true will drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and Resync Database with { force: true }");
//   // initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

// Setup WebSocket
exampleController.callmeWebSocket(server);

// Setup new routes
app.get('/api/data', [verifyToken, checkRole('WFO')], exampleController.getData);
app.post('/api/survey', [verifyToken], exampleController.refactoreMe2);
app.get('/api/survey-stats', [verifyToken], exampleController.refactoreMe1);
app.post('/api/login', exampleController.login);

// routes
// require("./app/routes/example.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 7878;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app; // For testing purposes