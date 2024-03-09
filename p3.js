
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

const elements = document.querySelectorAll('a, img');

window.addEventListener('scroll', checkElements);

checkElements();

function checkElements() {
  const triggerBottom = window.innerHeight / 5 * 4;

  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;

    if (elementTop < triggerBottom) {
      element.classList.add('show');
    } else {
      element.classList.remove('show');
    }
  });
}
