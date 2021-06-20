import React from 'react';
import './App.css';
import {Button} from '@material-ui/core';
import {connectToWebRTCApi, connectToSocketServer} from './Connections.js';
import {socketServerHost} from "./Config";
import Video from "./Video.js";

// TODO: Go through repo and understand what the different files do
// TODO: Should connections go here or better in component did mount?
const socketServer = connectToSocketServer()
const webRTCApi = connectToWebRTCApi()

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {"calls": {}}
    this.createAndJoinRoom = this.createAndJoinRoom.bind(this);
    this.saveInput = this.saveInput.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.submitJoinRoom = this.submitJoinRoom.bind(this);
    this.addVideoStreamToGrid = this.addVideoStreamToGrid.bind(this);
    this.saveMyWebRTCId = this.saveMyWebRTCId.bind(this);
    this.startMyStream = this.startMyStream.bind(this);
    this.registerFunctionToHandleIncomingWebRTCCall = this.registerFunctionToHandleIncomingWebRTCCall.bind(this);
    this.registerFunctionToHandleNewUserConnectingFromServer = this.registerFunctionToHandleNewUserConnectingFromServer.bind(this)
    this.registerFunctionToHandleUserDisconnectingFromServer = this.registerFunctionToHandleUserDisconnectingFromServer.bind(this)
  }

  componentDidMount() {
    const videoGrid = document.getElementById('video-grid')
    this.saveMyWebRTCId()
    this.startMyStream()
    this.registerFunctionToHandleIncomingWebRTCCall(videoGrid)
    this.registerFunctionToHandleNewUserConnectingFromServer(videoGrid)
    this.registerFunctionToHandleUserDisconnectingFromServer()
  }

  saveMyWebRTCId() {
    webRTCApi.on('open', id => {
      console.log("Peerjs id ", id)
      this.setState({'id': id})
    })
  }

  startMyStream() {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
     }).then(stream => {
      console.log("Set my stream", stream)
      this.setState({"myStream": stream})
    })
  }

  registerFunctionToHandleIncomingWebRTCCall(videoGrid) {
    webRTCApi.on('call', call => {
        call.answer(this.state.myStream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          this.addVideoStreamToGrid(video, userVideoStream, videoGrid)
        })
    })
  }

  registerFunctionToHandleNewUserConnectingFromServer( videoGrid) {
    socketServer.on('user-connected', userId => {
        console.log("New user connected", userId)
        const call = webRTCApi.call(userId, this.state.myStream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          this.addVideoStreamToGrid(video, userVideoStream, videoGrid)
        })
        call.on('close', () => {
          video.remove()
        })
        this.setState({"calls":  { ...this.state.calls, [userId] : call }})
    })
  }

  registerFunctionToHandleUserDisconnectingFromServer() {
    socketServer.on('user-disconnected', userId => {
      console.log(this.state.calls, userId)
      if (this.state.calls[userId]) this.state.calls[userId].close()
    })
  }

  addVideoStreamToGrid(video, stream, videoGrid) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  }


  createAndJoinRoom() {
    fetch(socketServerHost + "/create-new-room")
        .then(res => res.json())
        .then((data) => {
          this.setState({roomId: data["roomId"]})
          console.log("Joining room")
          this.joinRoom(this.state.roomId)
        })
        .catch(console.log)
  }

  saveInput(e) {
    this.setState({input: e.target.value});
  }

  submitJoinRoom() {
    this.joinRoom(this.state.input)
  }

  joinRoom(roomId) {
    console.log("Joining room", roomId);
    socketServer.emit('join-room', roomId, this.state.id)
  }

  render() {
    return (
        <div className="App">
          <header className="App-header">
            <p>
              Chat with your m8's!
            </p>
            <Button variant="contained" color="primary" onClick={this.createAndJoinRoom}>
              Create room
            </Button>
            <div><input
                type="button"
                value="Join room"
                onClick={this.submitJoinRoom}
            />
              <input type="text" onChange={this.saveInput}/>
            </div>
            <p>{this.state.roomId ? 'Room name: ' + this.state.roomId : ''}</p>
            <div id="video-grid">
              <Video stream={this.state.myStream} name={"Sonja"} autoPlay muted/>
            </div>
          </header>
        </div>
    );
  }
}

export default App;
