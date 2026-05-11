require("dotenv").config();

const { createServer } = require("node:http");
const app = require("./app");

const port = Number(process.env.PORT || 4000);
const httpServer = createServer(app);

httpServer.listen(port, () => {
  console.log(`InviteHub legacy backend stub listening on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down legacy backend stub...`);
  httpServer.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
