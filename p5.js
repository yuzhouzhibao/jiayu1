document.addEventListener('keydown', function (event) {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        // 左箭头键或右箭头键，执行切换页面逻辑
        if (event.code === 'ArrowLeft') {
            prev(); // 左箭头键
        } else if (event.code === 'ArrowRight') {
            next(); // 右箭头键
        }
    } else if (event.code === 'Space') {
        // 空格键，执行跳转到指定页面逻辑
        jumpToPage(currIndex);
    } else if (event.code === 'KeyP') {
        // 'p' 键，执行返回上一页逻辑
        goBack();
    }
});

function goBack() {
    // 编写返回上一页的逻辑
    // 这里简单的使用浏览器的后退功能
    window.history.back();
}

const panels = document.querySelectorAll('.panel');

// 默认展开第一个面板
panels[0].classList.add('active');

// 绑定点击事件
panels.forEach(panel => {
    panel.addEventListener('click', () => {
        removeActiveClasses();
        panel.classList.add('active');
    });

    // 获取面板中的视频元素
    const video = panel.querySelector('iframe');

    // 添加按下空格键播放/暂停事件
    panel.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    });
});

function removeActiveClasses() {
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
}
