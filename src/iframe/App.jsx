import { useState, useEffect } from 'react'

import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [text, setText] = useState('Capture screenshot');

  const handleStopClick = () => {
    window.parent.postMessage({ name: 'stop' }, '*');
    chrome.runtime.sendMessage({ name: 'stop' });
  }

  const handleDiscardClick = () => {
    window.parent.postMessage({ name: 'discard' }, '*');
    chrome.runtime.sendMessage({ name: 'discard' });
  }

  const handleCaptureScreenClick = () => {
    chrome.runtime.sendMessage({ name: 'capture-screen-bg' });
    setText('Captured!');
    setTimeout(() => {
      setText('Capture screenshot');
    }, 1000);
  }

  return (
    <>
      <div id="iframe">
        <div className="" id="settings">
          <div className="tooltip">
            <button type="button" id="record">
              <i className="fas fa-circle"></i>
            </button>
            <span className="tooltiptext">Record</span>
          </div>
          <div className="tooltip">
            <button type="button" id="stop" onClick={handleStopClick}>
              <i className="fas fa-stop"></i>
            </button>
            <span className="tooltiptext">Save</span>
          </div>
          <div className="tooltip">
            <button type="button" className="" onClick={handleCaptureScreenClick}>
              <i className="fas fa-camera"></i>
            </button>
            <span className="tooltiptext">{text}</span>
          </div>
          <div className="tooltip">
            <button type="button" id="discard" onClick={handleDiscardClick}>
              <i className="fas fa-times"></i>
            </button>
            <span className="tooltiptext">Close Recorder</span>
          </div>
        </div>
        <div className="" id="tools">
          <div>
            <button type="button">
              Highlight
            </button>
          </div>
          <div>
            <button type="button">
              Blur
            </button>
          </div>
        </div>
      </div>
      <div id="clips">

      </div>
    </>
  )
}

export default App;
