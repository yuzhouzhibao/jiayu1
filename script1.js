
// 存储主页面状态
function saveMainPageState() {
    // 在这里保存主页面的状态数据
    // 例如：
    // sessionStorage.setItem('mainPageState', 'someState');
}

// 恢复主页面状态
function restoreMainPageState() {
    // 在这里恢复主页面的状态数据
    // 例如：
    // var storedState = sessionStorage.getItem('mainPageState');
    // return storedState ? storedState : null;
}

// 当主页面加载时，恢复状态
window.onload = function () {
    var mainPageState = restoreMainPageState();
    if (mainPageState) {
        // 根据恢复的状态执行相应的操作
        // 例如：
        // console.log('Restored main page state:', mainPageState);
    }
};

// 添加在返回主页面时调用的脚本
document.addEventListener('keydown', function (event) {
    if (event.key === 'p') {
        saveMainPageState();
        window.location.href = '主页面.html';  // 跳转回主页面
    }
});

// 获取所有的item元素
var items = document.getElementsByClassName('item');

// 循环遍历每个item
for (var i = 0; i < items.length; i++) {
    // 获取当前item
    var item = items[i];
    var frame = item.getElementsByClassName('frame')[0];
    var frontBox = frame.getElementsByClassName('front')[0];
    var leftBox = frame.getElementsByClassName('left')[0];
    var rightBox = frame.getElementsByClassName('right')[0];

    // 设置背景图片
    frontBox.style.backgroundImage = `url(${i + 1}.png)`;
    leftBox.style.backgroundImage = `url(${i + 1}.png)`;
    rightBox.style.backgroundImage = `url(${i + 1}.png)`;

}

(function () {
    "use strict";
    var shell = document.getElementsByClassName('shell')[0];
    var slider = shell.getElementsByClassName('shell_slider')[0];
    var items = shell.getElementsByClassName('item');
    var prevBtn = shell.getElementsByClassName('prev')[0];
    var nextBtn = shell.getElementsByClassName('next')[0];
    // 定义变量
    var width, height, totalWidth, margin = 20,
        currIndex = 0,
        interval, intervalTime = 3000;

    function init() {
        // 初始化函数
        resize();
        bindEvents();
        move(1); // 将初始位置设置为第一个轮播项
        // 不再自动轮播
        // timer();
    }

    function resize() {
        // 窗口大小变化时调整大小
        width = Math.max(window.innerWidth * .20, 275);
        height = window.innerHeight * .5;
        totalWidth = width * items.length;
        // 设置slider宽度
        slider.style.width = totalWidth + "px";
        // 设置每个item的宽度和高度
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            item.style.width = (width - (margin * 2)) + "px";
            item.style.height = height + "px";
        }
    }

    function bindEvents() {
        // 窗口大小变化时调整大小
        window.onresize = resize;
        // 点击prev按钮切换item
        prevBtn.addEventListener('click', () => { prev(); });
        // 点击next按钮切换item
        nextBtn.addEventListener('click', () => { next(); });
        // 使用键盘左右箭头键进行切换
        document.addEventListener('keydown', function (event) {
            if (event.keyCode === 37) {
                prev(); // 左箭头键
            } else if (event.keyCode === 39) {
                next(); // 右箭头键
            } else if (event.keyCode === 32) {
                // 空格键
                jumpToPage(currIndex);
            }
        });
    }

    init();

    function move(index) {
        // 移动shell到指定的item
        if (index < 1) index = items.length;
        if (index > items.length) index = 1;
        currIndex = index;
        // 遍历所有item
        for (var i = 0; i < items.length; i++) {
            let item = items[i],
                box = item.getElementsByClassName('frame')[0];
            if (i == (index - 1)) {
                // 当前item添加active类并设置3D效果
                item.classList.add('item--active');
                box.style.transform = "perspective(1200px)";
            } else {
                // 其他item移除active类并设置3D效果
                item.classList.remove('item--active');
                box.style.transform = "perspective(1200px) rotateY(" + (i < (index - 1) ? 40 : -40) + "deg)";
            }
        }
        // 移动slider
        slider.style.transform = "translate3d(" + ((index * -width) + (width / 2) + window.innerWidth / 2) + "px, 0, 0)";
        // 设置body背景图片
        var frontBox = items[index - 1].getElementsByClassName('front')[0];
        document.body.style.backgroundImage = frontBox.style.backgroundImage;
    }

    // 切换item
    function prev() {
        move(--currIndex);
        // 不再自动轮播
        // timer();
    }

    function next() {
        move(++currIndex);
        // 不再自动轮播
        // timer();
    }

    // 添加页面跳转函数
    function jumpToPage(index) {
        switch (index) {
            case 1:
                window.location.href = 'p1.html';
                break;
            case 2:
                window.location.href = 'P2.html';
                break;
            case 3:
                window.location.href = 'P3.html';
                break;
            case 4:
                window.location.href = 'P4.html';
                break;
            case 5:
                window.location.href = 'P5.html';
                break;
            case 6:
                window.location.href = 'P7.html';
                break;
            case 7:
                window.location.href = 'P8.html';
                break;
            
            // 添加其他轮播项对应的页面跳转
            // case 3:
            //     window.location.href = 'j3.html';
            //     break;
            // ...
            default:
                // 默认情况，可以不处理或者跳转到其他页面
                break;
        }
    }
})();

var mouse = document.querySelector(".mouse");
    window.addEventListener("mousemove",function(event){
        mouse.style.left = event.clientX - mouse.offsetWidth/2+"px";
        mouse.style.top = event.clientY - mouse.offsetHeight/2+"px";
    })
// 存储主页面状态
function saveMainPageState() {
    // 获取当前的索引
    var currentIndex = currIndex;
    // 保存当前索引到 sessionStorage
    sessionStorage.setItem('mainPageState', currentIndex);
}

// 恢复主页面状态
function restoreMainPageState() {
    // 从 sessionStorage 中获取之前保存的索引
    var storedState = sessionStorage.getItem('mainPageState');
    // 如果有保存的状态，则返回该状态，否则返回 null
    return storedState ? parseInt(storedState) : null;
}

// 当主页面加载时，恢复状态
window.onload = function () {
    var mainPageState = restoreMainPageState();
    if (mainPageState !== null) {
        // 如果存在之前保存的状态，则恢复到该状态
        move(mainPageState);
    }
};

// 添加在返回主页面时调用的脚本
document.addEventListener('keydown', function (event) {
    if (event.key === 'p') {
        saveMainPageState();
        window.location.href = 'index.html';  // 跳转回主页面
    }
});
