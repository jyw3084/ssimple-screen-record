import { storage } from './firebase-config.js';
import { ref, uploadBytes } from "firebase/storage";

let stream;
let mediaRecorder;
let startTime;
let userActions = [];
let activeTab;
let heading;
let elapsedTime;
let screenshot;
let recorderTab;
let toolbarWindow;
let currentWindow;
let screenLeft = screen.availLeft;
let screenTop = screen.availTop;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.name) {
    case 'start':
      startRecord();
      return;

    case 'active-tab':
      activeTab = request.activeTab;
      recorderTab = request.recorderTab;
      return;

    case 'capture-click':
      heading = 'Click on';
      elapsedTime = performance.now() - startTime;
      screenshot = request.screenshot;
      userActions.push({ heading, elapsedTime, screenshot, desc: '' });
      return;

    case 'capture-screen':
      heading = '[Captured screenshot]';
      elapsedTime = performance.now() - startTime;
      screenshot = request.screenshot;
      userActions.push({ heading, elapsedTime, screenshot, desc: '' });
      return;

    case 'change-url':
      heading = 'Go to ' + request.url;
      elapsedTime = performance.now() - startTime;
      userActions.push({ heading, elapsedTime, screenshot: '', desc: '' });
      return;

    case 'stop':
      stopRecord();
      return;

    case 'discard':
      discardRecord();
      return;

    case 'close':
      closeRecorder();
      sendResponse('closed');
      return true;

    default:
      return;
  }
});

initialize();

async function initialize() {
  const { isRecordAudio } = await chrome.storage.local.get('isRecordAudio');

  chrome.desktopCapture.chooseDesktopMedia(['window'], recorderTab, async (streamId) => {
    if (streamId && streamId.length) {
      const isAudio = isRecordAudio ? true : false;
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: streamId
          },
        },
        audio: isAudio
      });
    }
    openToolbarResizeWindows();
    chrome.tabs.update(activeTab.id, { active: true });
  });

  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
      },
      surfaceSwitching: "exclude",
    });
  } catch (error) {
    chrome.runtime.sendMessage({ name: 'discard' });
  }

  function convertToWebp(captureImg) {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      ctx.drawImage(image, 0, 0);
      const dataUrl = canvas.toDataURL('image/webp');
      vidData.push(dataUrl);
    }
    image.src = captureImg;
  }

  intervalId = setInterval(() => captureAndSendTab(), 500);
  const stream = new MediaStream([...screenStream.getTracks(), ...audioStream ? audioStream.getTracks() : []]);
}

async function openToolbarResizeWindows() {
  currentWindow = await chrome.windows.getCurrent();
  await chrome.windows.update(currentWindow.id, { width: currentWindow.width - 300, left: 300 + screenLeft, top: screenTop });
  const toolbarUrl = chrome.runtime.getURL('toolbar/index.html');
  toolbarWindow = await chrome.windows.create({ url: toolbarUrl, type: 'popup', focused: true, width: 300, left: screenLeft, top: screenTop });
}

async function startRecord() {
  mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
  mediaRecorder.onstart = handleOnStart;
  mediaRecorder.ondataavailable = handleOnDataAvailable;
  mediaRecorder.onstop = handleOnStop;
  mediaRecorder.start();
}

async function stopRecord() {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  clearInterval(intervalId);
  chrome.runtime.sendMessage({ name: 'save-recording', userActions, vidData });
};

async function discardRecord() {
  await chrome.windows.remove(toolbarWindow.id);
  await chrome.windows.update(currentWindow.id, { width: currentWindow.width, left: screenLeft, top: screenTop });
  if (!mediaRecorder) return;
  mediaRecorder.ondataavailable = null;
  mediaRecorder.stop();
};

async function closeRecorder() {
  await chrome.windows.remove(toolbarWindow.id);
  await chrome.windows.update(currentWindow.id, { width: currentWindow.width, left: screenLeft, top: screenTop });
  if (!mediaRecorder) return;
  mediaRecorder.stop();
};

function handleOnStart() {
  startTime = performance.now();
}

async function handleOnDataAvailable(e) {
  if (e.data.size > 0) {
    console.log(e.data);
    uploadVideo(e.data, crypto.randomUUID());
  }
}

function handleOnStop() {
  stream.getTracks().forEach(track => track.stop());
  if (audioStream) audioStream.getTracks().forEach(track => track.stop());
  mediaRecorder.onstart = undefined;
  mediaRecorder.ondataavailable = undefined;
  mediaRecorder.onstop = undefined;
  mediaRecorder = undefined;
}

function uploadVideo(videoSrc, vidId) {
  const fileRef = ref(storage, 'screens/videos/' + vidId + '.webm');
  uploadBytes(fileRef, videoSrc)
    .then((snap) => {
      chrome.runtime.sendMessage({ name: 'save-clip', userActions, vidId });
    })
    .catch((err) => console.error('error uploading file', err));
}

async function serialize(src) {
  const wasBlob = src instanceof Blob;
  const blob = wasBlob ? src : await new Response(src).blob();
  const reader = new FileReader();
  return new Promise(resolve => {
    reader.onload = () => resolve([
      reader.result,
      blob.type,
      wasBlob,
    ]);
    reader.readAsDataURL(blob);
  });
}

function App() {

  return (
    <>
      <h1>Working... Do not close this page</h1>
    </>
  )
}

export default App;
