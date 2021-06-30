import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

// Inspired from https://github.com/vardius/react-user-media
function Video({ stream, name, muted = false, autoPlay = false,  ...props }) {
  const element = useRef(null);

  useEffect(() => {
    if (element.current && stream) {
      element.current.srcObject = stream;
    }
  }, [stream, element]);

  return (
      <div>
        {/*How do I get some text in the right corner of the video?*/}
        <video width={"200px"} {...props} autoPlay={autoPlay} muted={muted} ref={element} />
        <h4>{name}</h4>
      </div>
  );
}

Video.propTypes = {
  stream: PropTypes.object,
  muted: PropTypes.bool,
  autoPlay: PropTypes.bool
};

export default Video;
