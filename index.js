const http = require("http");
const app = require("./src/app");
const server = http.createServer(app);
const Logger = require("./src/utils/logger");

require("./src/config/database").connect();

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

// server listening
server.listen(port, () => {
  Logger.info(`Server running on port ${port}`);
});
