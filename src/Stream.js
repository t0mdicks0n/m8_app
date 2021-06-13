import React, {useEffect, useRef, useState} from "react";
import Video from "./Video";

function getStream() {
   return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
     })
}

export default getStream;
