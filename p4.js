let isGoingBack = false;  // 新增标志位

document.addEventListener('keydown', function (event) {
    if (!isGoingBack && event.key === 'p') {
        // 'p' 键，执行返回上一页逻辑
        goBack();
    }
});

function goBack() {
    if (!isGoingBack) {
        isGoingBack = true;  // 设置标志位，防止多次触发
        console.log('Going back...');
        
        // 编写返回上一页的逻辑
        // 这里简单的使用浏览器的后退功能
        window.history.back();

        // 一定时间后重置标志位，允许再次触发
        setTimeout(function () {
            isGoingBack = false;
        }, 1000);  // 1秒后重置标志位
    }
}


var mouse = document.querySelector(".mouse");
window.addEventListener("mousemove",function(event){
    mouse.style.left = event.clientX - mouse.offsetWidth/2+"px";
    mouse.style.top = event.clientY - mouse.offsetHeight/2+"px";
})
