const binRoutes = require("express").Router();
const jsonStringifySafe = require("json-stringify-safe");
// above package is needed to stringify the http request due to request containing circular references and throwing an error
const pool = require("../pool");
const URL = process.env.ENDPOINT;

binRoutes.get("/", async (req, res) => {
  //get the id from the bin table of our current endpoint (whose url is in the .env file)
  const sql = "SELECT id FROM bin WHERE endpoint=$1";
  const result = await pool.query(sql, [URL]);
  const id = result.rows[0].id;
  // get the payload data from the  payload table with the current url
  const sql2 = "SELECT http_request FROM payload WHERE bin_id=$1";
  const payloadRequests = await pool.query(sql2, [String(id)]);
  // sent the payload data to the frontend
  res.send(payloadRequests.rows);
});

binRoutes.get("/$uuid", (req, res) => {
  // possible route if there will be multiple url's the app can have webhooks send to
  // get info from db and send in response
});

binRoutes.post("/", async (req, res) => {
  // get the ID from the bin table
  const sql = "SELECT id FROM bin WHERE endpoint=$1";
  const result = await pool.query(sql, [URL]);
  const id = result.rows[0].id;
  // get the timestamp from the request
  const timeStamp = req.body.repository.updated_at;
  // safely stringify the request
  req = jsonStringifySafe(req);
  // insert the request into the payload table
  const sql2 = `INSERT INTO payload (http_request, http_timestamp, bin_id) VALUES ($1, $2, $3) RETURNING http_request`;
  await pool.query(sql2, [req, timeStamp, id]);

  /*
  needed functionality:
    send the payload data to the build(frontend) to diplay the most recent webhook request or simply tell the frontend to update its display by sending a GET request.
  */
});

module.exports = binRoutes;
