const DEV = true // TODO: What is a better way to do this?
export const socketServerHost = DEV ? 'http://localhost:8080': 'https://m8-walkie.ew.r.appspot.com';
export const webrtcApiHostOptions = DEV ? { host: "/", port: 2000} : { host: 'peerjs-dot-m8-walkie.ew.r.appspot.com', secure: true};
