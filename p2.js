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

document.addEventListener('DOMContentLoaded', function () {
    const trailContainer = document.createElement('div');
    trailContainer.className = 'mouse-trail-container';
    document.body.appendChild(trailContainer);
  
    document.addEventListener('mousemove', function (e) {
      const mouseX = e.pageX;
      const mouseY = e.pageY;
  
      const mouseTrail = document.createElement('div');
      mouseTrail.className = 'mouse-trail';
      mouseTrail.style.left = mouseX + 'px';
      mouseTrail.style.top = mouseY + 'px';
  
      // Mostrar la cola del ratón
      mouseTrail.style.opacity = 0.8;
  
      // Ajustar la duración y tiempo de espera antes de desvanecer
      setTimeout(function () {
        mouseTrail.style.opacity = 0;
        setTimeout(function () {
          trailContainer.removeChild(mouseTrail);
        }, 200); // Reducido el tiempo de espera a 200ms
      }, 800); // Reducida la duración a 800ms
  
      // Agregar la cola del ratón al contenedor
      trailContainer.appendChild(mouseTrail);
    });
  });
  
var mouse = document.querySelector(".mouse");
window.addEventListener("mousemove",function(event){
    mouse.style.left = event.clientX - mouse.offsetWidth/2+"px";
    mouse.style.top = event.clientY - mouse.offsetHeight/2+"px";
})