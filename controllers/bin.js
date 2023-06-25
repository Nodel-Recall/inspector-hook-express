import jsonStringifySafe from "json-stringify-safe";
import { v4 as uuidv4 } from "uuid";

import Bin from '../models/bin.js';

import { Router } from "express";
const binRoutes = Router();

binRoutes.get("/", async (req, res) => {
  try {
    const result = await Bin.getAll();
    res.send(result.rows);
  } catch {
    res.status(500).send('Error fetching bins');
  }
});

binRoutes.post("/new", async (req, res) => {
  try {
    const uuid = uuidv4();
    await Bin.create(uuid);
    res.send(uuid);
  } catch {
    res.status(500).send('Error creating bin');
  }
});

binRoutes.get("/:uuid", async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const payloads = await Bin.getByUuid(uuid);
    res.send(payloads);
  } catch {
    res.status(500).send('Error fetching payloads');
  }
});

binRoutes.delete("/:uuid", async (req, res) => {
  try {
    const uuid = req.params.uuid;
    await Bin.deleteBin(uuid);
    res.status(200).end();
  } catch {
    res.status(500).send('Error deleting bin');
  }
});

binRoutes.post("/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  const timestamp = new Date();
  const payload = jsonStringifySafe(req);

  try {
    await Bin.storePayload(payload, timestamp, uuid)
    res.status(200).end();
  } catch {
    res.status(500).send('Error storing payload');
  }

  res.status(200).end();
});

export default binRoutes;
