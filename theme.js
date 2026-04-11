function setTheme(t) {
  if (t === 'auto') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('quizpanol-theme');
  } else {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('quizpanol-theme', t);
  }
  document.querySelectorAll('.theme-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.themeVal === t);
  });
}

(function() {
  var t = localStorage.getItem('quizpanol-theme') || 'auto';
  document.querySelectorAll('.theme-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.themeVal === t);
  });
})();
