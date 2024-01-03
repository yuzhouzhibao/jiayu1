import { settings } from './setting.js';
import { SliderItem, ToggleItem, ButtonItem } from './components/index.js';
import './style.css';

//	全局初始化鼠标滚轮/移动端滑动坐标
// var yCoord = 0,
// 	previousTouchYCoord = 0;
window.addEventListener('DOMContentLoaded', () => {
	if (window.localStorage.length == 0) {
		document.querySelector('#backBtn').addEventListener('click', () => {
			// location.href = '../chapterSelect/index.html';
			location.href = '../whilePlaying/index.html?play=tutorial&l=ez';
		});
	} else {
		document.querySelector('#backBtn').addEventListener('click', () => {
			location.href = '../chapterSelect/index.html';
		});
	}

	document.querySelector('#ver').innerText = $VERSION;

	try {
		document.querySelector('#device').innerText =
			'Platform: ' +
			navigator.userAgentData.platform +
			' ; isMobile:' +
			navigator.userAgentData.mobile;
	} catch (error) {
		document.querySelector('#device').innerText =
			'User-Agent : ' +
			navigator.userAgent.slice(navigator.userAgent.lastIndexOf(' '));
	}
	document.querySelector('#device').title = navigator.userAgent;
	// loadSettings();
	//创建设置条目
	settings.forEach((setting) => {
		let item;
		switch (setting.type) {
			case 'slide':
				setting.defaultValue =
					Number(window.localStorage.getItem(setting.codename)) ||
					setting.defaultValue;
				item = SliderItem(setting);
				break;
			case 'toggle':
				if (window.localStorage.getItem(setting.codename) !== null) {
					setting.defaultValue =
						window.localStorage.getItem(setting.codename) == 'true'
							? true
							: false;
				}
				item = ToggleItem(setting);
				break;
			case 'button':
				item = ButtonItem(setting);
				break;
			default:
				throw new Error('Unknown setting: ' + setting);
		}
		document.getElementById('settingItems').appendChild(item.element);
	});
});
