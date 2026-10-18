// Photo slideshow. Reads the PHOTOS list in photos.js.
document.addEventListener('DOMContentLoaded', function () {
  var show = document.getElementById('show');
  if (!show || typeof PHOTOS === 'undefined') return;
  var img = document.getElementById('show-img'), bg = document.getElementById('show-bg');
  var count = document.getElementById('show-count'), bar = document.getElementById('show-bar');
  var playBtn = document.getElementById('show-play'), shufBtn = document.getElementById('show-shuffle');
  var order = PHOTOS.map(function (_, i) { return i; }), pos = 0, timer = null, playing = true;
  function src(i) { return (window.PHOTO_DATA && PHOTO_DATA[PHOTOS[i]]) || 'assets/photos/' + PHOTOS[i]; }
  function go(n) {
    pos = (n + order.length) % order.length;
    var s = src(order[pos]), pre = new Image();
    pre.onload = function () {
      img.style.opacity = 0;
      setTimeout(function () {
        img.src = s; bg.style.backgroundImage = 'url("' + s + '")'; img.style.opacity = 1;
      }, 220);
    };
    pre.src = s;
    count.textContent = (pos + 1) + ' / ' + order.length;
    bar.style.width = ((pos + 1) / order.length * 100) + '%';
    new Image().src = src(order[(pos + 1) % order.length]);
  }
  function tick() { clearInterval(timer); if (playing) timer = setInterval(function () { go(pos + 1); }, 5500); }
  function visible() { return show.offsetParent !== null; }
  document.getElementById('show-next').onclick = function () { go(pos + 1); tick(); };
  document.getElementById('show-prev').onclick = function () { go(pos - 1); tick(); };
  playBtn.onclick = function () { playing = !playing; playBtn.textContent = playing ? 'Pause' : 'Play'; tick(); };
  shufBtn.onclick = function () {
    var on = shufBtn.classList.toggle('on');
    if (on) { for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; } }
    else { order = PHOTOS.map(function (_, i) { return i; }); }
    go(0); tick();
  };
  document.getElementById('show-full').onclick = function () {
    if (document.fullscreenElement) document.exitFullscreen(); else if (show.requestFullscreen) show.requestFullscreen();
  };
  document.addEventListener('keydown', function (e) {
    if (!visible()) return;
    if (e.key === 'ArrowRight') { go(pos + 1); tick(); }
    if (e.key === 'ArrowLeft') { go(pos - 1); tick(); }
    if (e.key === ' ') { e.preventDefault(); playBtn.click(); }
  });
  var x0 = null;
  show.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  show.addEventListener('touchend', function (e) {
    if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(d) > 40) { go(pos + (d < 0 ? 1 : -1)); tick(); }
  });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { playing = false; playBtn.textContent = 'Play'; }
  go(0); tick();
});
