/* Set the theme before first paint, so the page never flashes the wrong colors. */
(function () {
  var saved = null;
  try { saved = localStorage.getItem('yativo-theme'); } catch (e) { /* private mode */ }
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  window.Prism = window.Prism || {};
  window.Prism.manual = true;
})();
