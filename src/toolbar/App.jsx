import { useState, useEffect } from 'react'

import "@fortawesome/fontawesome-free/css/all.min.css";

const captureText = 'Capture screenshot';

function App() {
  const [text, setText] = useState(captureText);
  const [items, setItems] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecordClick = () => {
    chrome.runtime.sendMessage({ name: 'start-record' });
    setItems([...items, { index: items.length + 1, type: 'video', data: '' }]);
    setIsRecording(true);
  }

  const handleStopRecordClick = () => {
    chrome.runtime.sendMessage({ name: 'stop-record' });
    setIsRecording(false);
  }

  const handleDiscardRecordClick = () => {
    chrome.runtime.sendMessage({ name: 'discard-record' });
    setIsRecording(false);
  }

  const handleCloseRecorderClick = () => {
    chrome.runtime.sendMessage({ name: 'close-recorder' });
    if (isRecording) setIsRecording(false);
  }

  const handleCaptureScreenClick = async () => {
    const response = await chrome.runtime.sendMessage({ name: 'capture-screen-bg' });
    setItems([...items, { index: items.length + 1, type: 'img', data: response }]);
    setText('Captured!');
    setTimeout(() => {
      setText(captureText);
    }, 1000);
  }

  return (
    <div className="h-screen flex-col">
      <div className="p-4 text-center" id="toolbar">
        <div className="py-4" id="settings">
          {isRecording ?
            <div className="tooltip">
              <button type="button" className="bg-slate-700" onClick={handleStopRecordClick}>
                <i className="fas fa-stop text-slate-100"></i>
              </button>
              <span className="tooltiptext">Stop Record</span>
            </div>
            :
            <div className="tooltip">
              <button type="button" className="bg-slate-700" onClick={handleStartRecordClick}>
                <i className="fas fa-circle text-slate-100"></i>
              </button>
              <span className="tooltiptext">Start Record</span>
            </div>
          }
          <div className="tooltip">
            <button type="button" className="bg-slate-700" onClick={handleCloseRecorderClick}>
              <i className="fas fa-times text-slate-100"></i>
            </button>
            <span className="tooltiptext">Close Recorder</span>
          </div>
        </div>
        <div className="" id="tools">
          <div className="tooltip">
            <button type="button" className="bg-slate-700" onClick={handleCaptureScreenClick}>
              <i className="fas fa-camera text-slate-100"></i>
            </button>
            <span className="tooltiptext">{text}</span>
          </div>
        </div>
      </div>
      <div className="p-3" id="items">
        {items &&
          <ul>
            {items.map(item => {
              switch (item.type) {
                case 'img':
                  return (
                    <li className="p-4 my-2 bg-slate-500 rounded">
                      <img className="w-full" src={item.data} />
                    </li>
                  )

                case 'video':
                  return (
                    <li className="p-4 my-2 bg-slate-500 rounded">
                      <video className="w-full" src={item.data} />
                    </li>
                  )

                default:
                  break;
              }
            })}
          </ul>
        }
      </div>
    </div>
  )
}

export default App;
