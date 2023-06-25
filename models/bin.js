import pool from "../pool.js";

class Bin {
  static async getAll() {
    const sql = "SELECT * FROM bin";

    try {
      return await pool.query(sql);
    } catch(error) {
      console.log(error)
    }
  }

  static async getByUuid(uuid) {
    try {
      const binIdQuery = "SELECT id FROM bin WHERE endpoint=$1";
      let result = await pool.query(binIdQuery, [uuid]);
      const id = result.rows[0].id;

      const payloadQuery = "SELECT http_request, http_timestamp FROM payload WHERE bin_id=$1";
      result = await pool.query(payloadQuery, [String(id)]);

      return result.rows;
    } catch (error) {
      console.log(error)
    }
  }

  static async create(uuid) {
    try {
      const sql = "INSERT INTO bin (endpoint) VALUES ($1)";
      await pool.query(sql, [uuid]);
    } catch (error) {
      console.log(error)
    }
  }

  static async deleteBin(uuid) {
    try {
      const binIdQuery = "SELECT id FROM bin WHERE endpoint=$1";
      const result = await pool.query(binIdQuery, [uuid]);
      const id = result.rows[0].id;

      const deleteBinQuery = "DELETE FROM bin WHERE id=$1";
      await pool.query(deleteBinQuery,  [id]);

    } catch (error) {
      console.log(error)
    }
  }

  static async storePayload(payload, timestamp, uuid) {
    try {
      const binIdQuery = "SELECT id FROM bin WHERE endpoint=$1";
      const result = await pool.query(binIdQuery, [uuid]);
      const id = result.rows[0].id;

      const storePayloadQuery = `INSERT INTO payload (http_request, http_timestamp, bin_id) VALUES ($1, $2, $3) RETURNING http_request`;
      await pool.query(storePayloadQuery, [payload, timestamp, id]);
    } catch (error) {
      console.log(error)
    }
  }
}

export default Bin;
