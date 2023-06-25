import dotenv from 'dotenv';
dotenv.config();

import app from "./app.js";

const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
