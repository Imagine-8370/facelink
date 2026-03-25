// 🔌 IMPORTANT: replace with your deployed URL
const socket = io();

let pc;
let localStream;

const statusText = document.getElementById("status");

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:YOUR_SERVER_IP:3478",
      username: "user",
      credential: "facelinksecret"
    }
  ]
};

async function init() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;
  socket.emit("join");
}

socket.on("matched", async ({ initiator }) => {
  statusText.innerText = "Connected";

  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.ontrack = e => remoteVideo.srcObject = e.streams[0];

  pc.onicecandidate = e => {
    if (e.candidate) socket.emit("ice-candidate", e.candidate);
  };

  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
  }
});

socket.on("offer", async (offer) => {
  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.ontrack = e => remoteVideo.srcObject = e.streams[0];

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", answer);
});

socket.on("answer", async (answer) => {
  if (pc) await pc.setRemoteDescription(answer);
});

socket.on("ice-candidate", async (c) => {
  try {
    if (pc) await pc.addIceCandidate(c);
  } catch (e) {}
});

socket.on("chat", msg => {
  messages.innerHTML += `<p class="stranger">${msg}</p>`;
});

socket.on("partner-disconnected", () => {
  statusText.innerText = "Disconnected";
  location.reload();
});

function sendMessage() {
  const msg = document.getElementById("msg").value;
  socket.emit("chat", msg);
  messages.innerHTML += `<p class="you">${msg}</p>`;
  document.getElementById("msg").value = "";
}

function nextUser() {
  socket.emit("next");
  location.reload();
}

function toggleMute() {
  localStream.getAudioTracks()[0].enabled ^= true;
}

function toggleCamera() {
  localStream.getVideoTracks()[0].enabled ^= true;
}

function reportUser() {
  socket.emit("report");
  alert("User reported");
}

init();