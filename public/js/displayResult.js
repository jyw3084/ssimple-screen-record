let type;

chrome.runtime.sendMessage({ name: 'display-result' }, ({ userActions, vidId }) => {
	setTimeout(() => {
		window.postMessage({ actions: userActions, vidId });
	}, 500);
	type = undefined;
});

function deserialize([base64, type, wasBlob]) {
	const str = atob(base64.slice(base64.indexOf(',') + 1));
	const len = str.length;
	const arr = new Uint8Array(len);
	for (let i = 0; i < len; i += 1) arr[i] = str.charCodeAt(i);
	if (!wasBlob) {
		type = base64.match(/^data:(.+?);base64/)[1].replace(/(boundary=)[^;]+/,
			(_, p1) => p1 + String.fromCharCode(...arr.slice(2, arr.indexOf(13))));
	}
	return { arr, type };
}

function concat(arrays) {
	// sum of individual array lengths
	let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);

	if (!arrays.length) return null;

	let result = new Uint8Array(totalLength);
	let length = 0;
	for (let array of arrays) {
		result.set(array, length);
		length += array.length;
	}

	return result;
}