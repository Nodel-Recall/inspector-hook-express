require("dotenv").config();
const server = require("./app");

const PORT = process.env.BACKEND_PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
