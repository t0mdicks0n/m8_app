import React from 'react';
import './App.css';
import Peer from "peerjs";
import { io } from "socket.io-client";
import { Button } from '@material-ui/core';
import PinnedSubheaderList from "./List";
import LongMenu from "./Menu";
import ButtonAppBar from "./AppBar";
import {ThemeProvider} from "@material-ui/styles";
import { createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';

const DEV = false

let server = DEV ? 'http://localhost:3002': 'https://m8-walkie.ew.r.appspot.com'
let peerjsServerOptions = DEV ? { host: "/", port: 2000} : { host: 'peerjs-dot-m8-walkie.ew.r.appspot.com', secure: true}

console.log("Connect to server", server)
const socket = io(server)
console.log("Connect to peerjs server", peerjsServerOptions.host)
const myPeer = new Peer(undefined, peerjsServerOptions)

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#282C34",
    },
    secondary: {
      main: '#282C34',
    },
  },
});

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
        console.log("New user connected", userId)
        connectToNewUser(userId, stream)
      })
    })

    const peers = {}

    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })

    myPeer.on('open', id => {
      console.log("Peerjs id ", id)
      this.setState({'id': id})
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
      //videoGrid.append(video)
    }

  }

  createAndJoinRoom() {
    fetch(server + "/create-new-room")
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
    socket.emit('join-room', roomId, this.state.id)
  }

  render() {
    return (
        <ThemeProvider theme={theme}>
          <div className="App">
            <ButtonAppBar/>
            <PinnedSubheaderList/>

          </div>
        </ThemeProvider>
    );
  }
}

export default App;
