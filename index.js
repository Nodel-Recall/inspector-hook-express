require("dotenv").config();
const app = require("./app");

const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
