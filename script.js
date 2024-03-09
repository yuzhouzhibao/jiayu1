const left = document.querySelector('.left')
const right = document.querySelector('.right')
const container = document.querySelector('.container')

left.addEventListener('mouseenter', () => container.classList.add('hover-left'))
left.addEventListener('mouseleave', () => container.classList.remove('hover-left'))

right.addEventListener('mouseenter', () => container.classList.add('hover-right'))
right.addEventListener('mouseleave', () => container.classList.remove('hover-right'))
document.addEventListener('DOMContentLoaded', function () {
    const leftBtn = document.querySelector('.split.left .btn');
    const rightBtn = document.querySelector('.split.right .btn');
  
    leftBtn.addEventListener('click', function () {
      window.location.href = 'index1.html';
    });
  
    rightBtn.addEventListener('click', function () {
      window.location.href = 'index1.html';
    });
  });
  