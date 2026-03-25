// 🔥 ONLY ONE SOCKET — DO NOT DUPLICATE
const socket = io(window.location.origin, {
  transports: ["websocket"]
});

let pc = null;
let localStream = null;

const remoteVideo = document.getElementById("remoteVideo");
const localVideo = document.getElementById("localVideo");
const statusText = document.getElementById("status");

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

// 🎥 INIT
async function init() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localVideo.srcObject = localStream;
    localVideo.classList.add("show");

    console.log("Camera OK");

    socket.emit("join");
  } catch (err) {
    alert("Camera permission needed");
    console.error(err);
  }
}

// 🔗 MATCH
socket.on("matched", async ({ initiator }) => {
  console.log("Matched");

  statusText.innerText = "Connected";

  createPeer();

  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
  }
});

// 🧠 PEER
function createPeer() {
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
}

// 📥 OFFER
socket.on("offer", async (offer) => {
  createPeer();

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
  statusText.innerText = "Disconnected";
  location.reload();
});

// 🎛️ CONTROLS
function nextUser() {
  location.reload();
}

function toggleMute() {
  if (localStream)
    localStream.getAudioTracks()[0].enabled ^= true;
}

function toggleCamera() {
  if (localStream)
    localStream.getVideoTracks()[0].enabled ^= true;
}

init();
