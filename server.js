const http = require("http");
const processor = require("./processor");

const port = process.env.PORT || 3000;
const server = http.createServer(processor);

server.listen(port);
