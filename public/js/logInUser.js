window.addEventListener('message', e => {
	const uid = e.data.uid;
	chrome.storage.local.set({ uid });
});