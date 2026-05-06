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

function renderHeader() {
  var el = document.querySelector('header.global-header');
  var homeHref = el.dataset.homeHref || 'index.html';
  var breadcrumb = el.dataset.breadcrumb || '';
  var brandHtml;
  if (breadcrumb) {
    brandHtml =
      '<a class="brand-name" href="' + homeHref + '">¡Quizpañol!</a>' +
      '<nav class="breadcrumb" aria-label="Breadcrumb">' +
      '<span class="crumb-slash" aria-hidden="true">/</span>' +
      '<span aria-current="page">' + breadcrumb + '</span>' +
      '</nav>';
  } else {
    brandHtml =
      '<div class="brand-block">' +
      '<a class="brand-name" href="' + homeHref + '">¡Quizpañol!</a>' +
      '<p class="header-subtitle">Platforma do nauki gramatyki hiszpańskiej poprzez teorię i quizy.</p>' +
      '</div>';
  }
  var themeSwitch =
    '<div class="theme-switch" role="group" aria-label="Motyw">' +
    '<button class="theme-btn" data-theme-val="light" onclick="setTheme(\'light\')" title="Jasny">☀</button>' +
    '<button class="theme-btn" data-theme-val="auto" onclick="setTheme(\'auto\')" title="Automatyczny (systemowy)">Auto</button>' +
    '<button class="theme-btn" data-theme-val="dark" onclick="setTheme(\'dark\')" title="Ciemny">☽</button>' +
    '</div>';
  el.innerHTML = '<div class="container header-inner">' + brandHtml + themeSwitch + '</div>';
  var t = localStorage.getItem('quizpanol-theme') || 'auto';
  document.querySelectorAll('.theme-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.themeVal === t);
  });
}

document.addEventListener('DOMContentLoaded', renderHeader);

