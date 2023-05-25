const binRoutes = require("express").Router();
const jsonStringifySafe = require("json-stringify-safe");
// above package is needed to stringify the http request due to request containing circular references and throwing an error
const pool = require("../pool");
// const URL = process.env.ENDPOINT; // no longer needed
const { v4: uuidv4 } = require("uuid");

// home route, returns att the uuids currently in the bin table
binRoutes.get("/", async (req, res) => {
  const sql = "SELECT * FROM bin";
  const results = await pool.query(sql);
  res.send(results.rows).end();
});

// route for adding a new uuid to the bin table and returns that uuid to the UI
binRoutes.get("/hook/new", async (req, res) => {
  // create a new uuid and store in the bin table
  const uuid = uuidv4();
  const sql = "INSERT INTO bin (endpoint) VALUES ($1)";
  await pool.query(sql, [uuid]);
  // send the new uuid back
  res.send(uuid).end();
});

// returns the payloads of the given uuid
binRoutes.get("/hook/:uuid", async (req, res) => {
  // extract the uuid from the path
  const uuid = req.params.uuid;
  //get the id of our given uuid from the bin table
  const sql = "SELECT id FROM bin WHERE endpoint=$1";
  const result = await pool.query(sql, [uuid]);
  const id = result.rows[0].id;
  // get the payload data from the payload table with the given uuid
  const sql2 = "SELECT http_request, http_timestamp FROM payload WHERE bin_id=$1";
  const payloadRequests = await pool.query(sql2, [String(id)]);
  // sent the payload data to the frontend
  res.send(payloadRequests.rows).end();
});

// delete uuid in bin table
binRoutes.delete("/hook/:uuid", async (req, res) => {
  //
});

// webhook route
binRoutes.post("/hook/:uuid", async (req, res) => {
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
});

/*
needed functionality:
  websocket config to tell front that PORT request was received.
*/

module.exports = binRoutes;
