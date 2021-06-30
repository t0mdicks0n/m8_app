import React, {useEffect, useState} from 'react';
import './App.css';
import {Button} from '@material-ui/core';
import {connectToWebRTCApi, connectToSocketServer} from './Connections.js';
import {socketServerHost} from "./Config";
import Video from "./Video.js";

const socketServer = connectToSocketServer()
const webRTCApi = connectToWebRTCApi()

function App() {

  const [myStream, setMyStream] = useState(null);
  const [webRTCId, setwebRTCId] = useState(null);
  const [calls, setCalls] = useState({});
  const [mediaStreams, setMediaStreams] = useState({});
  const [roomInputFieldText, setRoomInputFieldText] = useState(null)
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    saveMyWebRTCId()
    startMyStream()
    registerFunctionToHandleIncomingWebRTCCall()
    registerFunctionToHandleIncomingWebRTCCall()
    registerFunctionToHandleNewUserConnectingFromServer()
    registerFunctionToHandleUserDisconnectingFromServer()
  }, []);

  useEffect(() => {
    joinRoom(roomId)
  }, [roomId])

  useEffect(() => {
    console.log("my steam changed")
  }, [myStream])

  function saveMyWebRTCId() {
    webRTCApi.on('open', id => {
      console.log("Peerjs id ", id)
      setwebRTCId(id)
    })
  }

  function startMyStream() {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
     }).then(stream => {
      console.log("Set my stream", stream)
      setMyStream(stream)
    })
  }

  function registerFunctionToHandleIncomingWebRTCCall() {
    webRTCApi.on('call', call => {
        call.answer(myStream)
        call.on('stream', userVideoStream => {
          mediaStreams[call.peer] = userVideoStream
          setMediaStreams(mediaStreams)
        })
    })
  }

  function registerFunctionToHandleNewUserConnectingFromServer() {
    socketServer.on('user-connected', userId => {
        console.log("New user connected", userId)
        console.log("stram,", myStream)
        const call = webRTCApi.call(userId, myStream)
        call.on('stream', userVideoStream => {
          mediaStreams[call.peer] = userVideoStream
          setMediaStreams(mediaStreams)
        })
        call.on('close', () => {
          delete mediaStreams[call.peer]
          setMediaStreams(mediaStreams)
        })
        calls[userId] = call
        setCalls(calls)
    })
  }

  function registerFunctionToHandleUserDisconnectingFromServer() {
    socketServer.on('user-disconnected', userId => {
      console.log(calls, userId)
      if (calls[userId])  {
        calls[userId].close()
        delete calls[userId]
        setCalls(calls)
      }
    })
  }


  function createAndSetRoom() {
    fetch(socketServerHost + "/create-new-room")
        .then(res => res.json())
        .then((data) => {
          setRoomId(data["roomId"])
        })
        .catch(console.log)
  }

  function saveInput(e) {
    setRoomInputFieldText(e.target.value)
  }

  function submitJoinRoom() {
    joinRoom(roomInputFieldText)
  }

  function joinRoom(roomId) {
    console.log("Joining room room:", roomId, ", myid:", webRTCId);
    socketServer.emit('join-room', roomId, webRTCId)
  }

  return (
        <div className="App">
          <header className="App-header">
            <p>
              Chat with your m8's!
            </p>
            <Button variant="contained" color="primary" onClick={createAndSetRoom}>
              Create room
            </Button>
            <div><input
                type="button"
                value="Join room"
                onClick={submitJoinRoom}
            />
              <input type="text" onChange={saveInput}/>
            </div>
            <p>{roomId ? 'Room name: ' + roomId : ''}</p>
            <div id="video-grid">
              <Video stream={myStream} name={"Sonja"} autoPlay muted/>
              {
                Object.keys(mediaStreams).map((key, index) => (
                    <Video key={index} stream={mediaStreams[key]} name={"any"} autoPlay muted/>
                ))
              }
            </div>
          </header>
        </div>
    );
}

export default App;
