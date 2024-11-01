let id = 1;
let imgArr = [];
let isRecording = false;
let isTurnOn = false;
let brandId;
let chunks = [];
let startTime;
let userActions;
let userActionTime = [];
let endTime;
let recorderTab;
let activeTab;
let vidId;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
	chrome.tabs.sendMessage(activeInfo.tabId, { isRecording });
	if (isRecording) {
		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const url = activeTab.url;
		chrome.tabs.sendMessage(recorderTab.id, { name: 'change-url', url });
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		chrome.tabs.sendMessage(tabId, { isRecording });
	}
});

chrome.action.onClicked.addListener(tab => {
	activeTab = tab;
	openRecorder();
	setTimeout(() => {
		chrome.tabs.sendMessage(recorderTab.id, { name: 'active-tab', activeTab, recorderTab });
	}, 500);
	return;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.name) {
		case 'open-recorder':
			isTurnOn = true;
			activeTab = request.tab;
			openRecorder();
			setTimeout(() => {
				chrome.tabs.sendMessage(recorderTab.id, { name: 'active-tab', activeTab, recorderTab });
			}, 500);
			return;

		case 'start-record':
			isRecording = true;
			chrome.tabs.sendMessage(recorderTab.id, { name: 'start' });
			return;

		case 'save-clip':
			chunks.push(request.data);
			vidId = request.vidId;
			return;

		case 'save-recording':
			isRecording = false;
			userActions = request.userActions;
			vidId = request.vidId;
			openNewTab();
			return;

		case 'display-result':
			sendResponse({ userActions, vidId });
			return true;

		case 'stop-record':
			isRecording = false;
			chrome.tabs.update(recorderTab.id, { active: true });
			chrome.tabs.sendMessage(recorderTab.id, { name: 'stop' });
			return;

		case 'discard-record':
			isRecording = false;
			chrome.tabs.sendMessage(recorderTab.id, { name: 'discard' });
			setTimeout(() => {
				chrome.tabs.remove(recorderTab.id);
			}, 500);
			return;

		case 'capture-click-bg':
			chrome.tabs.captureVisibleTab(null, { format: 'png' }, (captureImg) => {
				chrome.tabs.sendMessage(recorderTab.id, { name: 'capture-click', screenshot: captureImg });
			});
			return;

		case 'capture-screen-bg':
			chrome.tabs.captureVisibleTab(recorderTab.windowId, { format: 'png' }, (captureImg) => {
				sendResponse(captureImg);
				chrome.tabs.sendMessage(recorderTab.id, { name: 'capture-screen', screenshot: captureImg });
			});
			return true;

		case 'close-recorder':
			isRecording = false;
			(async function () {
				const response = await chrome.tabs.sendMessage(recorderTab.id, { name: 'close' });
				if (response === 'closed') chrome.tabs.remove(recorderTab.id);
			})();
			return;

		default:
			return;
	}
});

async function openRecorder() {
	const recorderUrl = chrome.runtime.getURL('recorder/index.html');
	recorderTab = await chrome.tabs.create({ url: recorderUrl, pinned: true });
}

async function openNewTab() {
	const viewTabUrl = 'https://app.ssimple.co/new-doc';
	await chrome.tabs.create({ url: viewTabUrl });
}

async function capture() {
	return await chrome.tabs.captureVisibleTab(null, { format: 'png' });
}