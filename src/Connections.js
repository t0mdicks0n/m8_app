import Peer from "peerjs";
import {io} from "socket.io-client";
import {socketServerHost, webrtcApiHostOptions} from "./Config";


export function connectToSocketServer() {
  console.log("Connect to server", socketServerHost)
  return io(socketServerHost)
}

export function connectToWebRTCApi() {
  console.log("Connect to WebRTC API server", webrtcApiHostOptions.host)
  return new Peer(undefined, webrtcApiHostOptions)
}






