import React from 'react';
import './App.css';
import Peer from "peerjs";

import { io } from "socket.io-client";
import { Button } from '@material-ui/core';

const DEV = false

let server = DEV ? 'http://localhost:3002': 'https://m8-walkie.ew.r.appspot.com'
let peerjsServerOptions = DEV ? { host: "/", port: 2000} : { host: 'peerjs-dot-m8-walkie.ew.r.appspot.com', secure: true}

console.log("Connect to server", server)
const socket = io(server)
console.log("Connect to peerjs server", peerjsServerOptions.host)
const myPeer = new Peer(undefined, peerjsServerOptions)

class App extends React.Component {

   constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount() {

    const videoGrid = document.getElementById('video-grid')
    const myVideo = document.createElement('video')
    myVideo.muted = true
    navigator.mediaDevices.getUserMedia({
      //video: true,
      audio: true
    }).then(stream => {
      addVideoStream(myVideo, stream)
      myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

      socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
      })
    })

    const peers = {}

    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })


    myPeer.on('open', id => {
      console.log("Joining room")
      socket.emit('join-room', 'dev', id)
    })

    function connectToNewUser(userId, stream) {
      const call = myPeer.call(userId, stream)
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
