import { useState, useEffect } from 'react'

function App() {
  const [uid, setUid] = useState('');
  const [isAudio, setIsAudio] = useState(null);

  useEffect(() => {
    chrome.storage.local.get('uid').then(uidLocal => {
      setUid(uidLocal.uid);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get('isRecordAudio').then(({ isRecordAudio }) => {
      isRecordAudio ? setIsAudio(true) : setIsAudio(false);
    });
  }, []);

  const handleLoginClick = () => {
    chrome.tabs.create({ active: true, url: 'https://app.ssimple.co/login' });
  }

  const handleRecordAudioChange = () => {
    setIsAudio(!isAudio);
    chrome.storage.local.set({ isRecordAudio: isAudio });
  }

  const handleOpenRecorder = async () => {
    if (!uid) {
      alert('Please log in first');
      chrome.tabs.create({ active: true, url: 'https://app.ssimple.co/login' });
    } else {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.runtime.sendMessage({ name: 'open-recorder', tab });
      setTimeout(() => {
        window.close();
      }, 200);
    }
  }

  return (
    <>
      {!uid ?
        <div className="isLoggedOut">
          <button id="login" onClick={handleLoginClick}>Please log in</button>
        </div> :
        <div className="isLoggedIn">
          <div className="mb-5">
            <input type="checkbox" id="isRecordAudio" checked={isAudio} onChange={handleRecordAudioChange} />
            <label htmlFor="isRecordAudio">Record audio from your mic</label>
          </div>
          <div>
            <button className="py-4 px-2 bg-sky-500 text-white rounded" id="start" onClick={handleOpenRecorder}>Open Recorder</button>
          </div>
        </div>
      }
    </>
  )
}

export default App;
