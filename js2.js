(function () {
  var shell = document.getElementsByClassName('shell')[0];
  var slider = shell.getElementsByClassName('shell_slider')[0];
  var items = shell.getElementsByClassName('item');
  var width, height, totalWidth, margin = 20,
      currIndex = 0;

  function init() {
      resize();
      bindEvents();
      move(1); // 将第一个盒子设为当前显示状态
  }

  function resize() {
      width = Math.max(window.innerWidth * .20, 275);
      height = window.innerHeight * .5;
      totalWidth = width * items.length;
      slider.style.width = totalWidth + "px";

      for (var i = 0; i < items.length; i++) {
          let item = items[i];
          item.style.width = (width - (margin * 2)) + "px";
          item.style.height = height + "px";
      }
  }

  function bindEvents() {
      window.onresize = resize;
      document.addEventListener('keydown', handleKeyPress);
      document.addEventListener('wheel', handleMouseScroll); // 添加鼠标滚轮事件监听
  }

  init();

  function move(index) {
      if (index < 1) index = 1;
      if (index > items.length) index = items.length;
      currIndex = index;

      for (var i = 0; i < items.length; i++) {
          let item = items[i],
              box = item.getElementsByClassName('frame')[0];
          if (i == (index - 1)) {
              item.classList.add('item--active');
              box.style.transform = "perspective(1200px)";
          } else {
              item.classList.remove('item--active');
              box.style.transform = "perspective(1200px) rotateY(" + (i < (index - 1) ? 40 : -40) + "deg)";
          }
      }
      slider.style.transform = "translate3d(" + ((index * -width) + (width / 2) + window.innerWidth / 2) + "px, 0, 0)";
      var frontBox = items[index - 1].getElementsByClassName('front')[0];
      document.body.style.backgroundImage = frontBox.style.backgroundImage;
  }

  function handleKeyPress(event) {
      if (event.keyCode === 37) { // Left arrow key
          move(currIndex - 1);
      } else if (event.keyCode === 39) { // Right arrow key
          move(currIndex + 1);
      }
  }

  function handleMouseScroll(event) {
      if (event.deltaY > 0) { // Mouse scroll down
          move(currIndex + 1); // Simulate right arrow key press
      } else if (event.deltaY < 0) { // Mouse scroll up
          move(currIndex - 1); // Simulate left arrow key press
      }
  }
})();
