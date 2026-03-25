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

async function init() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localVideo.srcObject = localStream;
    localVideo.classList.add("show");

    socket.emit("join");
  } catch (err) {
    alert("Camera permission required");
  }
}

socket.on("matched", async ({ initiator }) => {
  statusText.innerText = "Connected";

  createPeer();

  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
  }
});

function createPeer() {
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
}

socket.on("offer", async (offer) => {
  createPeer();

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", answer);
});

socket.on("answer", async (answer) => {
  if (pc) await pc.setRemoteDescription(answer);
});

socket.on("ice-candidate", async (candidate) => {
  if (pc) await pc.addIceCandidate(candidate);
});

socket.on("partner-disconnected", () => {
  location.reload();
});

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
