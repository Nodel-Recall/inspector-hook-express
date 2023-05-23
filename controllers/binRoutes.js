const binRoutes = require("express").Router();
let pool;

if (process.env.NODE_ENV === "production") {
  pool = require("../pool");
} else if (process.env.NODE_ENV === "development") {
  const { Pool } = require("pg");
  pool = new Pool();
}

binRoutes.get("/", async (req, res) => {
  const results = await pool.query("SELECT NOW()"); // testing query
  await pool.end();
  res.send(results);
});
binRoutes.get("/$uuid", (req, res) => {
  // get info from db and send in response
});

binRoutes.post("/$uuid", (req, res) => {
  // take sent data and put into the DB
});

module.exports = binRoutes;
