// ✅ IMPORTS (ONLY ONCE — IMPORTANT)
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

// ✅ APP SETUP
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ USER QUEUE
let queue = new Set();

// 🔗 MATCH USERS (NO GLARE ISSUE)
function matchUsers() {
  const users = Array.from(queue);

  while (users.length >= 2) {
    const a = users.shift();
    const b = users.shift();

    queue.delete(a);
    queue.delete(b);

    a.partner = b;
    b.partner = a;

    // one initiator only (important)
    a.emit("matched", { initiator: true });
    b.emit("matched", { initiator: false });
  }
}

// 🔌 SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join queue
  socket.on("join", () => {
    queue.add(socket);
    matchUsers();
  });

  // signaling
  socket.on("offer", (data) => {
    if (socket.partner) socket.partner.emit("offer", data);
  });

  socket.on("answer", (data) => {
    if (socket.partner) socket.partner.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    if (socket.partner) socket.partner.emit("ice-candidate", data);
  });

  // next user (skip)
  socket.on("next", () => {
    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("partner-disconnected");
    }

    socket.partner = null;
    queue.add(socket);
    matchUsers();
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    queue.delete(socket);

    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("partner-disconnected");
    }
  });
});

// 🌐 HEALTH CHECK (useful for deployment)
app.get("/health", (req, res) => {
  res.send("OK");
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Facelink server running on port ${PORT}`);
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
  socket.on("join", () => {
    queue.add(socket);
    matchUsers();
  });

  socket.on("offer", d => socket.partner?.emit("offer", d));
  socket.on("answer", d => socket.partner?.emit("answer", d));
  socket.on("ice-candidate", d => socket.partner?.emit("ice-candidate", d));

  socket.on("disconnect", () => {
    queue.delete(socket);

    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("partner-disconnected");
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Facelink running 🚀"));require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const Filter = require("bad-words");

const app = express();

// 🔐 Security
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(express.static(path.join(__dirname, "../client")));

const server = http.createServer(app);
const io = new Server(server);

const filter = new Filter();

let queue = new Set();
let reports = {};
let bannedUsers = new Set();

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
  console.log(`[${new Date().toISOString()}] ${socket.id} connected`);

  if (bannedUsers.has(socket.id)) {
    socket.disconnect();
    return;
  }

  socket.on("join", () => {
    queue.add(socket);
    matchUsers();
  });

  socket.on("next", () => {
    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("partner-disconnected");
    }

    socket.partner = null;
    queue.add(socket);
    matchUsers();
  });

  socket.on("offer", d => socket.partner?.emit("offer", d));
  socket.on("answer", d => socket.partner?.emit("answer", d));
  socket.on("ice-candidate", d => socket.partner?.emit("ice-candidate", d));

  socket.on("chat", (msg) => {
    if (filter.isProfane(msg)) {
      socket.emit("warning", "⚠️ Message blocked");
      return;
    }
    socket.partner?.emit("chat", msg);
  });

  socket.on("report", () => {
    const target = socket.partner?.id;
    if (!target) return;

    reports[target] = (reports[target] || 0) + 1;

    if (reports[target] >= 3) {
      bannedUsers.add(target);
      io.to(target).emit("banned");
    }
  });

  socket.on("disconnect", () => {
    queue.delete(socket);

    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("partner-disconnected");
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Facelink Production Ready 🚀"));
