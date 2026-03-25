const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let queue = [];

function matchUsers() {
  while (queue.length >= 2) {
    const a = queue.shift();
    const b = queue.shift();

    a.partner = b;
    b.partner = a;

    a.emit("matched", { initiator: true });
    b.emit("matched", { initiator: false });
  }
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", () => {
    console.log("User joined queue");
    queue.push(socket);
    matchUsers();
  });

  socket.on("offer", d => socket.partner?.emit("offer", d));
  socket.on("answer", d => socket.partner?.emit("answer", d));
  socket.on("ice-candidate", d => socket.partner?.emit("ice-candidate", d));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    queue = queue.filter(s => s !== socket);

    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("partner-disconnected");
    }
  });
});

app.get("/health", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));

const server = http.createServer(app);
const io = new Server(server);

let queue = [];

function matchUsers() {
  while (queue.length >= 2) {
    const a = queue.shift();
    const b = queue.shift();

    a.partner = b;
    b.partner = a;

    a.emit("matched", { initiator: true });
    b.emit("matched", { initiator: false });
  }
}

io.on("connection", (socket) => {
  console.log("User:", socket.id);

  socket.on("join", () => {
    queue.push(socket);
    matchUsers();
  });

  socket.on("offer", d => socket.partner?.emit("offer", d));
  socket.on("answer", d => socket.partner?.emit("answer", d));
  socket.on("ice-candidate", d => socket.partner?.emit("ice-candidate", d));

  socket.on("disconnect", () => {
    queue = queue.filter(s => s !== socket);

    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("partner-disconnected");
    }
  });
});

server.listen(process.env.PORT || 3000);const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

let queue = new Set();

function matchUsers() {
  const users = Array.from(queue);

  while (users.length >= 2) {
    const a = users.shift();
    const b = users.shift();

    queue.delete(a);
    queue.delete(b);

    a.partner = b;
    b.partner = a;

    a.emit("matched", { initiator: true });
    b.emit("matched", { initiator: false });
  }
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join", () => {
    queue.add(socket);
    matchUsers();
  });

  socket.on("offer", d => socket.partner?.emit("offer", d));
  socket.on("answer", d => socket.partner?.emit("answer", d));
  socket.on("ice-candidate", d => socket.partner?.emit("ice-candidate", d));

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    queue.delete(socket);

    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("partner-disconnected");
    }
  });
});

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
