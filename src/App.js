import React from 'react';
import './App.css';
import { Button } from '@material-ui/core';
import {connectToWebRTCApi, connectToSocketServer} from './Connections.js';
import {socketServerHost} from "./Config";

// TODO: Should connections go here or better in component did mount?
const socketServer = connectToSocketServer()
const webRTCApi = connectToWebRTCApi()

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {}
    this.setState({})
    this.createAndJoinRoom = this.createAndJoinRoom.bind(this);
    this.saveInput = this.saveInput.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.submitJoinRoom = this.submitJoinRoom.bind(this);
  }

  componentDidMount() {


    const videoGrid = document.getElementById('video-grid')
    const myVideo = document.createElement('video')

    myVideo.muted = true
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      addVideoStream(myVideo, stream)
      webRTCApi.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

      socketServer.on('user-connected', userId => {
        console.log("New user connected", userId)
        connectToNewUser(userId, stream)
      })
    })

    const peers = {}

    socketServer.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })

    webRTCApi.on('open', id => {
      console.log("Peerjs id ", id)
      this.setState({'id': id})
    })

    function connectToNewUser(userId, stream) {
      const call = webRTCApi.call(userId, stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
      call.on('close', () => {
        video.remove()
      })

      peers[userId] = call
    }

    function addVideoStream(video, stream) {
      video.srcObject = stream
      video.addEventListener('loadedmetadata', () => {
        video.play()
      })
      videoGrid.append(video)
    }

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
    this.setState({ input: e.target.value });
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
            <input type="text" onChange={ this.saveInput } />
            </div>
            <p>{this.state.roomId ? 'Room name: ' + this.state.roomId : ''}</p>
            <div id="video-grid"></div>
          </header>
        </div>
    );
  }
}

export default App;
