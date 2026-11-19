/* 阳光农场 — js/ui.js
 * HUD / DOM 层。经典脚本，挂载到 window.UI，不依赖 THREE。
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 常量                                                                */
  /* ------------------------------------------------------------------ */

  var SEED_KEYS = ['carrot', 'cabbage', 'tomato', 'wheat', 'cotton'];

  var LABELS = {
    coins: '金币',
    carrot: '胡萝卜',
    cabbage: '白菜',
    tomato: '番茄',
    wheat: '小麦',
    cotton: '棉花',
    egg: '鸡蛋',
    duckEgg: '鸭蛋',
    milk: '牛奶',
    flour: '面粉',
    cloth: '布料',
    butter: '黄油',
    cheese: '奶酪',
    cake: '蛋糕',
    seed_carrot: '胡萝卜种子',
    seed_cabbage: '白菜种子',
    seed_tomato: '番茄种子',
    seed_wheat: '小麦种子',
    seed_cotton: '棉花种子'
  };

  var NO_SEED_TEXT = '未选择';
  var TOAST_LIFE_MS = 2400;
  var TOAST_FADE_MS = 300;
  var TOAST_MAX = 5;
  var ZONE_BANNER_MS = 1600;

  /* ------------------------------------------------------------------ */
  /* DOM 小工具                                                          */
  /* ------------------------------------------------------------------ */

  function $(id) {
    return document.getElementById(id);
  }

  function firstId(ids) {
    for (var i = 0; i < ids.length; i++) {
      var el = $(ids[i]);
      if (el) return el;
    }
    return null;
  }

  function setText(el, text) {
    if (!el) return;
    var s = text == null ? '' : String(text);
    if (el.textContent !== s) el.textContent = s;
  }

  function computed(el) {
    try {
      return window.getComputedStyle(el);
    } catch (e) {
      return null;
    }
  }

  /** 显示元素：兼容 .hidden 类、hidden 属性、.show/.visible 类等多种 CSS 写法 */
  function show(el) {
    if (!el) return;
    el.classList.remove('hidden');
    el.removeAttribute('hidden');
    if (el.style.display === 'none') el.style.display = '';
    el.classList.add('show');
    el.classList.add('visible');
    el.setAttribute('aria-hidden', 'false');
    var cs = computed(el);
    if (cs) {
      if (cs.display === 'none') {
        el.style.display = el.getAttribute('data-ui-display') || 'block';
      }
      if (cs.visibility === 'hidden') {
        el.style.visibility = 'visible';
        el.__uiForcedVisibility = true;
      }
    }
  }

  /** 隐藏元素 */
  function hide(el) {
    if (!el) return;
    el.classList.remove('show');
    el.classList.remove('visible');
    el.classList.add('hidden');
    el.setAttribute('hidden', '');
    el.setAttribute('aria-hidden', 'true');
    if (el.__uiForcedVisibility) {
      el.style.visibility = '';
      el.__uiForcedVisibility = false;
    }
    var cs = computed(el);
    if (cs && cs.display !== 'none') {
      el.style.display = 'none';
    }
  }

  function setShown(el, visible) {
    if (visible) show(el);
    else hide(el);
  }

  function normalizeSeed(key) {
    if (key == null) return null;
    var s = String(key);
    if (s.indexOf('seed_') === 0) s = s.slice(5);
    return SEED_KEYS.indexOf(s) >= 0 ? s : null;
  }

  function hudParent() {
    return $('farm-hud') || document.body;
  }

  /* ------------------------------------------------------------------ */
  /* 兜底元素（HTML 缺失对应节点时自动创建，保证功能可用）                 */
  /* ------------------------------------------------------------------ */

  function createFallback(id, parent, cssText) {
    var el = document.createElement('div');
    el.id = id;
    el.setAttribute('data-ui-fallback', '1');
    el.style.cssText = cssText;
    (parent || document.body).appendChild(el);
    return el;
  }

  function getToastBox() {
    var box = $('toasts');
    if (!box && document.body) {
      box = createFallback(
        'toasts',
        document.body,
        'position:fixed;top:84px;left:50%;transform:translateX(-50%);z-index:60;' +
          'display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;'
      );
      box.setAttribute('data-ui-display', 'flex');
    }
    return box;
  }

  function getPromptEls() {
    var root = $('prompt');
    if (!root && document.body) {
      root = createFallback(
        'prompt',
        hudParent(),
        'position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:40;' +
          'padding:10px 16px;border-radius:14px;background:rgba(40,28,12,.78);color:#fff;' +
          'font-size:16px;text-align:center;pointer-events:none;display:none;'
      );
    }
    if (!root) return { root: null, key: null, text: null, sub: null };

    var key = $('prompt-key') || root.querySelector('.prompt-key, kbd, .key');
    var text = $('prompt-text') || root.querySelector('.prompt-text, .text');
    var sub = $('prompt-sub') || root.querySelector('.prompt-sub, .sub, small');

    if (!key) {
      key = document.createElement('kbd');
      key.id = 'prompt-key';
      key.style.cssText =
        'display:inline-block;min-width:24px;margin-right:8px;padding:2px 8px;border-radius:6px;' +
        'background:#ffd75e;color:#4a3210;font-weight:700;font-family:inherit;';
      root.insertBefore(key, root.firstChild);
    }
    if (!text) {
      text = document.createElement('span');
      text.id = 'prompt-text';
      root.appendChild(text);
    }
    if (!sub) {
      sub = document.createElement('small');
      sub.id = 'prompt-sub';
      sub.style.cssText = 'display:block;margin-top:4px;opacity:.8;font-size:12px;';
      root.appendChild(sub);
    }
    return { root: root, key: key, text: text, sub: sub };
  }

  // ---------- small shared helpers ----------
  function pickEl() {
    for (var i = 0; i < arguments.length; i++) {
      var el = $(arguments[i]);
      if (el) return el;
    }
    return null;
  }

  function setVis(el, on, disp) {
    if (!el) return;
    if (on) {
      el.hidden = false;
      el.classList.remove('hidden');
      el.style.display = '';
      if (window.getComputedStyle(el).display === 'none') {
        el.style.display = el.getAttribute('data-ui-display') || disp || 'block';
      }
    } else {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  }

  // ---------- prompt ----------
  function showPrompt(text, key, sub) {
    var els = getPromptEls();
    if (!els.root) return;
    if (text && typeof text === 'object') {
      sub = text.sub; key = text.key; text = text.text;
    } else if (typeof text === 'string' && typeof key === 'string' &&
               text.length <= 3 && key.length > 3) {
      var t = text; text = key; key = t; // called as (key, text)
    }
    els.text.textContent = text == null ? '' : String(text);
    els.key.textContent = key ? String(key) : '';
    els.key.style.display = key ? '' : 'none';
    els.sub.textContent = sub ? String(sub) : '';
    els.sub.style.display = sub ? '' : 'none';
    setVis(els.root, true);
  }

  function hidePrompt() {
    setVis($('prompt'), false);
  }

  // ---------- toasts ----------
  function toast(msg, ms) {
    var box = $('toasts');
    if (!box) return null;
    var kind = 'info';
    if (typeof ms === 'string') {
      if (ms === 'good' || ms === 'bad' || ms === 'info') { kind = ms; ms = TOAST_LIFE_MS; }
    }
    var el = document.createElement('div');
    el.className = 'toast toast-' + kind + ' ' + kind;
    el.textContent = String(msg);
    if (box.getAttribute('data-ui-display') === 'flex') {
      el.style.cssText =
        'padding:8px 16px;border-radius:12px;background:rgba(40,28,12,.82);color:#fff;font-size:15px;';
    }
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    box.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; });
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, ms || TOAST_LIFE_MS);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    return el;
  }

  // ---------- progress ----------
  var progRaf = 0;
  var progResolve = null;

  function endProgress(result) {
    if (progRaf) cancelAnimationFrame(progRaf);
    progRaf = 0;
    setVis(pickEl('progress', 'progress-wrap'), false);
    var r = progResolve;
    progResolve = null;
    if (r) r(result);
  }

  function showProgress(label, ms) {
    if (label && typeof label === 'object') { ms = label.duration || label.ms; label = label.label || label.text; }
    endProgress(false);
    var root = pickEl('progress', 'progress-wrap');
    var fill = pickEl('progress-fill', 'progress-bar');
    var lab = pickEl('progress-label', 'progress-text');
    var dur = Math.max(1, ms || 1000);
    if (lab) lab.textContent = label || '';
    if (fill) fill.style.width = '0%';
    setVis(root, true);
    return new Promise(function (resolve) {
      progResolve = resolve;
      var t0 = performance.now();
      (function step() {
        var p = Math.min(1, (performance.now() - t0) / dur);
        if (fill) fill.style.width = (p * 100).toFixed(1) + '%';
        if (p >= 1) endProgress(true);
        else progRaf = requestAnimationFrame(step);
      })();
    });
  }

  function hideProgress() {
    endProgress(false);
  }

  // ---------- zone banner / pointer hint ----------
  var bannerTimer = 0;

  function showZoneBanner(title, sub, ms) {
    var root = pickEl('zone-banner', 'banner');
    if (!root) return;
    var t = pickEl('zone-banner-title', 'zone-title') || root.querySelector('.title, h2');
    var s = pickEl('zone-banner-sub', 'zone-sub') || root.querySelector('.sub, small, p');
    if (t) t.textContent = title || '';
    else root.textContent = title || '';
    if (s) { s.textContent = sub || ''; s.style.display = sub ? '' : 'none'; }
    setVis(root, true);
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function () { setVis(root, false); }, ms || ZONE_BANNER_MS);
  }

  function setPointerHint(v, text) {
    var el = pickEl('pointer-hint', 'pointerhint');
    if (!el) return;
    if (typeof v === 'string') { text = v; v = true; }
    if (text != null) el.textContent = text;
    setVis(el, !!v);
  }

  // ---------- start screen ----------
  var startCbs = [];
  var startBound = false;

  function startRoot() { return pickEl('start-screen', 'start', 'start-overlay'); }

  function bindStartBtn() {
    if (startBound) return;
    var root = startRoot();
    var btn = pickEl('start-btn', 'btn-start', 'start-button') || (root && root.querySelector('button'));
    if (!btn) return;
    startBound = true;
    btn.addEventListener('click', function (e) {
      for (var i = 0; i < startCbs.length; i++) {
        try { startCbs[i](e); } catch (err) { console.error(err); }
      }
    });
  }

  function showStart() { bindStartBtn(); setVis(startRoot(), true, 'flex'); }
  function hideStart() { setVis(startRoot(), false); }

  function setStartStatus(text, isError) {
    var el = pickEl('start-status', 'status');
    if (!el) return;
    el.textContent = text == null ? '' : String(text);
    el.classList.toggle('error', !!isError);
  }

  function onStart(cb) {
    if (typeof cb === 'function') startCbs.push(cb);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindStartBtn);
    else bindStartBtn();
  }

  // ---------- farm hud / cake root ----------
  function showFarmHud() { setVis(pickEl('farm-hud', 'farmhud'), true); }
  function hideFarmHud() { setVis(pickEl('farm-hud', 'farmhud'), false); }
  function showCakeRoot() { setVis(pickEl('cake-root', 'cake'), true); }
  function hideCakeRoot() { setVis(pickEl('cake-root', 'cake'), false); }

  // ---------- seed / zone / inventory (contract) ----------
  var selectedSeed = null;

  function setSelectedSeed(cropKey) {
    cropKey = normalizeSeed(cropKey);
    selectedSeed = cropKey;
    var label = cropKey ? (LABELS[cropKey] || cropKey) : NO_SEED_TEXT;
    setText($('hud-seed'), label);
    var bar = pickEl('seed-bar', 'seedbar', 'seeds');
    if (bar) {
      var items = bar.querySelectorAll('[data-seed]');
      for (var i = 0; i < items.length; i++) {
        var on = cropKey && items[i].getAttribute('data-seed') === String(cropKey);
        items[i].classList.toggle('selected', !!on);
        items[i].classList.toggle('active', !!on);
      }
    }
    if (window.Game) Game.selectedSeed = cropKey;
  }

  function setZone(name) {
    setText($('hud-zone'), name || '');
  }

  function refresh(invObj) {
    invObj = invObj || {};
    var nodes = document.querySelectorAll('[data-count]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-count');
      setText(nodes[i], String(invObj[key] || 0));
    }
    var seed = (window.Game && Game.selectedSeed) || selectedSeed;
    setSelectedSeed(seed);
  }

  function init() {
    bindStartBtn();
    return api;
  }

  // ---------- seed bar ----------
  function bindSeedBar(cb) {
    var bar = pickEl('seed-bar', 'seedbar', 'seeds');
    function select(seed, silent) {
      setSelectedSeed(seed);
      if (!silent && typeof cb === 'function') cb(seed);
    }
    if (bar && !bar._uiBound) {
      bar._uiBound = true;
      bar.addEventListener('click', function (e) {
        var item = e.target.closest ? e.target.closest('[data-seed]') : null;
        if (item && bar.contains(item)) select(item.getAttribute('data-seed'));
      });
    }
    return select;
  }

  // ---------- public API ----------
  var api = {
    $: $,
    init: init,
    refresh: refresh,
    setSelectedSeed: setSelectedSeed,
    setZone: setZone,
    showPrompt: showPrompt,
    hidePrompt: hidePrompt,
    toast: toast,
    showProgress: showProgress,
    hideProgress: hideProgress,
    showZoneBanner: showZoneBanner,
    setPointerHint: setPointerHint,
    showStart: showStart,
    hideStart: hideStart,
    showFarmHud: showFarmHud,
    hideFarmHud: hideFarmHud,
    showCakeRoot: showCakeRoot,
    hideCakeRoot: hideCakeRoot,
    setStartStatus: setStartStatus,
    onStart: onStart,
    bindSeedBar: bindSeedBar
  };
  Object.defineProperty(api, 'selectedSeed', {
    get: function () { return selectedSeed; },
    set: function (v) { setSelectedSeed(v); }
  });

  window.UI = api;
})();
