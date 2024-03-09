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
var mouse = document.querySelector(".mouse");
window.addEventListener("mousemove",function(event){
    mouse.style.left = event.clientX - mouse.offsetWidth/2+"px";
    mouse.style.top = event.clientY - mouse.offsetHeight/2+"px";
})