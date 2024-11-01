let isRecording = false;
let iframe = null;
const cursorVisitedClassname = 'cursor-visited';
let prevDOM = null;
let numOfSteps = 2;
let brandColor = '#ff0000';
let recorder;
let dataUrl;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	isRecording = request.isRecording;
	iframe = document.getElementById('ssimple-extension');

	if (isRecording) {
		if (!iframe) createIframe();

		// capture screenshots
		document.addEventListener('click', captureUserActions);
	} else if (!isRecording && iframe) {
		removeIframe();
		document.removeEventListener('click', captureUserActions);
	} else {
		document.removeEventListener('click', captureUserActions);
	}
});

window.addEventListener('message', (e) => {
	if (e.data.name === 'discard-record' || e.data.name === 'stop-record') {
		removeIframe();
		document.removeEventListener('click', captureUserActions);
	}
});

function createIframe() {
	const root = document.createElement('ssimple-extension');
	root.id = 'ssimple-extension';
	document.body.appendChild(root);

	const iframe = document.createElement('iframe');
	iframe.id = 'ssimple-iframe';
	iframe.style.cssText = `
		position: fixed;
    height: 100%;
		width: 100%;
    margin: 0;
    z-index: 2147483647;
    display: block;
		bottom: 0;
		left: 0;
		top: unset;
		color-scheme: normal;
		background-color: rgba(0,0,0,0.5);
  `;
	// set src to toolbar.html located within extension folder
	iframe.src = chrome.runtime.getURL('iframe.html');

	root.style.cssText = `
    display: block;
  `;

	root.prepend(iframe);
}

function removeIframe() {
	document.getElementById('ssimple-extension').remove();
}

function highlightElements(e) {
	if (isRecording) {
		let srcElement = e.target;
		if (srcElement.nodeName != 'SPAN' && srcElement.nodeName != 'IFRAME') {
			if (prevDOM != null) {
				prevDOM.classList.remove(cursorVisitedClassname);
				prevDOM.style.cssText = '';
			}
			srcElement.classList.add(cursorVisitedClassname);
			srcElement.style.cssText = 'outline: 2px solid' + brandColor + '!important;';
			prevDOM = srcElement;
		}
	} else {
		if (prevDOM != null) {
			prevDOM.classList.remove(cursorVisitedClassname);
			prevDOM.style.cssText = '';
		}
	}
}

function captureUserActions(e) {
	let srcElement = e.target;
	srcElement.classList.add(cursorVisitedClassname);
	srcElement.style.cssText = 'outline: 2px solid' + brandColor + '!important;';
	clickEffect(e);
	if (e.target.closest('a')) {
		e.preventDefault();
		setTimeout(() => {
			chrome.runtime.sendMessage({ name: 'capture-click-bg' });
		}, 100);
		setTimeout(() => {
			chrome.runtime.sendMessage({ name: 'change-url', url: e.target.href });
			window.location = e.target.href;
		}, 1000);
	} else {
		setTimeout(() => {
			chrome.runtime.sendMessage({ name: 'capture-click-bg' }, (response) => {
				if (response && response === 'success') {
					srcElement.classList.remove(cursorVisitedClassname);
					srcElement.style.cssText = '';
				}
			});
		}, 100);
	}
}

function clickEffect(e) {
	const d = document.createElement("div");
	d.className = "clickEffect";
	d.style.top = e.clientY + "px"; d.style.left = e.clientX + "px";
	document.body.appendChild(d);
	d.addEventListener('animationend', function () { d.parentElement.removeChild(d); }.bind(this));
}

function setNumOfSteps() {
	chrome.runtime.sendMessage({ numOfSteps });
}
