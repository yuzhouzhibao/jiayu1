'use strict';
import resource from './resource.js';
import { pec2json } from './pec2json.js';
import './style.css';
import OggmentedAudioContext from 'oggmented';
import * as StackBlur from 'stackblur-canvas';
import Pause_mp3 from 'assets/audio/Pause.mp3';
import Exit_mp3 from 'assets/audio/Exit.mp3';
import { renderTutorialSPByTime,renderTutorialByTime } from './tutorial.js';
import { DB } from '../utils/DB.js';

document.oncontextmenu = (e) => e.preventDefault(); //qwq
//	切换提示框选项卡
// for (const i of document.getElementById("view-nav").children) {
// 	i.addEventListener("click", function () {
// 		for (const j of this.parentElement.children) j.classList.remove("active");
// 		const doc = document.getElementById("view-doc");
// 		const msg = document.getElementById("view-msg");
// 		this.classList.add("active");
// 		if (i.id == "msg") {
// 			doc.src = "";
// 			doc.classList.add("hide");
// 			msg.classList.remove("hide");
// 		} else {
// 			if (doc.getAttribute("src") != `docs/${i.id}.html`) doc.src = `docs/${i.id}.html`;
// 			msg.classList.add("hide");
// 			doc.classList.remove("hide");
// 		}
// 	});
// }
//	点击空白处关闭提示框
// document.getElementById("cover-dark").addEventListener("click", () => {
// 	document.getElementById("cover-dark").classList.add("fade");
// 	document.getElementById("cover-view").classList.add("fade");
// });
// document.getElementById("qwq").addEventListener("click", () => {
// 	document.getElementById("cover-dark").classList.remove("fade");
// 	document.getElementById("cover-view").classList.remove("fade");
// 	document.getElementById("res").click();
// });
// document.getElementById("msg-out").addEventListener("click", () => {
// 	document.getElementById("cover-dark").classList.remove("fade");
// 	document.getElementById("cover-view").classList.remove("fade");
// 	document.getElementById("msg").click();
// });
const message = {
	out: document.getElementById('msg-out'),
	view: document.getElementById('view-msg'),
	lastMessage: '',
	isError: false,
	get num() {
		return this.view.querySelectorAll('.msgbox').length;
	},
	sendMessage(msg) {
		console.log('PhiCommunity Core: ' + msg);
		return;
		// const num = this.num;
		// this.out.className = num ? "warning" : "accept";
		// this.out.innerText = msg + (num ? `（发现${num}个问题，点击查看）` : "");
		// this.lastMessage = msg;
		// this.isError = false;
	},
	sendWarning(msg) {
		console.warn('PhiCommunity Core: ' + msg);
		return;
		// const msgbox = document.createElement("div");
		// msgbox.innerText = msg;
		// msgbox.classList.add("msgbox");
		// const btn = document.createElement("a");
		// btn.innerText = "忽略";
		// btn.style.float = "right";
		// btn.onclick = () => {
		// 	msgbox.remove();
		// 	if (this.isError) this.sendError(this.lastMessage);
		// 	else this.sendMessage(this.lastMessage);
		// }
		// msgbox.appendChild(btn);
		// this.view.appendChild(msgbox);
		// if (this.isError) this.sendError(this.lastMessage);
		// else this.sendMessage(this.lastMessage);
	},
	sendError(msg) {
		console.error('PhiCommunity Core: ' + msg);
		return;
		// const num = this.num;
		// this.out.className = "error";
		// this.out.innerText = msg + (num ? `（发现${num}个问题，点击查看）` : "");
		// this.lastMessage = msg;
		// this.isError = true;
	},
};
const tween = {
	easeInSine: (pos) => 1 - Math.cos((pos * Math.PI) / 2),
	easeOutSine: (pos) => Math.sin((pos * Math.PI) / 2),
	easeOutCubic: (pos) => 1 + (pos - 1) ** 3,
};
var Renderer = {
	//存放谱面
	chart: null,
	bgImage: null,
	bgImageBlur: null,
	bgMusic: null,
	lines: [],
	notes: [],
	taps: [],
	drags: [],
	flicks: [],
	holds: [],
	reverseholds: [],
	tapholds: [],
};
var qwq = [];
var chartLine;
window.chartLineData = [];

// const select = document.getElementById('select'); //整个各种选择的框架
// const selectbg = document.getElementById('select-bg'); //背景选择
const btnPlay = document.getElementById('btn-play'); //开始按钮
const btnPause = document.getElementById('btn-pause'); //暂停按钮
// const selectbgm = document.getElementById('select-bgm'); //BGM选择
// const selectchart = document.getElementById('select-chart'); //谱面选择
const selectscaleratio = document.getElementById('select-scale-ratio'); //数值越大note越小
const selectaspectratio = document.getElementById('select-aspect-ratio'); //选择宽高比
const selectglobalalpha = document.getElementById('select-global-alpha'); //背景变暗
const inputName = document.getElementById('input-name'); //歌名
const inputLevel = document.getElementById('input-level'); //难度
const inputDesigner = document.getElementById('input-designer'); //普师
const inputIllustrator = document.getElementById('input-illustrator'); //曲绘
const inputOffset = document.getElementById('input-offset'); //偏移率
const showPoint = document.getElementById('showPoint'); //	显示定位点
const lineColor = document.getElementById('lineColor'); //FC/AP指示器
const autoplay = document.getElementById('autoplay'); //奥托先生
const hyperMode = document.getElementById('hyperMode'); //研判
const showTransition = document.getElementById('showTransition'); //是否开启过度动画
// const bgs = {};
// const bgsBlur = {};
// const bgms = {};
// const charts = {};
// const chartLineData = []; //line.csv
// const chartInfoData = []; //info.csv
const AspectRatio = 16 / 9; //宽高比上限
const Deg = Math.PI / 180; //角度转弧度
let wlen, hlen, wlen2, hlen2, noteScale, lineScale; //背景图相关
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); //游戏界面(alpha:false会出现兼容问题)
const canvasos = document.createElement('canvas'); //用于绘制游戏主界面
const ctxos = canvasos.getContext('2d');
// var Renderer = { //存放谱面
// 	chart: null,
// 	bgImage: null,
// 	bgImageBlur: null,
// 	bgMusic: null,
// 	lines: [],
// 	notes: [],
// 	taps: [],
// 	drags: [],
// 	flicks: [],
// 	holds: [],
// 	reverseholds: [],
// 	tapholds: []
// };
//全屏相关
const full = {
	toggle(elem) {
		if (!this.enabled) return false;
		if (this.element) {
			if (document.exitFullscreen) return document.exitFullscreen();
			if (document.cancelFullScreen) return document.cancelFullScreen();
			if (document.webkitCancelFullScreen)
				return document.webkitCancelFullScreen();
			if (document.mozCancelFullScreen)
				return document.mozCancelFullScreen();
			if (document.msExitFullscreen) return document.msExitFullscreen();
		} else {
			if (!(elem instanceof HTMLElement)) elem = document.body;
			if (elem.requestFullscreen) return elem.requestFullscreen();
			if (elem.webkitRequestFullscreen)
				return elem.webkitRequestFullscreen();
			if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen();
			if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
		}
	},
	check(elem) {
		if (!(elem instanceof HTMLElement)) elem = document.body;
		return this.element == elem;
	},
	get element() {
		return (
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement
		);
	},
	get enabled() {
		return !!(
			document.fullscreenEnabled ||
			document.webkitFullscreenEnabled ||
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
		);
	},
};
//兼容性检测
// if (typeof zip != 'object') message.sendWarning('检测到zip组件未正常加载，将无法使用模拟器');
if (typeof createImageBitmap != 'function')
	message.sendWarning('检测到当前浏览器不支持ImageBitmap，将无法使用模拟器');
if (
	!(
		window.AudioContext ||
		window.webkitAudioContext ||
		window.mozAudioContext ||
		window.msAudioContext
	)
)
	message.sendWarning('检测到当前浏览器不支持AudioContext，将无法使用模拟器');
if (!full.enabled)
	message.sendWarning('检测到当前浏览器不支持全屏，播放时双击右下角将无反应');
//qwq
// selectbg.onchange = () => {
// 	Renderer.bgImage = bgs[selectbg.value];
// 	Renderer.bgImageBlur = bgsBlur[selectbg.value];
// 	resizeCanvas();
// }
//自动填写歌曲信息
// selectchart.addEventListener("change", adjustInfo);

// function adjustInfo() {
// 	for (const i of chartInfoData) {
// 		if (selectchart.value == i.Chart) {
// 			if (bgms[i.Music]) selectbgm.value = i.Music;
// 			if (bgs[i.Image]) selectbg.value = i.Image;
// 			if (Number(i.AspectRatio)) selectaspectratio.value = i.AspectRatio;
// 			if (Number(i.ScaleRatio)) selectscaleratio.value = i.ScaleRatio;
// 			if (Number(i.GlobalAlpha)) selectglobalalpha.value = i.GlobalAlpha;
// 			inputName.value = i.Name;
// 			inputLevel.value = i.Level;
// 			inputIllustrator.value = i.Illustrator;
// 			inputDesigner.value = i.Designer;
// 		}
// 	}
// }
window.addEventListener('resize', resizeCanvas);
document.addEventListener('fullscreenchange', resizeCanvas);
// selectscaleratio.addEventListener("change", resizeCanvas);
// selectaspectratio.addEventListener("change", resizeCanvas);
//适应画面尺寸
function resizeCanvas() {
	const width = document.documentElement.clientWidth;
	const height = document.documentElement.clientHeight;
	const defaultWidth = height * (selectaspectratio.value || 16 / 9);
	const defaultHeight = height;
	var realHeight = height,
		realWidth = width;
	if (width > defaultWidth) {
		realWidth = defaultWidth;
	}
	if (height > defaultHeight) {
		realHeight = defaultHeight;
	}
	//var realWidth = Math.floor((width > defaultWidth) ? defalutWidth : width);
	//var realHeight = Math.floor((height > defaultHeight) ? defaultHeight : height);
	if (localStorage.getItem('enableLowRes') == 'true') {
		realHeight = realHeight / 4;
		realWidth = realWidth / 4;
	}
	console.log('Resize canvas:', realHeight, realWidth);
	canvas.width = realWidth * devicePixelRatio;
	canvas.height = realHeight * devicePixelRatio;
	canvasos.width =
		Math.min(realWidth, realHeight * AspectRatio) * devicePixelRatio;
	canvasos.height = realHeight * devicePixelRatio;
	wlen = canvasos.width / 2;
	hlen = canvasos.height / 2;
	wlen2 = canvasos.width / 18;
	hlen2 = canvasos.height * 0.6; //控制note流速
	noteScale = canvasos.width / (selectscaleratio.value || 8e3); //note、特效缩放
	lineScale =
		canvasos.width > canvasos.height * 0.75
			? canvasos.height / 18.75
			: canvasos.width / 14.0625; //判定线、文字缩放
}
const mouse = {}; //存放鼠标事件(用于检测，下同)
const touch = {}; //存放触摸事件
const keyboard = {}; //存放键盘事件
const taps = []; //额外处理tap(试图修复吃音bug)
const specialClick = {
	time: [0, 0, 0, 0],
	func: [
		() => {
			btnPause.click();
		},
		() => {
			replay();
		},
		() => void 0,
		() => {
			full.toggle(document.body);
		},
	],
	click(id) {
		const now = Date.now();
		if (now - this.time[id] < 300) this.func[id]();
		this.time[id] = now;
	},
};
class Click {
	constructor(offsetX, offsetY) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.isMoving = false;
		this.time = 0;
	}
	static activate(offsetX, offsetY) {
		taps.push(new Click(offsetX, offsetY));
		if (offsetX < lineScale * 1.5 && offsetY < lineScale * 1.5)
			specialClick.click(0);
		if (
			offsetX > canvasos.width - lineScale * 1.5 &&
			offsetY < lineScale * 1.5
		)
			specialClick.click(1);
		if (
			offsetX < lineScale * 1.5 &&
			offsetY > canvasos.height - lineScale * 1.5
		)
			specialClick.click(2);
		if (
			offsetX > canvasos.width - lineScale * 1.5 &&
			offsetY > canvasos.height - lineScale * 1.5
		)
			specialClick.click(3);
		if (qwqEnd.second > 0)
			qwq[3] = qwq[3] > 0 ? -qwqEnd.second : qwqEnd.second;
		return new Click(offsetX, offsetY);
	}
	move(offsetX, offsetY) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.isMoving = true;
		this.time = 0;
	}
	animate() {
		if (!this.time++) {
			if (this.isMoving)
				clickEvents0.push(
					ClickEvent0.getClickMove(this.offsetX, this.offsetY)
				);
			else
				clickEvents0.push(
					ClickEvent0.getClickTap(this.offsetX, this.offsetY)
				);
		} else
			clickEvents0.push(
				ClickEvent0.getClickHold(this.offsetX, this.offsetY)
			);
	}
}
class Judgement {
	constructor(offsetX, offsetY, type) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.type = Number(type) || 0; //1-Tap,2-Hold,3-Move
		this.catched = false;
	}
	isInArea(x, y, cosr, sinr, hw) {
		return isNaN(this.offsetX + this.offsetY)
			? true
			: Math.abs((this.offsetX - x) * cosr + (this.offsetY - y) * sinr) <=
					hw;
	}
}
class Judgements extends Array {
	addJudgement(notes, realTime) {
		this.length = 0;
		if (autoplay.checked) {
			for (const i of notes) {
				if (i.scored) continue;
				if (i.type == 1) {
					if (i.realTime - realTime < 0.0)
						this.push(new Judgement(i.offsetX, i.offsetY, 1));
				} else if (i.type == 2) {
					if (i.realTime - realTime < 0.2)
						this.push(new Judgement(i.offsetX, i.offsetY, 2));
				} else if (i.type == 3) {
					if (i.status3)
						this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (i.realTime - realTime < 0.0)
						this.push(new Judgement(i.offsetX, i.offsetY, 1));
				} else if (i.type == 4) {
					if (i.realTime - realTime < 0.2)
						this.push(new Judgement(i.offsetX, i.offsetY, 3));
				}
			}
		} else if (!isPaused) {
			for (const j in mouse) {
				const i = mouse[j];
				if (i instanceof Click) {
					if (i.time)
						this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (i.isMoving)
						this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const j in touch) {
				const i = touch[j];
				if (i instanceof Click) {
					if (i.time)
						this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (i.isMoving)
						this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const j in keyboard) {
				const i = keyboard[j];
				if (i instanceof Click) {
					if (i.time)
						this.push(new Judgement(i.offsetX, i.offsetY, 2));
					/*if (i.isMoving)*/ else
						this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const i of taps) {
				if (i instanceof Click)
					this.push(new Judgement(i.offsetX, i.offsetY, 1));
			}
		}
	}
	judgeNote(notes, realTime, width) {
		for (const i of notes) {
			if (i.scored) continue;
			if (
				i.realTime - realTime < -(hyperMode.checked ? 0.12 : 0.16) &&
				i.frameCount > (hyperMode.checked ? 3 : 4) &&
				!i.status2
			) {
				//console.log("Miss", i.name);
				i.status = 2;
				stat.addCombo(2, i.type);
				i.scored = true;
			} else if (i.type == 1) {
				for (let j = 0; j < this.length; j++) {
					if (
						this[j].type == 1 &&
						this[j].isInArea(
							i.offsetX,
							i.offsetY,
							i.cosr,
							i.sinr,
							width
						) &&
						i.realTime - realTime < 0.2 &&
						(i.realTime - realTime >
							-(hyperMode.checked ? 0.12 : 0.16) ||
							i.frameCount < (hyperMode.checked ? 3 : 4))
					) {
						if (
							i.realTime - realTime >
							(hyperMode.checked ? 0.12 : 0.16)
						) {
							if (!this[j].catched) {
								i.status = 6; //console.log("Bad", i.name);
								i.badtime = Date.now();
							}
						} else if (i.realTime - realTime > 0.08) {
							i.status = 7; //console.log("Good(Early)", i.name);
							if (document.getElementById('hitSong').checked)
								playSound(res['HitSong0'], false, true, 0);
							clickEvents1.push(
								ClickEvent1.getClickGood(i.projectX, i.projectY)
							);
						} else if (i.realTime - realTime > 0.04) {
							i.status = 5; //console.log("Perfect(Early)", i.name);
							if (document.getElementById('hitSong').checked)
								playSound(res['HitSong0'], false, true, 0);
							clickEvents1.push(
								hyperMode.checked
									? ClickEvent1.getClickGreat(
										i.projectX,
										i.projectY
									)
									: ClickEvent1.getClickPerfect(
										i.projectX,
										i.projectY
									)
							);
						} else if (
							i.realTime - realTime > -0.04 ||
							i.frameCount < 1
						) {
							i.status = 4; //console.log("Perfect(Max)", i.name);
							if (document.getElementById('hitSong').checked)
								playSound(res['HitSong0'], false, true, 0);
							clickEvents1.push(
								ClickEvent1.getClickPerfect(
									i.projectX,
									i.projectY
								)
							);
						} else if (
							i.realTime - realTime > -0.08 ||
							i.frameCount < 2
						) {
							i.status = 1; //console.log("Perfect(Late)", i.name);
							if (document.getElementById('hitSong').checked)
								playSound(res['HitSong0'], false, true, 0);
							clickEvents1.push(
								hyperMode.checked
									? ClickEvent1.getClickGreat(
										i.projectX,
										i.projectY
									)
									: ClickEvent1.getClickPerfect(
										i.projectX,
										i.projectY
									)
							);
						} else {
							i.status = 3; //console.log("Good(Late)", i.name);
							if (document.getElementById('hitSong').checked)
								playSound(res['HitSong0'], false, true, 0);
							clickEvents1.push(
								ClickEvent1.getClickGood(i.projectX, i.projectY)
							);
						}
						if (i.status) {
							stat.addCombo(i.status, 1);
							i.scored = true;
							this.splice(j, 1);
							break;
						}
					}
				}
			} else if (i.type == 2) {
				if (i.status == 4 && i.realTime - realTime < 0) {
					if (document.getElementById('hitSong').checked)
						playSound(res['HitSong1'], false, true, 0);
					clickEvents1.push(
						ClickEvent1.getClickPerfect(i.projectX, i.projectY)
					);
					stat.addCombo(4, 2);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (
							this[j].isInArea(
								i.offsetX,
								i.offsetY,
								i.cosr,
								i.sinr,
								width
							) &&
							i.realTime - realTime <
								(hyperMode.checked ? 0.12 : 0.16) &&
							(i.realTime - realTime >
								-(hyperMode.checked ? 0.12 : 0.16) ||
								i.frameCount < (hyperMode.checked ? 3 : 4))
						) {
							//console.log("Perfect", i.name);
							this[j].catched = true;
							i.status = 4;
							break;
						}
					}
				}
			} else if (i.type == 3) {
				if (i.status3) {
					if (
						(Date.now() - i.status3) * i.holdTime >=
						1.6e4 * i.realHoldTime
					) {
						//间隔时间与bpm成反比，待实测
						if (i.status2 % 4 == 0)
							clickEvents1.push(
								ClickEvent1.getClickPerfect(
									i.projectX,
									i.projectY
								)
							);
						else if (i.status2 % 4 == 1)
							clickEvents1.push(
								hyperMode.checked
									? ClickEvent1.getClickGreat(
										i.projectX,
										i.projectY
									)
									: ClickEvent1.getClickPerfect(
										i.projectX,
										i.projectY
									)
							);
						else if (i.status2 % 4 == 3)
							clickEvents1.push(
								ClickEvent1.getClickGood(i.projectX, i.projectY)
							);
						i.status3 = Date.now();
					}
					if (i.realTime + i.realHoldTime - 0.2 < realTime) {
						if (!i.status) stat.addCombo((i.status = i.status2), 3);
						if (i.realTime + i.realHoldTime < realTime)
							i.scored = true;
						continue;
					}
				}
				i.status4 = true;
				for (let j = 0; j < this.length; j++) {
					if (!i.status3) {
						if (
							this[j].type == 1 &&
							this[j].isInArea(
								i.offsetX,
								i.offsetY,
								i.cosr,
								i.sinr,
								width
							) &&
							i.realTime - realTime <
								(hyperMode.checked ? 0.12 : 0.16) &&
							(i.realTime - realTime >
								-(hyperMode.checked ? 0.12 : 0.16) ||
								i.frameCount < (hyperMode.checked ? 3 : 4))
						) {
							if (document.getElementById('hitSong').checked)
								playSound(res['HitSong0'], false, true, 0);
							if (i.realTime - realTime > 0.08) {
								i.status2 = 7; //console.log("Good(Early)", i.name);
								clickEvents1.push(
									ClickEvent1.getClickGood(
										i.projectX,
										i.projectY
									)
								);
								i.status3 = Date.now();
							} else if (i.realTime - realTime > 0.04) {
								i.status2 = 5; //console.log("Perfect(Early)", i.name);
								clickEvents1.push(
									hyperMode.checked
										? ClickEvent1.getClickGreat(
											i.projectX,
											i.projectY
										)
										: ClickEvent1.getClickPerfect(
											i.projectX,
											i.projectY
										)
								);
								i.status3 = Date.now();
							} else if (
								i.realTime - realTime > -0.04 ||
								i.frameCount < 1
							) {
								i.status2 = 4; //console.log("Perfect(Max)", i.name);
								clickEvents1.push(
									ClickEvent1.getClickPerfect(
										i.projectX,
										i.projectY
									)
								);
								i.status3 = Date.now();
							} else if (
								i.realTime - realTime > -0.08 ||
								i.frameCount < 2
							) {
								i.status2 = 1; //console.log("Perfect(Late)", i.name);
								clickEvents1.push(
									hyperMode.checked
										? ClickEvent1.getClickGreat(
											i.projectX,
											i.projectY
										)
										: ClickEvent1.getClickPerfect(
											i.projectX,
											i.projectY
										)
								);
								i.status3 = Date.now();
							} else {
								i.status2 = 3; //console.log("Good(Late)", i.name);
								clickEvents1.push(
									ClickEvent1.getClickGood(
										i.projectX,
										i.projectY
									)
								);
								i.status3 = Date.now();
							}
							this.splice(j, 1);
							i.status4 = false;
							break;
						}
					} else if (
						this[j].isInArea(
							i.offsetX,
							i.offsetY,
							i.cosr,
							i.sinr,
							width
						)
					)
						i.status4 = false;
				}
				if (!isPaused && i.status3 && i.status4) {
					i.status = 2; //console.log("Miss", i.name);
					stat.addCombo(2, 3);
					i.scored = true;
				}
			} else if (i.type == 4) {
				if (i.status == 4 && i.realTime - realTime < 0) {
					if (document.getElementById('hitSong').checked)
						playSound(res['HitSong2'], false, true, 0);
					clickEvents1.push(
						ClickEvent1.getClickPerfect(i.projectX, i.projectY)
					);
					stat.addCombo(4, 4);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (
							this[j].isInArea(
								i.offsetX,
								i.offsetY,
								i.cosr,
								i.sinr,
								width
							) &&
							i.realTime - realTime <
								(hyperMode.checked ? 0.12 : 0.16) &&
							(i.realTime - realTime >
								-(hyperMode.checked ? 0.12 : 0.16) ||
								i.frameCount < (hyperMode.checked ? 3 : 4))
						) {
							//console.log("Perfect", i.name);
							this[j].catched = true;
							if (this[j].type == 3) {
								i.status = 4;
								break;
							}
						}
					}
				}
			}
		}
	}
}
const judgements = new Judgements();
class ClickEvents extends Array {
	defilter(func) {
		var i = this.length;
		while (i--) {
			if (func(this[i])) this.splice(i, 1);
		}
		return this;
	}
}
const clickEvents0 = new ClickEvents(); //存放点击特效
const clickEvents1 = new ClickEvents(); //存放点击特效
class ClickEvent0 {
	constructor(offsetX, offsetY, n1, n2) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.color = String(n1);
		this.text = String(n2);
		this.time = 0;
	}
	static getClickTap(offsetX, offsetY) {
		//console.log("Tap", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, 'cyan', '');
	}
	static getClickHold(offsetX, offsetY) {
		//console.log("Hold", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, 'lime', '');
	}
	static getClickMove(offsetX, offsetY) {
		//console.log("Move", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, 'violet', '');
	}
}
class ClickEvent1 {
	constructor(offsetX, offsetY, n1, n2, n3) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = Date.now();
		this.duration = 400;
		this.images = res['Clicks'][n1]; //以后做缺少检测
		this.color = String(n3);
		this.rand = Array(Number(n2) || 0)
			.fill()
			.map(() => [Math.random() * 80 + 100, Math.random() * 2 * Math.PI]);
	}
	static getClickPerfect(offsetX, offsetY) {
		return new ClickEvent1(
			offsetX,
			offsetY,
			'rgba(255,236,160,0.8823529)',
			4,
			'#ffeca0'
		);
	}
	static getClickGreat(offsetX, offsetY) {
		return new ClickEvent1(
			offsetX,
			offsetY,
			'rgba(168,255,177,0.9016907)',
			4,
			'#a8ffb1'
		);
	}
	static getClickGood(offsetX, offsetY) {
		return new ClickEvent1(
			offsetX,
			offsetY,
			'rgba(180,225,255,0.9215686)',
			3,
			'#b4e1ff'
		);
	}
}
//适配PC鼠标
const isMouseDown = {};
canvas.addEventListener('mousedown', function (evt) {
	evt.preventDefault();
	const idx = evt.button;
	const dx =
		((evt.pageX - getOffsetLeft(this)) / this.offsetWidth) * this.width -
		(this.width - canvasos.width) / 2;
	const dy =
		((evt.pageY - getOffsetTop(this)) / this.offsetHeight) * this.height;
	mouse[idx] = Click.activate(dx, dy);
	isMouseDown[idx] = true;
});
canvas.addEventListener('mousemove', function (evt) {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			const dx =
				((evt.pageX - getOffsetLeft(this)) / this.offsetWidth) *
					this.width -
				(this.width - canvasos.width) / 2;
			const dy =
				((evt.pageY - getOffsetTop(this)) / this.offsetHeight) *
				this.height;
			mouse[idx].move(dx, dy);
		}
	}
});
canvas.addEventListener('mouseup', function (evt) {
	evt.preventDefault();
	const idx = evt.button;
	delete mouse[idx];
	delete isMouseDown[idx];
});
canvas.addEventListener('mouseout', function (evt) {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			delete mouse[idx];
			delete isMouseDown[idx];
		}
	}
});
//适配键盘(喵喵喵?)
window.addEventListener(
	'keydown',
	function (evt) {
		if (document.activeElement.classList.value == 'input') return;
		if (btnPlay.value != '停止') return;
		evt.preventDefault();
		if (evt.key == 'Shift') btnPause.click();
		else if (keyboard[evt.code] instanceof Click);
		else keyboard[evt.code] = Click.activate(NaN, NaN);
	},
	false
);
window.addEventListener(
	'keyup',
	function (evt) {
		if (document.activeElement.classList.value == 'input') return;
		if (btnPlay.value != '停止') return;
		evt.preventDefault();
		if (evt.key == 'Shift');
		else if (keyboard[evt.code] instanceof Click) delete keyboard[evt.code];
	},
	false
);
window.addEventListener('blur', () => {
	for (const i in keyboard) delete keyboard[i]; //失去焦点清除键盘事件
});
//适配移动设备
const passive = { passive: false }; //不加这玩意会出现warning
canvas.addEventListener(
	'touchstart',
	function (evt) {
		evt.preventDefault();
		for (const i of evt.changedTouches) {
			const idx = i.identifier; //移动端存在多押bug(可能已经解决了？)
			const dx =
				((i.pageX - getOffsetLeft(this)) / this.offsetWidth) *
					this.width -
				(this.width - canvasos.width) / 2;
			const dy =
				((i.pageY - getOffsetTop(this)) / this.offsetHeight) *
				this.height;
			touch[idx] = Click.activate(dx, dy);
		}
	},
	passive
);
canvas.addEventListener(
	'touchmove',
	function (evt) {
		evt.preventDefault();
		for (const i of evt.changedTouches) {
			const idx = i.identifier;
			const dx =
				((i.pageX - getOffsetLeft(this)) / this.offsetWidth) *
					this.width -
				(this.width - canvasos.width) / 2;
			const dy =
				((i.pageY - getOffsetTop(this)) / this.offsetHeight) *
				this.height;
			touch[idx].move(dx, dy);
		}
	},
	passive
);
canvas.addEventListener('touchend', function (evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		delete touch[idx];
	}
});
canvas.addEventListener('touchcancel', function (evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		delete touch[idx];
	}
});
//优化触摸定位，以后整合进class
function getOffsetLeft(element) {
	if (!(element instanceof HTMLElement)) return NaN;
	if (full.check(element)) return document.documentElement.scrollLeft;
	let elem = element;
	let a = 0;
	while (elem instanceof HTMLElement) {
		a += elem.offsetLeft;
		elem = elem.offsetParent;
	}
	return a;
}

function getOffsetTop(element) {
	if (!(element instanceof HTMLElement)) return NaN;
	if (full.check(element)) return document.documentElement.scrollTop;
	let elem = element;
	let a = 0;
	while (elem instanceof HTMLElement) {
		a += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return a;
}
//声音组件
const AudioContext =
	window.AudioContext ||
	window.webkitAudioContext ||
	window.mozAudioContext ||
	window.msAudioContext;
const actx =
	new Audio().canPlayType('audio/ogg') == ''
		? new OggmentedAudioContext()
		: new AudioContext(); //兼容Safari
const stopPlaying = [];
const gain = actx.createGain();
const playSound = (res, loop, isOut, offset) => {
	const bufferSource = actx.createBufferSource();
	bufferSource.buffer = res;
	bufferSource.loop = loop; //循环播放
	bufferSource.connect(gain);
	if (isOut) gain.connect(actx.destination);
	bufferSource.start(0, offset);
	return () => bufferSource.stop();
};
const res = {}; //存放资源
// resizeCanvas();
// uploads.classList.add("disabled");
// select.classList.add("disabled");
//初始化
window.onload = function () {
	if (window.ResourcesLoad != 100) {
		loadPhiCommunityResources();
	}
};
async function qwqImage(img, color) {
	const clickqwq = imgShader(img, color);
	const arr = [];
	const min = Math.min(img.width, img.height);
	const max = Math.max(img.width, img.height);
	for (let i = 0; i < parseInt(max / min); i++)
		arr[i] = await createImageBitmap(clickqwq, 0, i * min, min, min);
	return arr;
}
//必要组件
let stopDrawing;
const stat = {
	noteRank: [0, 0, 0, 0, 0, 0, 0, 0],
	combos: [0, 0, 0, 0, 0],
	maxcombo: 0,
	combo: 0,
	get good() {
		return this.noteRank[7] + this.noteRank[3];
	},
	get bad() {
		return this.noteRank[6] + this.noteRank[2];
	},
	get great() {
		return this.noteRank[5] + this.noteRank[1];
	},
	get perfect() {
		return this.noteRank[4] + this.great;
	},
	get all() {
		return this.perfect + this.good + this.bad;
	},
	get scoreNum() {
		const a =
			(1e6 *
				(this.perfect * 0.9 +
					this.good * 0.585 +
					this.maxcombo * 0.1)) /
			this.numOfNotes;
		const b =
			(1e6 * (this.noteRank[4] + this.great * 0.65 + this.good * 0.35)) /
			this.numOfNotes;
		return hyperMode.checked ? (isFinite(b) ? b : 0) : isFinite(a) ? a : 0;
	},
	get scoreStr() {
		const a = this.scoreNum.toFixed(0);
		return '0'.repeat(a.length < 7 ? 7 - a.length : 0) + a;
	},
	get accNum() {
		const a = (this.perfect + this.good * 0.65) / this.all;
		const b =
			(this.noteRank[4] + this.great * 0.65 + this.good * 0.35) /
			this.all;
		return hyperMode.checked ? (isFinite(b) ? b : 0) : isFinite(a) ? a : 0;
	},
	get accStr() {
		return (100 * this.accNum).toFixed(2) + '%';
	},
	get lineStatus() {
		if (this.bad) return 0;
		if (this.good) return 3;
		if (this.great && hyperMode.checked) return 2;
		return 1;
	},
	get rankStatus() {
		const a = Math.round(this.scoreNum);
		if (a >= 1e6) return 0;
		if (a >= 9.6e5) return 1;
		if (a >= 9.2e5) return 2;
		if (a >= 8.8e5) return 3;
		if (a >= 8.2e5) return 4;
		if (a >= 7e5) return 5;
		return 6;
	},
	get localData() {
		const l1 = Math.round(this.accNum * 1e4 + 566)
			.toString(22)
			.slice(-3);
		const l2 = Math.round(this.scoreNum + 40672)
			.toString(32)
			.slice(-4);
		const l3 = Number(inputLevel.value.match(/\d+$/))
			.toString(36)
			.slice(-1);
		return l1 + l2 + l3;
	},
	getData(isAuto) {
		const s1 = this.data[this.id].slice(0, 3);
		const s2 = this.data[this.id].slice(3, 7);
		const l1 = Math.round(this.accNum * 1e4 + 566)
			.toString(22)
			.slice(-3);
		const l2 = Math.round(this.scoreNum + 40672)
			.toString(32)
			.slice(-4);
		const l3 = Number(inputLevel.value.match(/\d+$/))
			.toString(36)
			.slice(-1);
		const a = (parseInt(s2, 32) - 40672).toFixed(0);
		const scoreBest = '0'.repeat(a.length < 7 ? 7 - a.length : 0) + a;
		if (!isAuto)
			this.data[this.id] = (s1 > l1 ? s1 : l1) + (s2 > l2 ? s2 : l2) + l3;
		const arr = [];
		for (const i in this.data) arr.push(i + this.data[i]);
		localStorage.setItem(
			'phi',
			arr.sort(() => Math.random() - 0.5).join('')
		);
		if (isAuto) return [false, scoreBest, '', true];
		return [
			s2 < l2,
			scoreBest,
			(s2 > l2 ? '- ' : '+ ') + Math.abs(scoreBest - this.scoreStr),
			false,
		];
	},
	reset(numOfNotes, id) {
		this.numOfNotes = Number(numOfNotes) || 0;
		this.combo = 0;
		this.maxcombo = 0;
		this.noteRank = [0, 0, 0, 0, 0, 0, 0, 0]; //4:PM,5:PE,1:PL,7:GE,3:GL,6:BE,2:BL
		this.combos = [0, 0, 0, 0, 0]; //不同种类note实时连击次数
		this.data = {};
		if (localStorage.getItem('phi') == null)
			localStorage.setItem('phi', ''); //初始化存储
		const str = localStorage.getItem('phi');
		for (let i = 0; i < parseInt(str.length / 40); i++) {
			const data = str.slice(i * 40, i * 40 + 40);
			this.data[data.slice(0, 32)] = data.slice(-8);
		}
		if (id) {
			if (!this.data[id]) this.data[id] = this.localData;
			this.id = id;
		}
	},
	addCombo(status, type) {
		this.noteRank[status]++;
		this.combo = status % 4 == 2 ? 0 : this.combo + 1;
		if (this.combo > this.maxcombo) this.maxcombo = this.combo;
		this.combos[0]++;
		this.combos[type]++;
	},
};
//const stat = new Stat();
const comboColor = ['#fff', '#0ac3ff', '#f0ed69', '#a0e9fd', '#fe4365'];
//	点完了选文件的监听器
// upload.onchange = function () {
// 	const file = this.files[0];
// 	document.getElementById("filename").value = file ? file.name : "";
// 	if (!file) {
// 		message.sendError("未选择任何文件");
// 		return;
// 	}
// 	uploads.classList.add("disabled");
// 	loadFile(file);
// }
const time2Str = (time) =>
	`${parseInt(time / 60)}:${`00${parseInt(time % 60)}`.slice(-2)}`;
const frameTimer = {
	//计算fps
	tick: 0,
	time: Date.now(),
	fps: '',
	addTick(fr = 10) {
		if (++this.tick >= fr) {
			this.tick = 0;
			this.fps = (
				(1e3 * fr) /
				(-this.time + (this.time = Date.now()))
			).toFixed(0);
		}
		return this.fps;
	},
};
class Timer {
	constructor() {
		this.reset();
	}
	play() {
		if (!this.isPaused) throw new Error('Time has been playing');
		this.t1 = Date.now();
		this.isPaused = false;
	}
	pause() {
		if (this.isPaused) throw new Error('Time has been paused');
		this.t0 = this.time;
		this.isPaused = true;
	}
	reset() {
		this.t0 = 0;
		this.t1 = 0;
		this.isPaused = true;
	}
	addTime(num) {
		this.t0 += num;
	}
	get time() {
		if (this.isPaused) return this.t0;
		return this.t0 + Date.now() - this.t1;
	}
	get second() {
		return this.time / 1e3;
	}
}
let curTime = 0;
let curTimestamp = 0;
let timeBgm = 0;
let timeChart = 0;
let duration = 0;
let isInEnd = false; //开头过渡动画
let isOutStart = false; //结尾过渡动画
let isOutEnd = false; //临时变量
let isPaused = true; //暂停
//note预处理
function prerenderChart(chart) {
	const chartOld = JSON.parse(JSON.stringify(chart));
	const chartNew = chartOld;
	//优化events
	for (const LineId in chartNew.judgeLineList) {
		const i = chartNew.judgeLineList[LineId];
		i.lineId = LineId;
		i.offsetX = 0;
		i.offsetY = 0;
		i.alpha = 0;
		i.rotation = 0;
		i.positionY = 0; //临时过渡用
		i.images = [
			res['JudgeLine'],
			res['JudgeLineMP'],
			res['JudgeLineAP'],
			res['JudgeLineFC'],
		];
		i.imageH = 0.008;
		i.imageW = 1.042;
		i.imageB = 0;
		i.speedEvents = addRealTime(arrangeSpeedEvent(i.speedEvents), i.bpm);
		i.judgeLineDisappearEvents = addRealTime(
			arrangeLineEvent(i.judgeLineDisappearEvents),
			i.bpm
		);
		i.judgeLineMoveEvents = addRealTime(
			arrangeLineEvent(i.judgeLineMoveEvents),
			i.bpm
		);
		i.judgeLineRotateEvents = addRealTime(
			arrangeLineEvent(i.judgeLineRotateEvents),
			i.bpm
		);
		Renderer.lines.push(i);
		for (const NoteId in i.notesAbove)
			addNote(i.notesAbove[NoteId], 1.875 / i.bpm, LineId, NoteId, true);
		for (const NoteId in i.notesBelow)
			addNote(i.notesBelow[NoteId], 1.875 / i.bpm, LineId, NoteId, false);
	}
	const sortNote = (a, b) =>
		a.realTime - b.realTime || a.lineId - b.lineId || a.noteId - b.noteId;
	Renderer.notes.sort(sortNote);
	Renderer.taps.sort(sortNote);
	Renderer.drags.sort(sortNote);
	Renderer.holds.sort(sortNote);
	Renderer.flicks.sort(sortNote);
	Renderer.reverseholds.sort(sortNote).reverse();
	Renderer.tapholds.sort(sortNote);
	//向Renderer添加Note
	function addNote(note, base32, lineId, noteId, isAbove) {
		note.offsetX = 0;
		note.offsetY = 0;
		note.alpha = 0;
		note.rotation = 0;
		note.realTime = note.time * base32;
		note.realHoldTime = note.holdTime * base32;
		note.lineId = lineId;
		note.noteId = noteId;
		note.isAbove = isAbove;
		note.name = `${lineId}${isAbove ? '+' : '-'}${noteId}`;
		Renderer.notes.push(note);
		if (note.type == 1) Renderer.taps.push(note);
		else if (note.type == 2) Renderer.drags.push(note);
		else if (note.type == 3) Renderer.holds.push(note);
		else if (note.type == 4) Renderer.flicks.push(note);
		if (note.type == 3) Renderer.reverseholds.push(note);
		if (note.type == 1 || note.type == 3) Renderer.tapholds.push(note);
	}
	//合并不同方向note
	for (const i of chartNew.judgeLineList) {
		i.notes = [];
		for (const j of i.notesAbove) {
			j.isAbove = true;
			i.notes.push(j);
		}
		for (const j of i.notesBelow) {
			j.isAbove = false;
			i.notes.push(j);
		}
	}
	//双押提示
	const timeOfMulti = {};
	for (const i of Renderer.notes)
		timeOfMulti[i.realTime.toFixed(6)] = timeOfMulti[i.realTime.toFixed(6)]
			? 2
			: 1;
	for (const i of Renderer.notes)
		i.isMulti = timeOfMulti[i.realTime.toFixed(6)] == 2;
	return chartNew;
	//规范判定线事件
	function arrangeLineEvent(events) {
		const oldEvents = JSON.parse(JSON.stringify(events)); //深拷贝
		const newEvents = [
			{
				//以1-1e6开头
				startTime: 1 - 1e6,
				endTime: 0,
				start: oldEvents[0] ? oldEvents[0].start : 0,
				end: oldEvents[0] ? oldEvents[0].end : 0,
				start2: oldEvents[0] ? oldEvents[0].start2 : 0,
				end2: oldEvents[0] ? oldEvents[0].end2 : 0,
			},
		];
		oldEvents.push({
			//以1e9结尾
			startTime: 0,
			endTime: 1e9,
			start: oldEvents[oldEvents.length - 1]
				? oldEvents[oldEvents.length - 1].start
				: 0,
			end: oldEvents[oldEvents.length - 1]
				? oldEvents[oldEvents.length - 1].end
				: 0,
			start2: oldEvents[oldEvents.length - 1]
				? oldEvents[oldEvents.length - 1].start2
				: 0,
			end2: oldEvents[oldEvents.length - 1]
				? oldEvents[oldEvents.length - 1].end2
				: 0,
		});
		for (const i2 of oldEvents) {
			//保证时间连续性
			const i1 = newEvents[newEvents.length - 1];
			if (i1.endTime > i2.endTime);
			else if (i1.endTime == i2.startTime) newEvents.push(i2);
			else if (i1.endTime < i2.startTime)
				newEvents.push(
					{
						startTime: i1.endTime,
						endTime: i2.startTime,
						start: i1.end,
						end: i1.end,
						start2: i1.end2,
						end2: i1.end2,
					},
					i2
				);
			else if (i1.endTime > i2.startTime)
				newEvents.push({
					startTime: i1.endTime,
					endTime: i2.endTime,
					start:
						(i2.start * (i2.endTime - i1.endTime) +
							i2.end * (i1.endTime - i2.startTime)) /
						(i2.endTime - i2.startTime),
					end: i1.end,
					start2:
						(i2.start2 * (i2.endTime - i1.endTime) +
							i2.end2 * (i1.endTime - i2.startTime)) /
						(i2.endTime - i2.startTime),
					end2: i1.end2,
				});
		}
		//合并相同变化率事件
		const newEvents2 = [newEvents.shift()];
		for (const i2 of newEvents) {
			const i1 = newEvents2[newEvents2.length - 1];
			const d1 = i1.endTime - i1.startTime;
			const d2 = i2.endTime - i2.startTime;
			if (i2.startTime == i2.endTime);
			else if (
				i1.end == i2.start &&
				i1.end2 == i2.start2 &&
				(i1.end - i1.start) * d2 == (i2.end - i2.start) * d1 &&
				(i1.end2 - i1.start2) * d2 == (i2.end2 - i2.start2) * d1
			) {
				i1.endTime = i2.endTime;
				i1.end = i2.end;
				i1.end2 = i2.end2;
			} else newEvents2.push(i2);
		}
		return JSON.parse(JSON.stringify(newEvents2));
	}
	//规范speedEvents
	function arrangeSpeedEvent(events) {
		const newEvents = [];
		for (const i2 of events) {
			const i1 = newEvents[newEvents.length - 1];
			if (!i1 || i1.value != i2.value) newEvents.push(i2);
			else i1.endTime = i2.endTime;
		}
		return JSON.parse(JSON.stringify(newEvents));
	}
	//添加realTime
	function addRealTime(events, bpm) {
		for (const i of events) {
			i.startRealTime = (i.startTime / bpm) * 1.875;
			i.endRealTime = (i.endTime / bpm) * 1.875;
			i.startDeg = -Deg * i.start;
			i.endDeg = -Deg * i.end;
		}
		return events;
	}
}
// document.addEventListener("visibilitychange", () => document.visibilityState == "hidden" && btnPause.value == "暂停" && btnPause.click());
// document.addEventListener("pagehide", () => document.visibilityState == "hidden" && btnPause.value == "暂停" && btnPause.click()); //兼容Safari
const qwqIn = new Timer();
const qwqOut = new Timer();
const qwqEnd = new Timer();
//play
// btnPlay.addEventListener("click", async function () {
// 	// btnPause.value = "暂停";
// 	if (this.value == "播放") {
// 		stopPlaying.push(playSound(res["mute"], true, false, 0)); //播放空音频(防止音画不同步)
// 		("lines,notes,taps,drags,flicks,holds,reverseholds,tapholds").split(",").map(i => Renderer[i] = []);
// 		Renderer.chart = prerenderChart(charts[selectchart.value]); //fuckqwq
// 		stat.reset(Renderer.chart.numOfNotes, Renderer.chart.md5);
// 		for (const i of chartLineData) {
// 			if (selectchart.value == i.Chart) {
// 				Renderer.chart.judgeLineList[i.LineId].images[0] = bgs[i.Image];
// 				Renderer.chart.judgeLineList[i.LineId].images[1] = await createImageBitmap(imgShader(bgs[i.Image], "#feffa9"));
// 				Renderer.chart.judgeLineList[i.LineId].images[2] = await createImageBitmap(imgShader(bgs[i.Image], "#a3ffac"));
// 				Renderer.chart.judgeLineList[i.LineId].images[3] = await createImageBitmap(imgShader(bgs[i.Image], "#a2eeff"));
// 				Renderer.chart.judgeLineList[i.LineId].imageH = Number(i.Vert);
// 				Renderer.chart.judgeLineList[i.LineId].imageW = Number(i.Horz);
// 				Renderer.chart.judgeLineList[i.LineId].imageB = Number(i.IsDark);
// 			}
// 		}
// 		Renderer.bgImage = bgs[selectbg.value] || res["NoImage"];
// 		Renderer.bgImageBlur = bgsBlur[selectbg.value] || res["NoImage"];
// 		Renderer.bgMusic = bgms[selectbgm.value];
// 		this.value = "停止";
// 		resizeCanvas();
// 		duration = Renderer.bgMusic.duration;
// 		isInEnd = false;
// 		isOutStart = false;
// 		isOutEnd = false;
// 		isPaused = false;
// 		timeBgm = 0;
// 		if (!showTransition.checked) qwqIn.addTime(3000);
// 		canvas.classList.remove("fade");
// 		mask.classList.add("fade");
// 		btnPause.classList.remove("disabled");
// 		for (const i of document.querySelectorAll(".disabled-when-playing")) i.classList.add("disabled");
// 		loop();
// 		qwqIn.play();
// 	} else {
// 		while (stopPlaying.length) stopPlaying.shift()();
// 		cancelAnimationFrame(stopDrawing);
// 		// resizeCanvas();
// 		// canvas.classList.add("fade");
// 		// mask.classList.remove("fade");
// 		for (const i of document.querySelectorAll(".disabled-when-playing")) i.classList.remove("disabled");
// 		// btnPause.classList.add("disabled");
// 		//清除原有数据
// 		fucktemp = false;
// 		fucktemp2 = false;
// 		clickEvents0.length = 0;
// 		clickEvents1.length = 0;
// 		qwqIn.reset();
// 		qwqOut.reset();
// 		qwqEnd.reset();
// 		curTime = 0;
// 		curTimestamp = 0;
// 		duration = 0;
// 		this.value = "播放";
// 	}
// });
//暂停监听器
btnPause.addEventListener('click', function () {
	if (this.classList.contains('disabled') || btnPlay.value == '播放') return;
	if (this.value == '暂停') {
		if(localStorage.getItem('useBGABG')=='true'&&window.chartMetadata.backgroundAnimation!=undefined){
			document.querySelector('video#bgaVideo').pause();
		}
		fetch(Pause_mp3)
			.then((res) => res.arrayBuffer())
			.then((arrayBuffer) => {
				const actx = new (window.AudioContext ||
					window.webkitAudioContext ||
					window.mozAudioContext ||
					window.msAudioContext)();
				actx.decodeAudioData(arrayBuffer, function (buffer) {
					var source = actx.createBufferSource();
					source.buffer = buffer;
					source.loop = false;
					source.connect(actx.destination);
					source.start(0);
				});
			});
		qwqIn.pause();
		document
			.querySelector('div#pauseOverlay.pauseOverlay')
			.classList.add('visable');
		if (showTransition.checked && isOutStart) qwqOut.pause();
		isPaused = true;
		this.value = '继续';
		curTime = timeBgm;
		while (stopPlaying.length) stopPlaying.shift()();
	} else {
		document.querySelector('div#pauseOverlay.pauseOverlay').innerHTML = '<div class="resumeText"></div>';
		document
			.querySelector('div#pauseOverlay.pauseOverlay')
			.classList.add('readyToResume');
		const resumeTimeOut=setTimeout(() => {
			document
				.querySelector('div#pauseOverlay.pauseOverlay')
				.classList.remove('visable');
			qwqIn.play();
			if (showTransition.checked && isOutStart) qwqOut.play();
			isPaused = false;
			if (isInEnd && !isOutStart) playBgm(Renderer.bgMusic, timeBgm);
			this.value = '暂停';
			document.querySelector(
				'div#pauseOverlay.pauseOverlay'
			).innerHTML = `
			<div id="backInPlayingBtn" id="backInPlayingBtn"></div>
			<div id="restartBtn"></div>
			<div id="resumeBtn"></div>
			`;
			document
				.querySelector('div#backInPlayingBtn')
				.addEventListener('click', exit);
			document
				.querySelector('div#restartBtn')
				.addEventListener('click', replay);
			document
				.querySelector('div#resumeBtn')
				.addEventListener('click', () => {
					btnPause.click();
				});
			document
				.querySelector('div#pauseOverlay.pauseOverlay')
				.classList.remove('readyToResume');
			if(localStorage.getItem('useBGABG')=='true'&&window.chartMetadata.backgroundAnimation!=undefined){
				document.querySelector('video#bgaVideo').play();
			}
			clearTimeout(resumeTimeOut);
		}, 3000);
	}
});
//偏移率调整
inputOffset.addEventListener('input', function () {
	if (this.value < -400) this.value = -400;
	if (this.value > 600) this.value = 600;
});
//播放bgm
function playBgm(data, offset) {
	isPaused = false;
	if (!offset) offset = 0;
	curTimestamp = Date.now();
	stopPlaying.push(playSound(data, false, true, offset));
}
let fucktemp = false;
let fucktemp2 = false;
//作图
function loop() {
	const now = Date.now();
	//计算时间
	if (qwqOut.second < 0.67) {
		calcqwq(now);
		qwqdraw1(now);
	} else if (!fucktemp) {
		qwqdraw2();
		return;
	}
	if (fucktemp2) qwqdraw3(fucktemp2);
	ctx.globalAlpha = 1;
	if (document.getElementById('imageBlur').checked)
		ctx.drawImage(
			Renderer.bgImageBlur,
			...adjustSize(Renderer.bgImageBlur, canvas, 1.1)
		);
	else
		ctx.drawImage(
			Renderer.bgImage,
			...adjustSize(Renderer.bgImage, canvas, 1.1)
		);
	ctx.fillStyle = '#000';
	ctx.globalAlpha = 0.4;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	ctx.drawImage(canvasos, (canvas.width - canvasos.width) / 2, 0);
	//Copyright
	ctx.font = `${lineScale * 0.4}px Mina`;
	ctx.fillStyle = '#ccc';
	ctx.globalAlpha = 0.8;
	ctx.textAlign = 'right';
	ctx.textBaseline = 'middle';
	ctx.fillText(
		'PhiCommunity By lchzh3473 & Yuameshi',
		(canvas.width + canvasos.width) / 2 - lineScale * 0.1,
		canvas.height - lineScale * 0.3
	);
	stopDrawing = requestAnimationFrame(loop); //回调更新动画
}

function calcqwq(now) {
	if (!isInEnd && qwqIn.second >= 3) {
		isInEnd = true;
		playBgm(Renderer.bgMusic);
	}
	if (!isPaused && isInEnd && !isOutStart)
		timeBgm = (now - curTimestamp) / 1e3 + curTime;
	if (timeBgm >= duration) isOutStart = true;
	if (showTransition.checked && isOutStart && !isOutEnd) {
		isOutEnd = true;
		qwqOut.play();
	}
	timeChart = Math.max(
		timeBgm -
			Renderer.chart.offset -
			(Number(inputOffset.value) / 1e3 || 0),
		0
	);
	//遍历判定线events和Note
	for (const line of Renderer.lines) {
		const getY = function (i) {
			if (!i.badtime) return realgetY(i);
			if (Date.now() - i.badtime > 500) delete i.badtime;
			if (!i.badY) i.badY = realgetY(i);
			return i.badY;
		};

		const realgetY = function (i) {
			if (i.type != 3)
				return (i.floorPosition - line.positionY) * i.speed;
			if (i.realTime < timeChart)
				return (i.realTime - timeChart) * i.speed;
			return i.floorPosition - line.positionY;
		};

		const setAlpha = function (i, dx, dy) {
			i.projectX = line.offsetX + dx * i.cosr;
			i.offsetX = i.projectX + dy * i.sinr;
			i.projectY = line.offsetY + dx * i.sinr;
			i.offsetY = i.projectY - dy * i.cosr;
			i.visible =
				Math.abs(i.offsetX - wlen) + Math.abs(i.offsetY - hlen) <
				wlen * 1.23625 + hlen + hlen2 * i.realHoldTime * i.speed;
			if (i.badtime) i.alpha = 1 - range((Date.now() - i.badtime) / 500);
			else if (i.realTime > timeChart) {
				if (dy > -1e-3 * hlen2)
					i.alpha =
						i.type == 3 && i.speed == 0
							? showPoint.checked
								? 0.45
								: 0
							: 1;
				else i.alpha = showPoint.checked ? 0.45 : 0;
				//i.frameCount = 0;
			} else {
				if (i.type == 3)
					i.alpha =
						i.speed == 0
							? showPoint.checked
								? 0.45
								: 0
							: i.status % 4 == 2
								? 0.45
								: 1;
				else
					i.alpha = Math.max(
						1 -
							(timeChart - i.realTime) /
								(hyperMode.checked ? 0.12 : 0.16),
						0
					); //过线后0.16s消失
				i.frameCount = isNaN(i.frameCount) ? 0 : i.frameCount + 1;
			}
		};
		for (const i of line.judgeLineDisappearEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 =
				(timeChart - i.startRealTime) /
				(i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.alpha = i.start * t1 + i.end * t2;
		}
		for (const i of line.judgeLineMoveEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 =
				(timeChart - i.startRealTime) /
				(i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.offsetX = canvasos.width * (i.start * t1 + i.end * t2);
			line.offsetY = canvasos.height * (1 - i.start2 * t1 - i.end2 * t2);
		}
		for (const i of line.judgeLineRotateEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 =
				(timeChart - i.startRealTime) /
				(i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.rotation = i.startDeg * t1 + i.endDeg * t2;
			line.cosr = Math.cos(line.rotation);
			line.sinr = Math.sin(line.rotation);
		}
		for (const i of line.speedEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			line.positionY =
				(timeChart - i.startRealTime) * i.value + i.floorPosition;
		}
		for (const i of line.notesAbove) {
			i.cosr = line.cosr;
			i.sinr = line.sinr;
			setAlpha(i, wlen2 * i.positionX, hlen2 * getY(i));
		}
		for (const i of line.notesBelow) {
			i.cosr = -line.cosr;
			i.sinr = -line.sinr;
			setAlpha(i, -wlen2 * i.positionX, hlen2 * getY(i));
		}
	}
	if (isInEnd) {
		judgements.addJudgement(Renderer.notes, timeChart);
		judgements.judgeNote(
			Renderer.drags,
			timeChart,
			canvasos.width * 0.117775
		);
		judgements.judgeNote(
			Renderer.flicks,
			timeChart,
			canvasos.width * 0.117775
		);
		judgements.judgeNote(
			Renderer.tapholds,
			timeChart,
			canvasos.width * 0.117775
		); //播放打击音效和判定
	}
	taps.length = 0; //qwq
	frameTimer.addTick(); //计算fps
	clickEvents0.defilter((i) => i.time++ > 0); //清除打击特效
	clickEvents1.defilter((i) => now >= i.time + i.duration); //清除打击特效
	for (const i in mouse) mouse[i] instanceof Click && mouse[i].animate();
	for (const i in touch) touch[i] instanceof Click && touch[i].animate();
}

function qwqdraw1(now) {
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height); //重置画面
	ctxos.globalCompositeOperation = 'destination-over'; //由后往前绘制
	for (const i of clickEvents1) {
		//绘制打击特效1
		const tick = (now - i.time) / i.duration;
		ctxos.globalAlpha = 1;
		ctxos.setTransform(
			noteScale * 6,
			0,
			0,
			noteScale * 6,
			i.offsetX,
			i.offsetY
		); //缩放
		ctxos.drawImage(
			i.images[parseInt(tick * 30)] || i.images[i.images.length - 1],
			-128,
			-128
		); //停留约0.5秒
		ctxos.fillStyle = i.color;
		ctxos.globalAlpha = 1 - tick; //不透明度
		const r3 =
			30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); //方块大小
		if (window.localStorage.getItem('useOldUI') != 'true') {
			//	溅射效果
			for (const j of i.rand) {
				const ds = j[0] * ((9 * tick) / (8 * tick + 1)); //打击点距离
				ctxos.fillRect(
					ds * Math.cos(j[1]) - r3 / 2,
					ds * Math.sin(j[1]) - r3 / 2,
					r3,
					r3
				);
			}
		}
	}
	if (document.getElementById('feedback').checked) {
		for (const i of clickEvents0) {
			//绘制打击特效0
			ctxos.globalAlpha = 0.85;
			ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
			ctxos.fillStyle = i.color;
			ctxos.beginPath();
			ctxos.arc(0, 0, lineScale * 0.5, 0, 2 * Math.PI);
			ctxos.fill();
			i.time++;
		}
	}
	if (qwqIn.second >= 3 && qwqOut.second == 0) {
		if (showPoint.checked) {
			//绘制定位点
			ctxos.font = `${lineScale}px Mina`;
			ctxos.textAlign = 'center';
			ctxos.textBaseline = 'bottom';
			for (const i of Renderer.notes) {
				if (!i.visible) continue;
				ctxos.setTransform(
					i.cosr,
					i.sinr,
					-i.sinr,
					i.cosr,
					i.offsetX,
					i.offsetY
				);
				ctxos.fillStyle = 'cyan';
				ctxos.globalAlpha = i.realTime > timeChart ? 1 : 0.5;
				ctxos.fillText(i.name, 0, -lineScale * 0.1);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = 'lime';
				ctxos.fillRect(
					-lineScale * 0.2,
					-lineScale * 0.2,
					lineScale * 0.4,
					lineScale * 0.4
				);
			}
			for (const i of Renderer.lines) {
				ctxos.setTransform(
					i.cosr,
					i.sinr,
					-i.sinr,
					i.cosr,
					i.offsetX,
					i.offsetY
				);
				ctxos.fillStyle = 'yellow';
				ctxos.globalAlpha = (i.alpha + 0.5) / 1.5;
				ctxos.fillText(i.lineId, 0, -lineScale * 0.1);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = 'violet';
				ctxos.fillRect(
					-lineScale * 0.2,
					-lineScale * 0.2,
					lineScale * 0.4,
					lineScale * 0.4
				);
			}
		}
		//绘制note
		for (const i of Renderer.flicks) drawNote(i, timeChart, 4);
		for (const i of Renderer.taps) drawNote(i, timeChart, 1);
		for (const i of Renderer.drags) drawNote(i, timeChart, 2);
		for (const i of Renderer.reverseholds) drawNote(i, timeChart, 3);
	}
	//绘制背景
	if (qwqIn.second >= 2.5) drawLine(stat.lineStatus ? 2 : 1); //绘制判定线(背景前1)
	ctxos.resetTransform();
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha =
		selectglobalalpha.value == '' ? 0.6 : selectglobalalpha.value; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	if (qwqIn.second >= 2.5 && !stat.lineStatus) drawLine(0); //绘制判定线(背景后0)
	ctxos.globalAlpha = 1;
	ctxos.resetTransform();
	if (document.getElementById('imageBlur').checked) {
		ctxos.drawImage(
			Renderer.bgImageBlur,
			...adjustSize(Renderer.bgImageBlur, canvasos, 1)
		);
	} else {
		ctxos.drawImage(
			Renderer.bgImage,
			...adjustSize(Renderer.bgImage, canvasos, 1)
		);
	}
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = 'source-over';
	//绘制进度条
	ctxos.setTransform(
		canvasos.width / 1920,
		0,
		0,
		canvasos.width / 1920,
		0,
		lineScale *
			(qwqIn.second < 0.67
				? tween.easeOutSine(qwqIn.second * 1.5) - 1
				: -tween.easeOutSine(qwqOut.second * 1.5)) *
			1.75
	);
	ctxos.drawImage(res['ProgressBar'], (timeBgm / duration) * 1920 - 1920, 0);
	//绘制文字
	ctxos.resetTransform();
	ctxos.fillStyle = '#fff';
	//开头过渡动画
	if (qwqIn.second < 3) {
		if (qwqIn.second < 0.67)
			ctxos.globalAlpha = tween.easeOutSine(qwqIn.second * 1.5);
		else if (qwqIn.second >= 2.5)
			ctxos.globalAlpha = tween.easeOutSine(6 - qwqIn.second * 2);
		ctxos.textAlign = 'center';
		//歌名
		ctxos.textBaseline = 'alphabetic';
		ctxos.font = `${lineScale * 1.1}px Mina`;
		ctxos.fillText(
			inputName.value || inputName.placeholder,
			wlen,
			hlen * 0.75
		);
		//曲绘和谱师
		ctxos.textBaseline = 'top';
		ctxos.font = `${lineScale * 0.55}px Mina`;
		ctxos.fillText(
			`Illustration designed by ${
				inputIllustrator.value || inputIllustrator.placeholder
			}`,
			wlen,
			hlen * 1.25 + lineScale * 0.15
		);
		ctxos.fillText(
			`Level designed by ${
				inputDesigner.value || inputDesigner.placeholder
			}`,
			wlen,
			hlen * 1.25 + lineScale * 1.0
		);
		//判定线(装饰用)
		ctxos.globalAlpha = 1;
		ctxos.setTransform(1, 0, 0, 1, wlen, hlen);
		const imgW =
			lineScale *
			48 *
			(qwqIn.second < 0.67 ? tween.easeInSine(qwqIn.second * 1.5) : 1);
		const imgH = lineScale * 0.15;
		if (qwqIn.second >= 2.5)
			ctxos.globalAlpha = tween.easeOutSine(6 - qwqIn.second * 2);
		ctxos.drawImage(
			lineColor.checked ? res['JudgeLineMP'] : res['JudgeLine'],
			-imgW / 2,
			-imgH / 2,
			imgW,
			imgH
		);
	}
	//绘制分数和combo以及暂停按钮
	ctxos.globalAlpha = 1;
	ctxos.setTransform(
		1,
		0,
		0,
		1,
		0,
		lineScale *
			(qwqIn.second < 0.67
				? tween.easeOutSine(qwqIn.second * 1.5) - 1
				: -tween.easeOutSine(qwqOut.second * 1.5)) *
			1.75
	);
	ctxos.textBaseline = 'alphabetic';
	ctxos.font = `${lineScale * 0.95}px Mina`;
	ctxos.textAlign = 'right';
	ctxos.fillText(
		stat.scoreStr,
		canvasos.width - lineScale * 0.65,
		lineScale * 1.375
	);
	if (!qwq[0])
		ctxos.drawImage(
			res['Pause'],
			lineScale * 0.6,
			lineScale * 0.7,
			lineScale * 0.63,
			lineScale * 0.7
		);
	if (stat.combo > 2) {
		if (lineColor.checked == true) {
			if (stat.lineStatus == 1 || stat.lineStatus == 2) {
				ctxos.fillStyle = '#fce491';
			}
			if (stat.lineStatus == 3) {
				ctxos.fillStyle = '#9ed5f3';
			}
		}
		ctxos.textAlign = 'center';
		ctxos.font = `${lineScale * 1.32}px Mina`;
		ctxos.fillText(stat.combo, wlen, lineScale * 1.375);
		ctxos.globalAlpha =
			qwqIn.second < 0.67
				? tween.easeOutSine(qwqIn.second * 1.5)
				: 1 - tween.easeOutSine(qwqOut.second * 1.5);
		ctxos.font = `${lineScale * 0.5}px Mina`;
		ctxos.fillText(
			autoplay.checked ? 'AUTOPLAY' : 'COMBO',
			wlen,
			lineScale * 2.05
		);
		ctxos.fillStyle = '#fff';
	}
	//绘制歌名和等级
	ctxos.globalAlpha = 1;
	ctxos.setTransform(
		1,
		0,
		0,
		1,
		0,
		lineScale *
			(qwqIn.second < 0.67
				? 1 - tween.easeOutSine(qwqIn.second * 1.5)
				: tween.easeOutSine(qwqOut.second * 1.5)) *
			1.75
	);
	ctxos.textBaseline = 'alphabetic';
	ctxos.textAlign = 'right';
	ctxos.font = `${lineScale * 0.63}px Mina`;
	ctxos.fillText(
		inputLevel.value || inputLevel.placeholder,
		canvasos.width - lineScale * 0.75,
		canvasos.height - lineScale * 0.66
	);
	ctxos.drawImage(
		res['SongsNameBar'],
		lineScale * 0.53,
		canvasos.height - lineScale * 1.22,
		lineScale * 0.119,
		lineScale * 0.612
	);
	ctxos.textAlign = 'left';
	ctxos.fillText(
		inputName.value || inputName.placeholder,
		lineScale * 0.85,
		canvasos.height - lineScale * 0.66
	);
	ctxos.resetTransform();
	if (qwq[0]) {
		//绘制时间和帧率以及note打击数
		if (qwqIn.second < 0.67)
			ctxos.globalAlpha = tween.easeOutSine(qwqIn.second * 1.5);
		else ctxos.globalAlpha = 1 - tween.easeOutSine(qwqOut.second * 1.5);
		ctxos.textBaseline = 'middle';
		ctxos.font = `${lineScale * 0.4}px Mina`;
		ctxos.textAlign = 'left';
		ctxos.fillText(
			`${time2Str(timeBgm)}/${time2Str(duration)}${
				isPaused ? '(Paused)' : ''
			}`,
			lineScale * 0.05,
			lineScale * 0.5
		);
		ctxos.textAlign = 'right';
		ctxos.fillText(
			frameTimer.fps,
			canvasos.width - lineScale * 0.05,
			lineScale * 0.5
		);
		ctxos.textBaseline = 'alphabetic';
		if (showPoint.checked)
			stat.combos.forEach((val, idx) => {
				ctxos.fillStyle = comboColor[idx];
				ctxos.fillText(
					val,
					lineScale * (idx + 1) * 1.1,
					canvasos.height - lineScale * 0.1
				);
			});
	}
	//判定线函数，undefined/0:默认,1:非,2:恒成立
	function drawLine(bool) {
		ctxos.globalAlpha = 1;
		const tw = 1 - tween.easeOutSine(qwqOut.second * 1.5);
		for (const i of Renderer.lines) {
			if (bool ^ i.imageB && qwqOut.second < 0.67) {
				ctxos.globalAlpha = i.alpha;
				ctxos.setTransform(
					i.cosr * tw,
					i.sinr,
					-i.sinr * tw,
					i.cosr,
					wlen + (i.offsetX - wlen) * tw,
					i.offsetY
				); //hiahiah
				const imgH =
					i.imageH > 0
						? lineScale * 18.75 * i.imageH
						: canvasos.height * -i.imageH; // hlen*0.008
				const imgW =
					((imgH * i.images[0].width) / i.images[0].height) *
					i.imageW; //* 38.4*25 * i.imageH* i.imageW; //wlen*3
				ctxos.drawImage(
					i.images[lineColor.checked ? stat.lineStatus : 0],
					-imgW / 2,
					-imgH / 2,
					imgW,
					imgH
				);
			}
		}
	}
}
//	结束处理
function qwqdraw2() {
	cancelAnimationFrame(stopDrawing);
	let mode = 'normal';
	if (autoplay.checked == true) {
		mode = 'auto';
	}
	if (hyperMode.checked == true && mode != 'auto') {
		mode = 'hyper';
	}
	sessionStorage.setItem(
		'play',
		new URLSearchParams(new URL(location.href).search).get('play')
	);
	sessionStorage.setItem(
		'level',
		new URLSearchParams(new URL(location.href).search).get('l')
	);
	sessionStorage.setItem('score', stat.scoreStr);
	sessionStorage.setItem('maxCombo', stat.maxcombo);
	sessionStorage.setItem(
		'perfect',
		stat.noteRank[5] + stat.noteRank[4] + stat.noteRank[1]
	);
	sessionStorage.setItem('good', stat.noteRank[7] + stat.noteRank[3]);
	sessionStorage.setItem('early', stat.noteRank[7]);
	sessionStorage.setItem('bad', stat.noteRank[6]);
	sessionStorage.setItem('miss', stat.noteRank[2]);
	sessionStorage.setItem('mode', mode);
	if (mode == 'normal') {
		var isNewBest = false,
			prevBest = 0;
		DB()
			.openDB('PhiCommunityPlayResults')
			.then((result) => {
				//成功打开数据库
				DB()
					.readKey(result.objectStore, window.chartMetadata.codename +'-' +new URLSearchParams(new URL(location.href).search).get('l').toLowerCase())
					.then((res) => {
						//如果没有此键（没玩过）
						if (res == undefined) {
							console.log('Unplayed song detected');
							DB()
								.createKey(result.objectStore, {
									codename:
										window.chartMetadata.codename +
										'-' +
										new URLSearchParams(
											new URL(location.href).search
										)
											.get('l')
											.toLowerCase(),
									level: new URLSearchParams(
										new URL(location.href).search
									)
										.get('l')
										.toLowerCase(),
									levelRank:
										window.chartMetadata[
											new URLSearchParams(
												new URL(location.href).search
											)
												.get('l')
												.toLowerCase() + 'Ranking'
										],
									score: stat.scoreNum,
									accuracy: stat.accNum,
									rankingScore: getRks(stat.accNum),
								})
								.then(() => {
									sessionStorage.setItem('isNewBest', 'true');
									sessionStorage.setItem('prevBest', '0');
									return;
								});
						}
						//如果玩过且分数更高则更新
						if (parseFloat(res.score) < stat.scoreNum) {
							console.log('Updating database');
							// 判断NEW
							isNewBest = true;
							prevBest = Math.round(res.score);
							DB()
								.updateKey(result.objectStore, {
									codename: 
									window.chartMetadata.codename +
									'-' +
									new URLSearchParams(
										new URL(location.href).search
									)
										.get('l')
										.toLowerCase(),
									level: new URLSearchParams(
										new URL(location.href).search
									)
										.get('l')
										.toLowerCase(),
									levelRank:
										window.chartMetadata[
											new URLSearchParams(
												new URL(location.href).search
											)
												.get('l')
												.toLowerCase() + 'Ranking'
										],
									score: stat.scoreNum,
									accuracy: stat.accNum,
									rankingScore: getRks(stat.accNum),
								})
								.then(() => {
									sessionStorage.setItem(
										'isNewBest',
										isNewBest
									);
									sessionStorage.setItem(
										'prevBest',
										prevBest
									);
								});
						}
					});
			})
			.catch(() => {
				//如果打开数据库失败（没有玩过游戏）
				DB()
					.createDB('PhiCommunityPlayResults', 'codename', [
						'level',
						'levelRank',
						'score',
						'accuracy',
						'rankingScore',
					])
					.then((result) => {
						DB()
							.createKey(result.objectStore, {
								codename: 
								window.chartMetadata.codename +
								'-' +
								new URLSearchParams(
									new URL(location.href).search
								)
									.get('l')
									.toLowerCase(),
								level: new URLSearchParams(
									new URL(location.href).search
								)
									.get('l')
									.toLowerCase(),
								levelRank:
									window.chartMetadata[
										new URLSearchParams(
											new URL(location.href).search
										)
											.get('l')
											.toLowerCase() + 'Ranking'
									],
								score: stat.scoreNum,
								accuracy: stat.accNum,
								rankingScore: getRks(stat.accNum),
							})
							.then(() => {
								sessionStorage.setItem('isNewBest', 'true');
								sessionStorage.setItem('prevBest', '0');
								return;
							});
					});
			})
			.finally(() => {
				location.href = '../LevelOver/index.html';
			});
	}else{
		location.href = '../LevelOver/index.html';
	} 
	return;
}

function qwqdraw3(statData) {
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = 'source-over';
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalAlpha = 1;
	if (document.getElementById('imageBlur').checked)
		ctxos.drawImage(
			Renderer.bgImageBlur,
			...adjustSize(Renderer.bgImageBlur, canvasos, 1)
		);
	else
		ctxos.drawImage(
			Renderer.bgImage,
			...adjustSize(Renderer.bgImage, canvasos, 1)
		);
	ctxos.fillStyle = '#000'; //背景变暗
	ctxos.globalAlpha =
		selectglobalalpha.value == '' ? 0.6 : selectglobalalpha.value; //背景不透明度
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = 'destination-out';
	ctxos.globalAlpha = 1;
	const k = 3.7320508075688776; //tan75°
	ctxos.setTransform(
		canvasos.width - canvasos.height / k,
		0,
		-canvasos.height / k,
		canvasos.height,
		canvasos.height / k,
		0
	);
	ctxos.fillRect(
		0,
		0,
		1,
		tween.easeOutCubic(range((qwqEnd.second - 0.13) * 0.94))
	);
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = 'destination-over';
	const qwq0 = (canvasos.width - canvasos.height / k) / (16 - 9 / k);
	ctxos.setTransform(
		qwq0 / 120,
		0,
		0,
		qwq0 / 120,
		wlen - qwq0 * 8,
		hlen - qwq0 * 4.5
	); //?
	ctxos.drawImage(res['LevelOver4'], 183, 42, 1184, 228);
	ctxos.globalAlpha = range((qwqEnd.second - 0.27) / 0.83);
	ctxos.drawImage(res['LevelOver1'], 102, 378);
	ctxos.globalCompositeOperation = 'source-over';
	ctxos.globalAlpha = 1;
	ctxos.drawImage(
		res['LevelOver5'],
		700 * tween.easeOutCubic(range(qwqEnd.second * 1.25)) - 369,
		91,
		20,
		80
	);
	//歌名和等级
	ctxos.fillStyle = '#fff';
	ctxos.textBaseline = 'middle';
	ctxos.textAlign = 'left';
	ctxos.font = '80px Mina';
	ctxos.fillText(
		inputName.value || inputName.placeholder,
		700 * tween.easeOutCubic(range(qwqEnd.second * 1.25)) - 320,
		145
	);
	ctxos.font = '30px Mina';
	ctxos.fillText(
		inputLevel.value || inputLevel.placeholder,
		700 * tween.easeOutCubic(range(qwqEnd.second * 1.25)) - 317,
		208
	);
	//Rank图标
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 3.75);
	const qwq2 = 293 + range((qwqEnd.second - 1.87) * 3.75) * 100;
	const qwq3 = 410 - range((qwqEnd.second - 1.87) * 2.14) * 164;
	ctxos.drawImage(
		res['LevelOver3'],
		661 - qwq2 / 2,
		545 - qwq2 / 2,
		qwq2,
		qwq2
	);
	ctxos.drawImage(
		res['Ranks'][stat.rankStatus],
		661 - qwq3 / 2,
		545 - qwq3 / 2,
		qwq3,
		qwq3
	);
	//各种数据
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.5);
	ctxos.fillStyle = statData[0] ? '#18ffbf' : '#fff';
	ctxos.fillText(statData[0] ? 'NEW BEST' : 'BEST', 898, 428);
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'center';
	ctxos.fillText(statData[1], 1180, 428);
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 2.5);
	ctxos.textAlign = 'right';
	ctxos.fillText(statData[2], 1414, 428);
	ctxos.globalAlpha = range((qwqEnd.second - 0.95) * 1.5);
	ctxos.textAlign = 'left';
	ctxos.fillText(stat.accStr, 352, 545);
	ctxos.fillText(stat.maxcombo, 1528, 545);
	if (statData[3]) {
		ctxos.fillStyle = '#fe4365';
		ctxos.fillText('AUTO PLAY', 1355, 590);
	} else if (stat.lineStatus == 1) {
		ctxos.fillStyle = '#ffc500';
		ctxos.fillText('ALL  PERFECT', 1355, 590);
	} else if (stat.lineStatus == 2) {
		ctxos.fillStyle = '#91ff8f';
		ctxos.fillText('ALL  PERFECT', 1355, 590);
	} else if (stat.lineStatus == 3) {
		ctxos.fillStyle = '#00bef1';
		ctxos.fillText('FULL  COMBO', 1355, 590);
	}
	ctxos.fillStyle = '#fff';
	ctxos.textAlign = 'center';
	ctxos.font = '86px Mina';
	ctxos.globalAlpha = range((qwqEnd.second - 1.12) * 2.0);
	ctxos.fillText(stat.scoreStr, 1075, 554);
	ctxos.font = '26px Mina';
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.5);
	ctxos.fillText(stat.perfect, 891, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.07) * 2.5);
	ctxos.fillText(stat.good, 1043, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.27) * 2.5);
	ctxos.fillText(stat.noteRank[6], 1196, 645);
	ctxos.globalAlpha = range((qwqEnd.second - 1.47) * 2.5);
	ctxos.fillText(stat.noteRank[2], 1349, 645);
	ctxos.font = '22px Mina';
	const qwq4 = range(
		(qwq[3] > 0 ? qwqEnd.second - qwq[3] : 0.2 - qwqEnd.second - qwq[3]) *
			5.0
	);
	ctxos.globalAlpha = 0.8 * range((qwqEnd.second - 0.87) * 2.5) * qwq4;
	ctxos.fillStyle = '#696';
	ctxos.fill(
		new Path2D(
			'M841,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'
		)
	);
	ctxos.globalAlpha = 0.8 * range((qwqEnd.second - 1.07) * 2.5) * qwq4;
	ctxos.fillStyle = '#669';
	ctxos.fill(
		new Path2D(
			'M993,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z'
		)
	);
	ctxos.fillStyle = '#fff';
	ctxos.globalAlpha = range((qwqEnd.second - 0.97) * 2.5) * qwq4;
	ctxos.fillText('Early: ' + stat.noteRank[5], 891, 755);
	ctxos.fillText('Late: ' + stat.noteRank[1], 891, 788);
	ctxos.globalAlpha = range((qwqEnd.second - 1.17) * 2.5) * qwq4;
	ctxos.fillText('Early: ' + stat.noteRank[7], 1043, 755);
	ctxos.fillText('Late: ' + stat.noteRank[3], 1043, 788);
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = 'destination-over';
	ctxos.globalAlpha = 1;
	ctxos.fillStyle = '#000';
	ctxos.drawImage(
		Renderer.bgImage,
		...adjustSize(Renderer.bgImage, canvasos, 1)
	);
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
}

function range(num) {
	if (num < 0) return 0;
	if (num > 1) return 1;
	return num;
}
//绘制Note
function drawNote(note, realTime, type) {
	const HL = note.isMulti && document.getElementById('highLight').checked;
	if (!note.visible) return;
	if (note.type != 3 && note.scored && !note.badtime) return;
	if (note.type == 3 && note.realTime + note.realHoldTime < realTime) return; //qwq
	ctxos.globalAlpha = note.alpha;
	ctxos.setTransform(
		noteScale * note.cosr,
		noteScale * note.sinr,
		-noteScale * note.sinr,
		noteScale * note.cosr,
		note.offsetX,
		note.offsetY
	);
	if (type == 3) {
		const baseLength = (hlen2 / noteScale) * note.speed;
		const holdLength = baseLength * note.realHoldTime;
		if (note.realTime > realTime) {
			if (HL) {
				ctxos.drawImage(
					res['HoldHeadHL'],
					-res['HoldHeadHL'].width * 1.026 * 0.5,
					0,
					res['HoldHeadHL'].width * 1.026,
					res['HoldHeadHL'].height * 1.026
				);
				ctxos.drawImage(
					res['HoldHL'],
					-res['HoldHL'].width * 1.026 * 0.5,
					-holdLength,
					res['HoldHL'].width * 1.026,
					holdLength
				);
			} else {
				ctxos.drawImage(
					res['HoldHead'],
					-res['HoldHead'].width * 0.5,
					0
				);
				ctxos.drawImage(
					res['Hold'],
					-res['Hold'].width * 0.5,
					-holdLength,
					res['Hold'].width,
					holdLength
				);
			}
			ctxos.drawImage(
				res['HoldEnd'],
				-res['HoldEnd'].width * 0.5,
				-holdLength - res['HoldEnd'].height
			);
		} else {
			if (HL)
				ctxos.drawImage(
					res['HoldHL'],
					-res['HoldHL'].width * 1.026 * 0.5,
					-holdLength,
					res['HoldHL'].width * 1.026,
					holdLength - baseLength * (realTime - note.realTime)
				);
			else
				ctxos.drawImage(
					res['Hold'],
					-res['Hold'].width * 0.5,
					-holdLength,
					res['Hold'].width,
					holdLength - baseLength * (realTime - note.realTime)
				);
			ctxos.drawImage(
				res['HoldEnd'],
				-res['HoldEnd'].width * 0.5,
				-holdLength - res['HoldEnd'].height
			);
		}
	} else if (note.badtime) {
		if (type == 1)
			ctxos.drawImage(
				res['TapBad'],
				-res['TapBad'].width * 0.5,
				-res['TapBad'].height * 0.5
			);
	} else if (HL) {
		if (type == 1)
			ctxos.drawImage(
				res['TapHL'],
				-res['TapHL'].width * 0.5,
				-res['TapHL'].height * 0.5
			);
		else if (type == 2)
			ctxos.drawImage(
				res['DragHL'],
				-res['DragHL'].width * 0.5,
				-res['DragHL'].height * 0.5
			);
		else if (type == 4)
			ctxos.drawImage(
				res['FlickHL'],
				-res['FlickHL'].width * 0.5,
				-res['FlickHL'].height * 0.5
			);
	} else {
		if (type == 1)
			ctxos.drawImage(
				res['Tap'],
				-res['Tap'].width * 0.5,
				-res['Tap'].height * 0.5
			);
		else if (type == 2)
			ctxos.drawImage(
				res['Drag'],
				-res['Drag'].width * 0.5,
				-res['Drag'].height * 0.5
			);
		else if (type == 4)
			ctxos.drawImage(
				res['Flick'],
				-res['Flick'].width * 0.5,
				-res['Flick'].height * 0.5
			);
	}
}
//test
function chart123(chart) {
	const newChart = JSON.parse(JSON.stringify(chart)); //深拷贝
	switch (
		newChart.formatVersion //加花括号以避免beautify缩进bug
	) {
	case 1: {
		newChart.formatVersion = 3;
		for (const i of newChart.judgeLineList) {
			let y = 0;
			for (const j of i.speedEvents) {
				if (j.startTime < 0) j.startTime = 0;
				j.floorPosition = y;
				y +=
						(((j.endTime - j.startTime) * j.value) / i.bpm) * 1.875;
			}
			for (const j of i.judgeLineDisappearEvents) {
				j.start2 = 0;
				j.end2 = 0;
			}
			for (const j of i.judgeLineMoveEvents) {
				j.start2 = (j.start % 1e3) / 520;
				j.end2 = (j.end % 1e3) / 520;
				j.start = parseInt(j.start / 1e3) / 880;
				j.end = parseInt(j.end / 1e3) / 880;
			}
			for (const j of i.judgeLineRotateEvents) {
				j.start2 = 0;
				j.end2 = 0;
			}
		}
		break;
	}
	case 3: {
		break;
	}
	case 3473:
		break;
	default:
		throw `Unsupported formatVersion: ${newChart.formatVersion}`;
	}
	return newChart;
}
//调节画面尺寸和全屏相关
function adjustSize(source, dest, scale) {
	const [sw, sh, dw, dh] = [
		source.width,
		source.height,
		dest.width,
		dest.height,
	];
	if (dw * sh > dh * sw)
		return [
			(dw * (1 - scale)) / 2,
			(dh - ((dw * sh) / sw) * scale) / 2,
			dw * scale,
			((dw * sh) / sw) * scale,
		];
	return [
		(dw - ((dh * sw) / sh) * scale) / 2,
		(dh * (1 - scale)) / 2,
		((dh * sw) / sh) * scale,
		dh * scale,
	];
}
//给图片上色
function imgShader(img, color) {
	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	const imgData = ctx.getImageData(0, 0, img.width, img.height);
	const data = hex2rgba(color);
	for (let i = 0; i < imgData.data.length / 4; i++) {
		imgData.data[i * 4] *= data[0] / 255;
		imgData.data[i * 4 + 1] *= data[1] / 255;
		imgData.data[i * 4 + 2] *= data[2] / 255;
		imgData.data[i * 4 + 3] *= data[3] / 255;
	}
	return imgData;
}

function imgBlur(img) {
	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	return StackBlur.imageDataRGB(
		ctx.getImageData(0, 0, img.width, img.height),
		0,
		0,
		img.width,
		img.height,
		Math.ceil(Math.min(img.width, img.height) * 0.15)
	);
}
//十六进制color转rgba数组
function hex2rgba(color) {
	const ctx = document.createElement('canvas').getContext('2d');
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	return ctx.getImageData(0, 0, 1, 1).data;
}

//##########################################

window.addEventListener('DOMContentLoaded', () => {
	// loadPhiCommunityResources();
	document
		.querySelector('div#backInPlayingBtn')
		.addEventListener('click', exit);
	document.querySelector('div#restartBtn').addEventListener('click', replay);
	document.querySelector('div#resumeBtn').addEventListener('click', () => {
		btnPause.click();
	});
	//	获取游玩谱面和难度信息
	const play = new URLSearchParams(new URL(location.href).search).get('play');
	var level = new URLSearchParams(new URL(location.href).search).get('l');
	//	添加加载页面覆盖层
	let loadingEmbedFrame = document.createElement('iframe');
	loadingEmbedFrame.src =
		'../loadingChartScreen/index.html?c=' + play + '&l=' + level;
	loadingEmbedFrame.classList.add('loadingEmbedFrame');
	document.body.appendChild(loadingEmbedFrame);
	//	不断检测直到加载完成
	var loadCompleteDetectInterval = setInterval(() => {
		var LoadCompleteItems = 0;
		for (let i in Renderer) {
			if (Renderer[i] != undefined) {
				LoadCompleteItems++;
			}
		}
		if (LoadCompleteItems == 12 && window.ResourcesLoad >= 100) {
			loadingEmbedFrame.remove();
			clearInterval(loadCompleteDetectInterval);
		}
	});

	//	获取元数据
	console.log('Fetching MetaData:', play);
	let metaURL='https://charts.phicommunity.com.cn/' + play + '/meta.json';
	if (play=='tutorial') {
		const month=new Date().getMonth();
		const day=new Date().getDate();
		if (month===3&&day===1) {
			//aprfus
			console.log('Hello World!');
			metaURL='https://charts.phicommunity.com.cn/' + play + '/meta.sp.json';
			setInterval(() => {
				renderTutorialSPByTime(qwqIn.second);
			}, 500);
		}else{
			setInterval(() => {
				renderTutorialByTime(qwqIn.second);
			}, 500);
		}
	}
	fetch(metaURL)
		.then((res) => res.json())
		.then((meta) => {
			window.chartMetadata = meta;
			document.getElementById('input-name').value = meta.name; //歌名
			document.getElementById('input-level').value =
				level.toUpperCase() +
				' Lv.' +
				Math.floor(meta[level.toLowerCase() + 'Ranking'] || 0); //难度
			var chartDesigner;
			if (meta.chartDesigner != undefined) {
				//谱面设计者
				chartDesigner = meta.chartDesigner;
			} else {
				chartDesigner = meta[level + 'ChartDesigner'];
			}
			document.getElementById('input-designer').value = chartDesigner;
			document.getElementById('input-illustrator').value =
				meta.illustrator; //曲绘
			//	获取谱面
			console.log('Fetching Chart:', play);
			fetch(
				'https://charts.phicommunity.com.cn/' +
					play +
					'/' +
					meta['chart' + level.toUpperCase()]
			)
				.then((res) => res.text())
				.then((text) => {
					window.chartString = text;
					try {
						Renderer.chart = chart123(JSON.parse(text));
					} catch (error) {
						//	JSON解析出错了就换PEC解析（
						Renderer.chart = chart123(
							pec2json(text, undefined).data
						);
					}
					if (localStorage.getItem('chart-speedchange')!=null) {
						const speedChange=parseInt(localStorage.getItem('chart-speedchange'))/10;
						if (speedChange>=0.7&&speedChange<=1.5) {
							console.log('Applying speed change:',speedChange);
							Renderer.chart.judgeLineList.forEach(line=>{
								line.notesAbove.forEach(note=>{
									note.speed*=speedChange;
								});
								line.notesBelow.forEach(note=>{
									note.speed*=speedChange;
								});
							});
						}else{
							console.error('Invalid speed change value:',speedChange);
						}
					}
				})
				.catch(() => {
					alert('谱面获取失败！');
				});

			//	获取曲绘
			console.log('Fetching illustration:', meta['illustration']);
			document.body.setAttribute(
				'style',
				'--background: url(' +
					encodeURI(
						'https://charts.phicommunity.com.cn/' +
							meta['codename'] +
							'/' +
							meta['illustration']
					) +
					')'
			);
			fetch(
				'https://charts.phicommunity.com.cn/' +
					meta['codename'] +
					'/' +
					meta['illustration']
			)
				.then((response) => response.blob())
				.then((blob) => {
					createImageBitmap(blob).then((img) => {
						Renderer.bgImage = img;
						createImageBitmap(imgBlur(img)).then((imgBlur) => {
							Renderer.bgImageBlur = imgBlur;
						});
					});
				})
				.catch((error) => {
					alert('无法获取曲绘，原因是：\n' + error);
				});
			if(localStorage.getItem('useBGABG')=='true'&&window.chartMetadata.backgroundAnimation!=undefined){
				const bgaVideo=document.createElement('video');
				bgaVideo.id='bgaVideo';
				bgaVideo.muted='muted';
				bgaVideo.style.display='none';
				bgaVideo.setAttribute('crossOrigin', '');
				bgaVideo.src='https://charts.phicommunity.com.cn/'+meta['codename']+'/'+meta['backgroundAnimation'];
				document.body.appendChild(bgaVideo);
			}
			//	判定线贴图
			window.chartLine = [];
			window.chartLineData = [];
			window.chartLineTextureDecoded = new Array(window.chartLine.length);

			if (meta.lineTexture) {
				console.log('Line Texture Detected');
				fetch(
					'https://charts.phicommunity.com.cn/' +
						meta['codename'] +
						'/' +
						meta['lineTexture']
				)
					.then((res) => res.json())
					.then((data) => {
						window.chartLineData = data;
						window.chartLine = data;
						window.chartLineTextureDecoded = new Array(
							window.chartLine.length
						);
						for (let i = 0; i < window.chartLine.length; i++) {
							console.log(
								'Fetching chart line texture:',
								'https://charts.phicommunity.com.cn/' +
									meta['codename'] +
									'/' +
									chartLine[i].Image.toString()
							);
							fetch(
								'https://charts.phicommunity.com.cn/' +
									meta['codename'] +
									'/' +
									chartLine[i].Image.toString()
							)
								.then((response) => response.blob())
								.then((blob) => {
									createImageBitmap(blob).then((img) => {
										window.chartLineTextureDecoded[i] = img;
										window.bgs[
											chartLine[i].Image.toString()
										] = img;
									});
								})
								.catch((error) => {
									alert(
										'无法获取判定线贴图#' +
											i.toString() +
											'，原因是：\n' +
											error
									);
								});
						}
					});
			}
			//	获取图片并写入对象bgs
			window.bgs = {};
			//	获取歌曲
			console.log('Fetching Audio:', meta['musicFile']);
			fetch(
				'https://charts.phicommunity.com.cn/' +
					meta['codename'] +
					'/' +
					meta['musicFile']
			)
				.then((response) => response.arrayBuffer())
				.then((arrayBuffer) => {
					actx.decodeAudioData(arrayBuffer).then((audioBuff) => {
						Renderer.bgMusic = audioBuff;
					});
				})
				.catch((error) => {
					alert('无法获取歌曲，原因是：\n' + error);
				});
			var tapToStartFrame = document.createElement('div');
			tapToStartFrame.classList.add('tapToStartFrame');
			tapToStartFrame.innerHTML = `
		<div class="songName">${meta.name}</div>
		<div class="judgeLine"></div>
		<div class="detail">
			Illustration designed by ${meta.illustrator} <br />
			Level designed by ${chartDesigner}
		</div>
		<div style="display:flex;flex-direction:row;">点按以开始 <div style="color:#6cf;" onclick="alert('移动端浏览器禁止了无手势自动播放音频，所以我们需要你的手势来开始播放音频并全屏网页')"> 为什么？ </div></div>
		`;
			tapToStartFrame.addEventListener('click', () => {
				var LoadCompleteItems = 0;
				for (let i in Renderer) {
					if (Renderer[i] != undefined) {
						LoadCompleteItems++;
					}
				}
				if (LoadCompleteItems == 12 && window.ResourcesLoad >= 100) {
					tapToStartFrame.remove();
					if (localStorage.autoFullscreen != 'false') {
						full.toggle();
					}
					document.getElementById('btn-play').click();
				} else {
					console.log('LoadNotComplete');
				}
			});
			// 应用设置
			for (let i = 0; i < Object.keys(localStorage).length; i++) {
				const key = Object.keys(localStorage)[i];
				const value = localStorage[Object.keys(localStorage)[i]];
				if (key == 'phi') {
					continue;
				}
				if (key.match('eruda')) {
					continue;
				}
				console.log('Applying settings:', key, value);
				const elem = document.querySelector('#' + key);
				try {
					// console.log(elem.type);
					if (elem.type == 'checkbox') {
						if (value == 'true') {
							elem.setAttribute('checked', value);
						} else {
							elem.removeAttribute('checked');
						}
						continue;
					}
					if (elem.type == 'text' || elem.type == 'number') {
						elem.setAttribute('value', value);
						continue;
					}
					if (elem.type == 'select-one') {
						for (let j = 0; j < elem.children.length; j++) {
							// console.log(elem.children[j].getAttribute("selected"))
							// 先遍历删掉原来的选项
							if (
								elem.children[j].getAttribute('selected') !=
								null
							) {
								elem.children[j].removeAttribute('selected');
							}
						}
						// console.log(elem)
						// console.log(elem.children[parseFloat(value)-1])
						elem.children[parseFloat(value) - 1].setAttribute(
							'selected',
							'true'
						);
						continue;
					}
				} catch (error) {
					console.warn(
						'Error occured when applying settings \'' + key + '\':\n',
						error
					);
				}
			}
			if (window.localStorage.getItem('useOldUI') == 'true') {
				document.body.setAttribute(
					'style',
					'background: #000 !important;'
				);
				document.querySelector(
					'#select-global-alpha'
				).children[0].selected = true;
			}
			document.body.appendChild(tapToStartFrame);
		});
});

function replay() {
	document
		.querySelector('div#pauseOverlay.pauseOverlay')
		.classList.remove('visable');
	btnPlay.click();
	try {
		Renderer.chart = chart123(JSON.parse(window.chartString));
	} catch (e) {
		Renderer.chart = chart123(pec2json(window.chartString, undefined).data);
	}
	btnPlay.click();
}
document
	.getElementById('btn-play')
	.addEventListener('click', async function () {
		if(localStorage.getItem('useBGABG')=='true'&&window.chartMetadata.backgroundAnimation!=undefined){
			setTimeout(()=>{
				document.querySelector('video#bgaVideo').currentTime=0;
				document.querySelector('video#bgaVideo').play();
				const updateBGAInterval = setInterval(() => {
					createImageBitmap(
						document.querySelector('video#bgaVideo')
					).then((img) => (Renderer.bgImage = img));
					document.getElementById('imageBlur').checked
						? createImageBitmap(imgBlur(Renderer.bgImage)).then(
								(imgBlur) => {
									Renderer.bgImageBlur = imgBlur;
								}
						)
						: undefined;
				}, 50);
				document.querySelector('video#bgaVideo').addEventListener('ended',()=>{
					clearInterval(updateBGAInterval);
				});
			},4000);
		}
		btnPause.value = '暂停';
		if (this.value == '播放') {
			stopPlaying.push(playSound(res['mute'], true, false, 0)); //播放空音频(防止音画不同步)
			'lines,notes,taps,drags,flicks,holds,reverseholds,tapholds'
				.split(',')
				.map((i) => (Renderer[i] = []));
			// Renderer.chart = prerenderChart(charts[selectchart.value]); //fuckqwq
			Renderer.chart = prerenderChart(Renderer.chart); //fuckqwq
			stat.reset(Renderer.chart.numOfNotes, Renderer.chart.md5);
			for (let j = 0; j < window.chartLineData.length; j++) {
				// }
				// for (var i of window.chartLineData) {
				const i = window.chartLineData[j];
				// if (selectchart.value == i.Chart) {
				console.log(window.chartLineData.indexOf(i));
				Renderer.chart.judgeLineList[i.LineId].image = new Array();
				Renderer.chart.judgeLineList[i.LineId].images[0] =
					window.bgs[i.Image];
				Renderer.chart.judgeLineList[i.LineId].images[1] =
					await createImageBitmap(
						imgShader(window.bgs[i.Image], '#feffa9')
					);
				Renderer.chart.judgeLineList[i.LineId].images[2] =
					await createImageBitmap(
						imgShader(window.bgs[i.Image], '#a3ffac')
					);
				Renderer.chart.judgeLineList[i.LineId].images[3] =
					await createImageBitmap(
						imgShader(window.bgs[i.Image], '#a2eeff')
					);
				Renderer.chart.judgeLineList[i.LineId].imageH = Number(i.Vert);
				Renderer.chart.judgeLineList[i.LineId].imageW = Number(i.Horz);
				Renderer.chart.judgeLineList[i.LineId].imageB = Number(
					i.IsDark
				);
				// }
			}
			// Renderer.bgImage = bgs[selectbg.value] || res["NoImage"];
			// Renderer.bgImageBlur = bgsBlur[selectbg.value] || res["NoImage"];
			// Renderer.bgMusic = bgms[selectbgm.value];
			resizeCanvas();
			console.log(Renderer);
			duration = Renderer.bgMusic.duration;
			isInEnd = false;
			isOutStart = false;
			isOutEnd = false;
			isPaused = false;
			timeBgm = 0;
			if (!showTransition.checked) qwqIn.addTime(3000);
			// canvas.classList.remove("fade");
			// mask.classList.add("fade");
			// btnPause.classList.remove("disabled");
			// for (const i of document.querySelectorAll(".disabled-when-playing")) i.classList.add("disabled");
			// setTimeout(qwqdraw2, 4000);

			loop();
			qwqIn.play();
			this.value = '停止';
		} else {
			while (stopPlaying.length) stopPlaying.shift()();
			cancelAnimationFrame(stopDrawing);
			// resizeCanvas();
			// canvas.classList.add("fade");
			// mask.classList.remove("fade");
			for (const i of document.querySelectorAll('.disabled-when-playing'))
				i.classList.remove('disabled');
			// btnPause.classList.add("disabled");
			//清除原有数据
			fucktemp = false;
			fucktemp2 = false;
			clickEvents0.length = 0;
			clickEvents1.length = 0;
			qwqIn.reset();
			qwqOut.reset();
			qwqEnd.reset();
			curTime = 0;
			curTimestamp = 0;
			duration = 0;
			this.value = '播放';
		}
	});

function getRks(accuracy) {
	if (accuracy >= 0.7) {
		return (
			Math.pow((accuracy * 100 - 55) / 45, 2) *
			window.chartMetadata[
				new URLSearchParams(new URL(location.href).search)
					.get('l')
					.toLowerCase() + 'Ranking'
			]
		).toFixed(2);
	} else {
		return 0;
	}
}
document.addEventListener(
	'visibilitychange',
	() =>
		document.visibilityState == 'hidden' &&
		btnPause.value == '暂停' &&
		btnPause.click()
);
async function loadPhiCommunityResources() {
	let loadedNum = 0;
	await Promise.all(
		((obj) => {
			const arr = [];
			for (const i in obj) arr.push([i, obj[i]]);
			return arr;
		})(resource).map(([name, src], _i, arr) => {
			const xhr = new XMLHttpRequest();
			xhr.open('get', src, true);
			xhr.responseType = 'arraybuffer';
			xhr.addEventListener('error', () => {
				alert('内部资源加载失败，请刷新页面重试');
			});
			xhr.send();
			return new Promise((resolve) => {
				xhr.onload = async () => {
					if (/\.(mp3|wav|ogg)$/i.test(src))
						res[name] = await actx.decodeAudioData(xhr.response);
					else if (/\.(png|jpeg|jpg)$|data:image\//i.test(src))
						res[name] = await createImageBitmap(
							new Blob([xhr.response])
						);
					window.ResourcesLoad = Math.floor(
						(++loadedNum / arr.length) * 100
					);
					message.sendMessage(`加载资源：${window.ResourcesLoad}%`);
					resolve();
				};
			});
		})
	);
	res['JudgeLineMP'] = await createImageBitmap(
		imgShader(res['JudgeLine'], '#feffa9')
	);
	res['JudgeLineAP'] = await createImageBitmap(
		imgShader(res['JudgeLine'], '#a3ffac')
	);
	res['JudgeLineFC'] = await createImageBitmap(
		imgShader(res['JudgeLine'], '#a2eeff')
	);
	res['TapBad'] = await createImageBitmap(imgShader(res['Tap2'], '#6c4343'));
	res['Clicks'] = {};
	//res["Clicks"].default = await qwqImage(res["clickRaw"], "white");
	// res["Ranks"] = await qwqImage(res["Rank"], "white");
	if (localStorage.getItem('useOldUI') == 'true') {
		res['Clicks']['rgba(255,236,160,0.8823529)'] = await qwqImage(
			res['clickRaw'],
			'rgba(232, 148, 101,0.8823529)'
		); //#e89465e1
		res['Clicks']['rgba(168,255,177,0.9016907)'] = await qwqImage(
			res['clickRaw'],
			'rgba(123, 193, 253,0.9215686)'
		); //#7bc1fdeb
		res['Clicks']['rgba(180,225,255,0.9215686)'] = await qwqImage(
			res['clickRaw'],
			'rgba(123, 193, 253,0.9215686)'
		); //#7bc1fdeb
	} else {
		res['Clicks']['rgba(255,236,160,0.8823529)'] = await qwqImage(
			res['clickRaw'],
			'rgba(255,236,160,0.8823529)'
		); //#fce491
		res['Clicks']['rgba(168,255,177,0.9016907)'] = await qwqImage(
			res['clickRaw'],
			'rgba(168,255,177,0.9016907)'
		); //#97f79d
		res['Clicks']['rgba(180,225,255,0.9215686)'] = await qwqImage(
			res['clickRaw'],
			'rgba(180,225,255,0.9215686)'
		); //#9ed5f3
	}
	message.sendMessage('核心资源加载完成!');
}

function exit() {
	fetch(Exit_mp3)
		.then((res) => res.arrayBuffer())
		.then((arrayBuffer) => {
			const actx = new (window.AudioContext ||
				window.webkitAudioContext ||
				window.mozAudioContext ||
				window.msAudioContext)();
			actx.decodeAudioData(arrayBuffer, function (buffer) {
				var source = actx.createBufferSource();
				source.buffer = buffer;
				source.loop = false;
				source.connect(actx.destination);
				source.start(0);
			});
		});
	setTimeout(() => {
		location.href = '../songSelect/index.html';
	}, 500);
}
