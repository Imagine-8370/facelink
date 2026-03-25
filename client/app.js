const socket = io(window.location.origin, {
  transports: ["websocket"]
});

let pc;
let localStream;

const remoteVideo = document.getElementById("remoteVideo");
const localVideo = document.getElementById("localVideo");
const statusText = document.getElementById("status");

// ICE CONFIG
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

// START
async function init() {
  console.log("Starting camera...");

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  console.log("Camera started");

  localVideo.srcObject = localStream;
  localVideo.classList.add("show");

  console.log("Joining server...");
  socket.emit("join");
}

// MATCH
socket.on("matched", async ({ initiator }) => {
  console.log("Matched!");

  statusText.innerText = "Connected";

  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    console.log("Stream received");
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.classList.add("show");
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
  }
});

// OFFER
socket.on("offer", async (offer) => {
  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.classList.add("show");
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", answer);
});

// ANSWER
socket.on("answer", async (answer) => {
  if (pc) await pc.setRemoteDescription(answer);
});

// ICE
socket.on("ice-candidate", async (candidate) => {
  try {
    if (pc) await pc.addIceCandidate(candidate);
  } catch (e) {
    console.error(e);
  }
});

// DISCONNECT
socket.on("partner-disconnected", () => {
  statusText.innerText = "Disconnected";
  location.reload();
});

// CONTROLS
function nextUser() {
  location.reload();
}

function toggleMute() {
  localStream.getAudioTracks()[0].enabled ^= true;
}

function toggleCamera() {
  localStream.getVideoTracks()[0].enabled ^= true;
}

init();const socket = io();

let pc;
let localStream;

const remoteVideo = document.getElementById("remoteVideo");
const localVideo = document.getElementById("localVideo");
const statusText = document.getElementById("status");

// 🌐 STUN + TURN
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

// 🎥 START CAMERA
async function init() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;
  setTimeout(() => localVideo.classList.add("show"), 200);

  socket.emit("join");
}

// 🔗 MATCH
socket.on("matched", async ({ initiator }) => {
  updateStatus("Connected");

  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.classList.add("show");
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
  }
});

// 📥 OFFER
socket.on("offer", async (offer) => {
  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.classList.add("show");
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", answer);
});

// 📥 ANSWER
socket.on("answer", async (answer) => {
  if (pc) await pc.setRemoteDescription(answer);
});

// 📥 ICE
socket.on("ice-candidate", async (candidate) => {
  try {
    if (pc) await pc.addIceCandidate(candidate);
  } catch (e) {
    console.error(e);
  }
});

// 🔄 DISCONNECT
socket.on("partner-disconnected", () => {
  updateStatus("Disconnected");
  location.reload();
});

// 🎛️ CONTROLS
function nextUser() {
  remoteVideo.classList.remove("show");
  localVideo.classList.remove("show");

  setTimeout(() => location.reload(), 400);
}

function toggleMute() {
  localStream.getAudioTracks()[0].enabled ^= true;
}

function toggleCamera() {
  localStream.getVideoTracks()[0].enabled ^= true;
}

// ✨ STATUS ANIMATION
function updateStatus(text) {
  statusText.style.opacity = 0;

  setTimeout(() => {
    statusText.innerText = text;
    statusText.style.opacity = 1;
  }, 200);
}

init();const socket = io();

let pc;
let localStream;

const remoteVideo = document.getElementById("remoteVideo");
const localVideo = document.getElementById("localVideo");
const statusText = document.getElementById("status");

// 🌐 STUN + TURN
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

// 🎥 START CAMERA
async function init() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;

  setTimeout(() => localVideo.classList.add("show"), 200);

  socket.emit("join");
}

// 🔗 MATCHED
socket.on("matched", async ({ initiator }) => {
  updateStatus("Connected");

  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.classList.add("show");
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
  }
});

// 📥 OFFER
socket.on("offer", async (offer) => {
  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.classList.add("show");
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", answer);
});

// 📥 ANSWER
socket.on("answer", async (answer) => {
  if (pc) await pc.setRemoteDescription(answer);
});

// 📥 ICE
socket.on("ice-candidate", async (candidate) => {
  try {
    if (pc) await pc.addIceCandidate(candidate);
  } catch (e) {
    console.error(e);
  }
});

// 🔄 DISCONNECT
socket.on("partner-disconnected", () => {
  updateStatus("Disconnected");
  location.reload();
});

// 🎛️ CONTROLS
function nextUser() {
  remoteVideo.classList.remove("show");
  localVideo.classList.remove("show");

  setTimeout(() => location.reload(), 400);
}

function toggleMute() {
  localStream.getAudioTracks()[0].enabled ^= true;
}

function toggleCamera() {
  localStream.getVideoTracks()[0].enabled ^= true;
}

// ✨ STATUS ANIMATION
function updateStatus(text) {
  statusText.style.opacity = 0;

  setTimeout(() => {
    statusText.innerText = text;
    statusText.style.opacity = 1;
  }, 200);
}

init();const socket = io();

let pc;
let localStream;

const statusText = document.getElementById("status");

// ✅ TURN + STUN (IMPORTANT)
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

// 🎥 Start camera
async function init() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;
  socket.emit("join");
}

// 🔗 Match
socket.on("matched", async ({ initiator }) => {
  statusText.innerText = "Connected";

  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  // 🔥 FIX: only one creates offer
  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
  }
});

// 📥 Offer
socket.on("offer", async (offer) => {
  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", answer);
});

// 📥 Answer
socket.on("answer", async (answer) => {
  if (pc) await pc.setRemoteDescription(answer);
});

// 📥 ICE
socket.on("ice-candidate", async (candidate) => {
  try {
    if (pc) await pc.addIceCandidate(candidate);
  } catch (e) {
    console.error(e);
  }
});

socket.on("partner-disconnected", () => {
  statusText.innerText = "Disconnected";
  location.reload();
});

// 🎛️ Controls
function nextUser() {
  location.reload();
}

function toggleMute() {
  localStream.getAudioTracks()[0].enabled ^= true;
}

function toggleCamera() {
  localStream.getVideoTracks()[0].enabled ^= true;
}

init();
