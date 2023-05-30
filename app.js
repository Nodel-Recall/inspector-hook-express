const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
// below no longer used because of websocket complications
// const binRoutes = require("./controllers/binRoutes.js");

const { Server } = require("socket.io");

app.use(cors());

// websocket cors
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_PORT,
    methods: ["GET", "POST", "DELETE"],
  },
});

// from controller/bin
const jsonStringifySafe = require("json-stringify-safe");
// above package is needed to stringify the http request due to request containing circular references and throwing an error
const pool = require("./pool");
// const URL = process.env.ENDPOINT; // no longer needed
const { v4: uuidv4 } = require("uuid");

// io.on("connection", (socket) => {
//   console.log("user connected");
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
//   socket.on("update received", (data) => {
//     console.log(data);
//   });
// });

// home route, returns all the uuids currently in the bin table
app.get("/hook", async (req, res) => {
  const sql = "SELECT * FROM bin";
  const results = await pool.query(sql);
  res.send(results.rows).end();
});

// route for adding a new uuid to the bin table and returns that uuid to the UI
app.get("/hook/new", async (req, res) => {
  // create a new uuid and store in the bin table
  const uuid = uuidv4();
  const sql = "INSERT INTO bin (endpoint) VALUES ($1)";
  await pool.query(sql, [uuid]);
  // send the new uuid back
  res.send(uuid).end();
  io.emit("new bin");
});

// returns the payloads of the given uuid
app.get("/hook/:uuid", async (req, res) => {
  // extract the uuid from the path
  const uuid = req.params.uuid;
  //get the id of our given uuid from the bin table
  const sql = "SELECT id FROM bin WHERE endpoint=$1";
  const result = await pool.query(sql, [uuid]);
  const id = result.rows[0].id;
  // get the payload data from the payload table with the given uuid
  const sql2 =
    "SELECT http_request, http_timestamp FROM payload WHERE bin_id=$1";
  const payloadRequests = await pool.query(sql2, [String(id)]);
  // sent the payload data to the frontend
  res.send(payloadRequests.rows).end();
});

// delete uuid in bin table
app.delete("/hook/:uuid", async (req, res) => {
  const uuid = request.params.uuid;
  const sql = "DELETE FROM bin WHERE endpoint= $1";
  await pool.query(sql, [uuid]);
  res.status(204).end();
});

// webhook route
app.post("/hook/:uuid", async (req, res) => {
  // extract the uuid from the path
  const uuid = req.params.uuid;
  // get the ID from the bin table
  const sql = "SELECT id FROM bin WHERE endpoint=$1";
  const result = await pool.query(sql, [uuid]);
  const id = result.rows[0].id;
  // create timestamp
  const timeStamp = new Date();
  // safely stringify the request
  req = jsonStringifySafe(req);
  // insert the request into the payload table
  const sql2 = `INSERT INTO payload (http_request, http_timestamp, bin_id) VALUES ($1, $2, $3) RETURNING http_request`;
  await pool.query(sql2, [req, timeStamp, id]);
  res.status(200).end();

  io.emit("webhook received", uuid);
});

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(express.json());
app.use(requestLogger);
app.use(express.static("build"));

// ROUTES
// app.use("/", binRoutes); // no longer needed because routes are in this file
app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = server;
