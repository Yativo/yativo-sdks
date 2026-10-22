/* Yativo SDK guide behaviour. Plain JS, no build step. */
(function () {
  'use strict';

  const LANGS = [
    { id: 'node', label: 'Node.js', prism: 'javascript' },
    { id: 'python', label: 'Python', prism: 'python' },
    { id: 'php', label: 'PHP', prism: 'php' },
    { id: 'laravel', label: 'Laravel', prism: 'php' },
    { id: 'go', label: 'Go', prism: 'go' },
  ];
  const EXTRA_PRISM = { bash: 'bash', shell: 'bash', json: 'json', env: 'bash', curl: 'bash', http: 'http', text: 'none' };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

  /* ------------------------------------------------------------ theme */
  const root = document.documentElement;
  $('#theme-toggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('yativo-theme', next);
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!store.get('yativo-theme')) root.dataset.theme = e.matches ? 'dark' : 'light';
  });

  /* ------------------------------------------------------------ toast */
  const toast = $('#toast');
  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  /* ------------------------------------------------------------ code blocks */
  const ICON_COPY = '<svg class="clip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  let currentLang = store.get('yativo-lang') || 'node';
  if (!LANGS.some((l) => l.id === currentLang)) currentLang = 'node';
  const tabGroups = [];

  function dedent(text) {
    const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
    const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
    const min = indents.length ? Math.min.apply(null, indents) : 0;
    return lines.map((l) => l.slice(min)).join('\n');
  }

  function prismLang(key) {
    const lang = LANGS.find((l) => l.id === key);
    return lang ? lang.prism : EXTRA_PRISM[key] || key;
  }

  function highlight(pre) {
    if (window.Prism && pre.firstChild) window.Prism.highlightElement(pre.firstChild);
  }

  function moveIndicator(container, button, el) {
    if (!button || !el) return;
    el.style.width = button.offsetWidth + 'px';
    el.style.transform = 'translateX(' + (button.offsetLeft - (container.scrollLeft || 0) * 0) + 'px)';
  }

  $$('.code').forEach((block) => {
    const samples = $$('script[type="text/plain"]', block);
    const title = block.dataset.title || '';
    const head = document.createElement('div');
    head.className = 'code-head';
    const body = document.createElement('div');
    body.className = 'code-body';
    const pres = samples.map((s) => {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      const key = s.dataset.lang || 'text';
      pre.dataset.lang = key;
      pre.dataset.label = s.dataset.label || (LANGS.find((l) => l.id === key) || {}).label || key;
      code.className = 'language-' + prismLang(key);
      code.textContent = dedent(s.textContent);
      pre.appendChild(code);
      body.appendChild(pre);
      s.remove();
      return pre;
    });

    const isLangGroup = pres.length > 1 && pres.every((p) => LANGS.some((l) => l.id === p.dataset.lang));
    if (pres.length > 1) {
      const tabs = document.createElement('div');
      tabs.className = 'code-tabs';
      tabs.setAttribute('role', 'tablist');
      const underline = document.createElement('span');
      underline.className = 'underline';
      pres.forEach((pre, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = pre.dataset.label;
        b.setAttribute('role', 'tab');
        b.dataset.lang = pre.dataset.lang;
        b.addEventListener('click', () => {
          if (isLangGroup) setLang(pre.dataset.lang, b);
          else select(i);
        });
        tabs.appendChild(b);
      });
      tabs.appendChild(underline);
      head.appendChild(tabs);
      const select = (i, animate) => {
        pres.forEach((p, j) => {
          const on = i === j;
          p.hidden = !on;
          if (on && animate && !reduceMotion) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); }
        });
        const buttons = $$('button', tabs);
        buttons.forEach((b, j) => { b.classList.toggle('on', i === j); b.setAttribute('aria-selected', String(i === j)); });
        moveIndicator(tabs, buttons[i], underline);
      };
      tabGroups.push({ block, pres, select, isLangGroup, tabs, underline });
      select(isLangGroup ? Math.max(0, pres.findIndex((p) => p.dataset.lang === currentLang)) : 0);
    } else {
      const t = document.createElement('span');
      t.className = 'code-title';
      t.textContent = title || (pres[0] && pres[0].dataset.label) || '';
      head.appendChild(t);
      const spacer = document.createElement('span');
      spacer.style.flex = '1';
      head.appendChild(spacer);
    }

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'copy';
    copy.innerHTML = ICON_COPY + '<span>Copy</span>';
    copy.setAttribute('aria-label', 'Copy code');
    copy.addEventListener('click', async () => {
      const visible = pres.find((p) => !p.hidden) || pres[0];
      await copyText(visible.textContent);
      copy.classList.add('done');
      copy.lastChild.textContent = 'Copied';
      showToast('Copied to clipboard');
      setTimeout(() => { copy.classList.remove('done'); copy.lastChild.textContent = 'Copy'; }, 1600);
    });
    head.appendChild(copy);
    block.prepend(head);
    block.appendChild(body);
  });

  /* global language picker */
  const seg = $('#lang-seg');
  const segPill = document.createElement('span');
  segPill.className = 'pill';
  LANGS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.label;
    b.dataset.lang = l.id;
    b.addEventListener('click', () => setLang(l.id, b));
    seg.appendChild(b);
  });
  seg.appendChild(segPill);

  function syncSeg() {
    $$('button', seg).forEach((b) => b.classList.toggle('on', b.dataset.lang === currentLang));
    const on = $('button.on', seg);
    if (on) { segPill.style.width = on.offsetWidth + 'px'; segPill.style.transform = 'translateX(' + (on.offsetLeft - 3) + 'px)'; }
    $$('[data-show-lang]').forEach((el) => { el.hidden = !el.dataset.showLang.split(' ').includes(currentLang); });
  }

  function setLang(lang, sourceButton) {
    // Keep the clicked tab where it is on screen while blocks above change height.
    const anchor = sourceButton || null;
    const before = anchor ? anchor.getBoundingClientRect().top : 0;
    currentLang = lang;
    store.set('yativo-lang', lang);
    tabGroups.forEach((g) => {
      if (!g.isLangGroup) return;
      const i = g.pres.findIndex((p) => p.dataset.lang === lang);
      if (i >= 0) g.select(i, true);
    });
    syncSeg();
    renderReference();
    if (anchor) window.scrollBy(0, anchor.getBoundingClientRect().top - before);
  }

  /* ------------------------------------------------------------ hero terminal */
  const TERMINAL = {
    node: ['$ npm install @yativo/fiat-sdk', '', "import Yativo from '@yativo/fiat-sdk';", '', 'const yativo = new Yativo({ environment: \'sandbox\' });', 'const deposit = await yativo.deposits.create({', '  gateway: 22, amount: 250, currency: \'USD\',', '});', '// → send the payer to deposit.deposit_url'],
    python: ['$ pip install yativo-fiat-sdk', '', 'from yativo_fiat import Yativo', '', 'yativo = Yativo(environment="sandbox")', 'deposit = yativo.deposits.create(', '    gateway=22, amount=250, currency="USD",', ')', '# → send the payer to deposit["deposit_url"]'],
    php: ['$ composer require yativo/fiat-sdk', '', 'use Yativo\\Fiat\\Yativo;', '', "$yativo = new Yativo(['environment' => 'sandbox']);", '$deposit = $yativo->deposits->create([', "    'gateway' => 22, 'amount' => 250, 'currency' => 'USD',", ']);', "// → send the payer to $deposit['deposit_url']"],
    laravel: ['$ composer require yativo/fiat-sdk-laravel', '', 'use Yativo\\Fiat\\Laravel\\Facades\\Yativo;', '', '$deposit = Yativo::deposits()->create([', "    'gateway' => 22, 'amount' => 250, 'currency' => 'USD',", ']);', '', "return redirect()->away($deposit['deposit_url']);"],
    go: ['$ go get github.com/Yativo/yativo-fiat-go', '', 'client, _ := yativo.New("", "",', '    yativo.WithEnvironment(yativo.Sandbox))', 'resp, err := client.Deposits.Create(ctx, map[string]any{', '    "gateway": 22, "amount": 250, "currency": "USD",', '})', '// → resp.Decode(&created); redirect to created.DepositURL'],
  };
  const termPre = $('#terminal-code');
  const termTabs = $('#terminal-tabs');
  let termTimer = null;
  let termLang = currentLang;
  let termAuto = true;

  function typeTerminal(lang) {
    termLang = lang;
    $$('button', termTabs).forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
    clearTimeout(termTimer);
    const full = TERMINAL[lang].join('\n');
    if (reduceMotion) { termPre.textContent = full; return; }
    let i = 0;
    const caret = '<span class="caret"></span>';
    const step = () => {
      i = Math.min(full.length, i + (full[i] === ' ' ? 2 : 1 + Math.floor(Math.random() * 2)));
      termPre.innerHTML = '';
      termPre.append(document.createTextNode(full.slice(0, i)));
      termPre.insertAdjacentHTML('beforeend', caret);
      if (i < full.length) termTimer = setTimeout(step, full[i - 1] === '\n' ? 90 : 16);
      else if (termAuto) termTimer = setTimeout(nextTerminal, 2600);
    };
    step();
  }
  function nextTerminal() {
    const ids = LANGS.map((l) => l.id);
    typeTerminal(ids[(ids.indexOf(termLang) + 1) % ids.length]);
  }
  LANGS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.label;
    b.dataset.lang = l.id;
    b.addEventListener('click', () => { termAuto = false; typeTerminal(l.id); });
    termTabs.appendChild(b);
  });
  const terminal = $('.terminal');
  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { typeTerminal(termLang); termObserver.disconnect(); } });
  });
  termObserver.observe(terminal);

  /* ------------------------------------------------------------ reveal on scroll */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal, .stagger, .flow').forEach((el) => revealObserver.observe(el));

  /* card glow follows the pointer */
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
  }, { passive: true });

  /* ------------------------------------------------------------ header, progress, to-top */
  const header = $('.site-header');
  const progress = $('.progress');
  const toTop = $('.to-top');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 8);
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    toTop.classList.toggle('show', y > 900);
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  onScroll();

  /* ------------------------------------------------------------ sidebar: scrollspy + drawer */
  const sidebar = $('.sidebar');
  const scrim = $('.scrim');
  const tocLinks = $$('.toc a');
  const indicator = document.createElement('span');
  indicator.className = 'toc-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  $('.toc').appendChild(indicator);
  const sections = tocLinks.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);

  function setActive(id) {
    tocLinks.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if (on) {
        a.setAttribute('aria-current', 'location');
        const list = a.closest('.toc');
        if (list !== indicator.parentElement) list.appendChild(indicator);
        indicator.style.opacity = '1';
        indicator.style.height = a.offsetHeight + 'px';
        indicator.style.transform = 'translateY(' + a.offsetTop + 'px)';
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }
  const spy = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) setActive(visible[0].target.id);
  }, { rootMargin: '-' + (parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) + 40) + 'px 0px -65% 0px' });
  sections.forEach((s) => spy.observe(s));

  function toggleMenu(open) {
    sidebar.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    $('#menu-btn').setAttribute('aria-expanded', String(open));
  }
  $('#menu-btn').addEventListener('click', () => toggleMenu(!sidebar.classList.contains('open')));
  scrim.addEventListener('click', () => toggleMenu(false));
  tocLinks.forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  /* ------------------------------------------------------------ reference */
  const endpoints = window.YATIVO_ENDPOINTS || [];
  const refList = $('#ref-list');
  const refSearch = $('#ref-search');
  const refChips = $('#ref-chips');
  const refCount = $('#ref-count');
  let refResource = 'all';
  let refExpanded = false;

  function pascal(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pathParams(path) { return (path.match(/\{(\w+)\}/g) || []).map((p) => p.slice(1, -1)); }
  function snake(s) { return s.replace(/([A-Z])/g, '_$1').toLowerCase(); }

  function callFor(e, lang) {
    const params = pathParams(e.path);
    const takes = e.kind === 'body' ? 'body' : e.kind === 'query' || e.kind === 'list' ? 'query' : '';
    switch (lang) {
      case 'python': {
        const args = params.map(snake);
        if (takes) args.push(takes === 'body' ? '**params' : '**filters');
        return 'yativo.' + e.py + '(' + args.join(', ') + ')';
      }
      case 'php': {
        const args = params.map((p) => '$' + p);
        if (takes) args.push(takes === 'body' ? '[...]' : '$filters');
        return '$yativo->' + e.resource + '->' + e.method + '(' + args.join(', ') + ')';
      }
      case 'laravel': {
        const args = params.map((p) => '$' + p);
        if (takes) args.push(takes === 'body' ? '[...]' : '$filters');
        return 'Yativo::' + e.resource + '()->' + e.method + '(' + args.join(', ') + ')';
      }
      case 'go': {
        const args = ['ctx'].concat(params);
        if (takes) args.push(takes === 'body' ? 'body' : 'yativo.Query{...}');
        return 'client.' + e.go + '(' + args.join(', ') + ')';
      }
      default: {
        const args = params.slice();
        if (takes) args.push(takes === 'body' ? '{ ... }' : 'filters');
        return 'yativo.' + e.resource + '.' + e.method + '(' + args.join(', ') + ')';
      }
    }
  }

  const resources = Array.from(new Set(endpoints.map((e) => e.resource)));
  ['all'].concat(resources).forEach((r) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (r === 'all' ? ' on' : '');
    b.textContent = r === 'all' ? 'All' : r;
    b.addEventListener('click', () => {
      refResource = r;
      refExpanded = r !== 'all';
      $$('.chip', refChips).forEach((c) => c.classList.toggle('on', c === b));
      renderReference();
    });
    refChips.appendChild(b);
  });

  function renderReference() {
    if (!refList) return;
    const q = (refSearch.value || '').trim().toLowerCase();
    const rows = endpoints.filter((e) => {
      if (refResource !== 'all' && e.resource !== refResource) return false;
      if (!q) return true;
      return (e.http + ' ' + e.path + ' ' + e.resource + ' ' + e.method + ' ' + e.doc + ' ' + e.py + ' ' + e.go).toLowerCase().includes(q);
    });
    const limit = refExpanded || q ? rows.length : 14;
    refList.innerHTML = '';
    rows.slice(0, limit).forEach((e, i) => {
      const row = document.createElement('div');
      row.className = 'ref-row';
      row.style.animationDelay = Math.min(i, 12) * 18 + 'ms';
      const verb = document.createElement('span');
      verb.className = 'verb ' + e.http;
      verb.textContent = e.http;
      const call = document.createElement('div');
      call.className = 'call';
      call.textContent = callFor(e, currentLang);
      const meta = document.createElement('div');
      meta.className = 'meta';
      const path = document.createElement('code');
      path.textContent = e.path;
      meta.append(path, document.createTextNode(' ' + e.doc));
      row.append(verb, call, meta);
      refList.appendChild(row);
    });
    refCount.textContent = rows.length + ' of ' + endpoints.length + ' endpoints';
    const more = $('#ref-more');
    more.hidden = rows.length <= limit;
    more.textContent = 'Show all ' + rows.length;
  }
  if (refSearch) {
    refSearch.addEventListener('input', renderReference);
    $('#ref-more').addEventListener('click', () => { refExpanded = true; renderReference(); });
  }

  /* ------------------------------------------------------------ site search */
  const searchBox = $('.search');
  const searchInput = $('#site-search');
  const searchResults = $('#search-results');
  const index = [];
  $$('main h2[id], main h3[id], main .doc-section[id]').forEach((el) => {
    const h = el.matches('.doc-section') ? $('h2', el) : el;
    if (!h) return;
    const section = el.closest('.doc-section');
    index.push({ id: el.id, title: h.textContent.replace(/^\d+\s*/, '').replace('#', '').trim(), where: section && section !== el ? $('h2', section).textContent.replace(/^\d+\s*/, '').trim() : 'Section' });
  });
  endpoints.forEach((e) => index.push({ id: 'reference', title: e.http + ' ' + e.path, where: e.doc, q: e.resource + ' ' + e.method }));
  let activeResult = -1;

  function runSearch() {
    const q = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    activeResult = -1;
    if (!q) { searchResults.classList.remove('open'); return; }
    const hits = index.filter((i) => (i.title + ' ' + i.where + ' ' + (i.q || '')).toLowerCase().includes(q)).slice(0, 12);
    if (!hits.length) {
      searchResults.innerHTML = '<div class="empty">No results</div>';
    }
    hits.forEach((h) => {
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.title;
      const small = document.createElement('small');
      small.textContent = h.where;
      a.appendChild(small);
      a.addEventListener('click', () => {
        searchResults.classList.remove('open');
        if (h.id === 'reference' && refSearch) { refSearch.value = h.title.split(' ')[1]; renderReference(); }
      });
      searchResults.appendChild(a);
    });
    searchResults.classList.add('open');
  }
  searchInput.addEventListener('input', runSearch);
  searchInput.addEventListener('keydown', (e) => {
    const links = $$('a', searchResults);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      activeResult = (activeResult + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach((l, i) => l.classList.toggle('active', i === activeResult));
    } else if (e.key === 'Enter' && links[Math.max(0, activeResult)]) {
      links[Math.max(0, activeResult)].click();
      location.hash = links[Math.max(0, activeResult)].getAttribute('href');
      searchInput.blur();
    } else if (e.key === 'Escape') {
      searchResults.classList.remove('open');
      searchInput.blur();
    }
  });
  document.addEventListener('click', (e) => { if (!searchBox.contains(e.target) && !e.target.closest('.search-toggle')) { searchResults.classList.remove('open'); searchBox.classList.remove('open'); } });
  document.addEventListener('keydown', (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      searchBox.classList.add('open');
      searchInput.focus();
    }
  });
  $('.search-toggle').addEventListener('click', () => { searchBox.classList.toggle('open'); if (searchBox.classList.contains('open')) searchInput.focus(); });

  /* ------------------------------------------------------------ heading anchors */
  $$('main h3[id]').forEach((h) => {
    const a = document.createElement('a');
    a.className = 'anchor';
    a.href = '#' + h.id;
    while (h.firstChild) a.appendChild(h.firstChild);
    h.appendChild(a);
  });

  /* ------------------------------------------------------------ finish */
  function layoutIndicators() {
    syncSeg();
    tabGroups.forEach((g) => {
      const on = $('button.on', g.tabs);
      moveIndicator(g.tabs, on, g.underline);
    });
  }
  window.addEventListener('resize', layoutIndicators);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutIndicators);
  renderReference();
  layoutIndicators();

  function highlightAll() { $$('.code pre').forEach(highlight); }
  if (window.Prism) highlightAll();
  else window.addEventListener('load', highlightAll);

  $('#year').textContent = new Date().getFullYear();
})();
