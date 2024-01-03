import './style.css';
import calibrate_mp3 from './calibrate.mp3';
window.addEventListener('DOMContentLoaded', function () {
	fetch(calibrate_mp3)
		.then((response) =>response.arrayBuffer())
		.then((arrayBuffer) => {
			window.caliBrateAudioArrayBuffer = arrayBuffer;
		})
		.catch(() => {
			alert('错误：无法加载校准音频');
		});
});
document
	.querySelector('button#startBtn')
	.addEventListener('click', function () {
		if (window.caliBrateAudioArrayBuffer == undefined) {
			alert('抱歉，校准音频尚在加载中，请稍后');
			return;
		}
		window.calibrateActx = null;
		window.calibrateActx = new (window.AudioContext ||
			window.webkitAudioContext ||
			window.mozAudioContext ||
			window.msAudioContext)();
		window.calibrateActx.decodeAudioData(
			window.caliBrateAudioArrayBuffer,
			function (buffer) {
				window.calibraceACtxSource =
					window.calibrateActx.createBufferSource();
				window.calibraceACtxSource.buffer = buffer;
				window.calibraceACtxSource.connect(
					window.calibrateActx.destination
				);
				window.actxStartTime = window.calibrateActx.currentTime;
				window.calibraceACtxSource.start(0);
				window.calibraceACtxSource.addEventListener(
					'ended',
					function () {
						window.calibrateActx == undefined ? undefined : window.calibrateActx.close();
						window.calibrateActx = undefined;
						document
							.querySelector('button#startBtn')
							.removeAttribute('disabled');
						document
							.querySelector('button#clickBtn')
							.removeEventListener('click', calibrate);
						window.calibrateActx = null;
					}
				);
			}
		);
		document
			.querySelector('button#startBtn')
			.setAttribute('disabled', 'disabled');
		document
			.querySelector('button#clickBtn')
			.addEventListener('click', calibrate);
	});
document.body.addEventListener('keydown', () => {
	document.querySelector('button#clickBtn').click();
});
function calibrate(e) {
	const currentTime= window.calibrateActx.currentTime - window.actxStartTime;
	console.log(currentTime);
	var stage = 1;
	if (currentTime > 0 && currentTime <= 2) {
		console.log('Calibration stage 1',e);
		stage = 1;
	}
	if (currentTime > 2 && currentTime <= 4) {
		console.log('Calibration stage 2',e);
		stage = 2;
	}
	if (currentTime > 4 && currentTime <= 6) {
		console.log('Calibration stage 3',e);
		stage = 3;
	}
	if (currentTime > 6 && currentTime <= 8) {
		console.log('Calibration stage 4',e);
		stage = 4;
	}
	const result = document.querySelector('#result' + stage);
	result.innerText = Math.round((currentTime - (stage*2-0.5))*1000);
}
document
	.querySelector('button#cancelBtn')
	.addEventListener('click', function () {
		document.querySelector('button#startBtn').removeAttribute('disabled');
		document
			.querySelector('button#clickBtn')
			.removeEventListener('click', calibrate);
		try {
			window.calibraceACtxSource.stop();
		} catch (e) {
			undefined;
		}
		const result1 = parseFloat(
			document.querySelector('#result1').innerText.replace('-', '-0')
		);
		const result2 = parseFloat(
			document.querySelector('#result2').innerText.replace('-', '-0')
		);
		const result3 = parseFloat(
			document.querySelector('#result3').innerText.replace('-', '-0')
		);
		const result4 = parseFloat(
			document.querySelector('#result4').innerText.replace('-', '-0')
		);
		const finalResult = Math.round(
			(result1 + result2 + result3 + result4) / 4
		);
		const result = confirm(
			'谱面延时即将被设置为 ' +
				finalResult +
				' ，是否确认？\n单击“取消”为继续而不保存'
		);
		if (result) {
			localStorage.setItem('input-offset', finalResult);
			location.href = '../index.html';
		}
		if (!result) {
			location.href = '../index.html';
		}
	});
