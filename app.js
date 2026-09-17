(function () {
  'use strict';

  var data = window.DASHBOARD_DATA;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ---------- formatting ----------

  function compact(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e4) return Math.round(n / 1e3) + 'K';
    return n.toLocaleString('en-US');
  }

  function format(value, kind) {
    if (kind === 'currency') return '$' + compact(value);
    if (kind === 'percent') return value.toFixed(1) + '%';
    return compact(value);
  }

  function money(n) {
    return '$' + n.toLocaleString('en-US');
  }

  // ---------- stat tiles ----------

  function renderMetrics() {
    Object.keys(data.metrics).forEach(function (key) {
      var el = document.querySelector('[data-metric="' + key + '"]');
      if (!el) return;
      var m = data.metrics[key];
      el.textContent = format(m.value, m.format);
    });
  }

  // ---------- chart ----------

  var W = 720;
  var H = 260;
  var PAD = { top: 16, right: 8, bottom: 28, left: 44 };
  var BAR_MAX = 24;   // cap bar thickness; leftover band is air
  var BAR_GAP = 2;    // surface gap between adjacent bars
  var RADIUS = 4;     // rounded data-end, square at the baseline

  function el(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (k) {
      node.setAttribute(k, attrs[k]);
    });
    return node;
  }

  // A bar rounded only at the top two corners, anchored square to the baseline.
  function barPath(x, y, w, h) {
    var r = Math.min(RADIUS, w / 2, h);
    return 'M' + x + ',' + (y + h) +
           'V' + (y + r) +
           'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + -r +
           'H' + (x + w - r) +
           'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r +
           'V' + (y + h) + 'Z';
  }

  function niceMax(value) {
    var mag = Math.pow(10, Math.floor(Math.log10(value)));
    return Math.ceil(value / mag) * mag;
  }

  function renderChart() {
    var host = document.getElementById('chart');
    var series = data.revenueByMonth;
    if (!host || !series.length) return;

    var plotW = W - PAD.left - PAD.right;
    var plotH = H - PAD.top - PAD.bottom;
    var baseY = PAD.top + plotH;
    var max = niceMax(Math.max.apply(null, series.map(function (d) { return d.value; })));

    var band = plotW / series.length;
    var barW = Math.min(BAR_MAX, band - BAR_GAP);
    var peak = series.reduce(function (a, b) { return b.value > a.value ? b : a; });

    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      role: 'img',
      'aria-label': 'Monthly revenue for the last 12 months, ' +
        series[0].month + ' through ' + series[series.length - 1].month +
        '. Peak ' + peak.month + ' at ' + money(peak.value) + '.'
    });

    // Gridlines + y ticks — recessive, hairline, solid.
    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
      var y = baseY - t * plotH;
      svg.appendChild(el('line', {
        class: t === 0 ? 'axis-line' : 'gridline',
        x1: PAD.left, x2: W - PAD.right, y1: y, y2: y
      }));
      var tick = el('text', {
        class: 'tick', x: PAD.left - 8, y: y + 4, 'text-anchor': 'end'
      });
      tick.textContent = '$' + compact(max * t);
      svg.appendChild(tick);
    });

    var tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    host.appendChild(tooltip);

    function showTip(d, cx, top, bar) {
      host.classList.add('has-hover');
      svg.querySelectorAll('.bar.active').forEach(function (b) { b.classList.remove('active'); });
      bar.classList.add('active');
      tooltip.innerHTML = '<span class="tip-label">' + d.month + '</span><br><b>' + money(d.value) + '</b>';
      tooltip.style.left = (cx / W * 100) + '%';
      tooltip.style.top = (top / H * 100) + '%';
      tooltip.classList.add('visible');
    }

    function hideTip() {
      host.classList.remove('has-hover');
      svg.querySelectorAll('.bar.active').forEach(function (b) { b.classList.remove('active'); });
      tooltip.classList.remove('visible');
    }

    series.forEach(function (d, i) {
      var h = (d.value / max) * plotH;
      var x = PAD.left + i * band + (band - barW) / 2;
      var y = baseY - h;
      var cx = x + barW / 2;

      var bar = el('path', { class: 'bar', d: barPath(x, y, barW, h) });

      // Hit target spans the whole band and the full plot height, not just the mark.
      var hit = el('rect', {
        class: 'bar-hit',
        x: PAD.left + i * band, y: PAD.top,
        width: band, height: plotH,
        tabindex: '0', role: 'button',
        'aria-label': d.month + ': ' + money(d.value)
      });

      hit.addEventListener('mouseenter', function () { showTip(d, cx, y - 8, bar); });
      hit.addEventListener('focus', function () { showTip(d, cx, y - 8, bar); });
      hit.addEventListener('mouseleave', hideTip);
      hit.addEventListener('blur', hideTip);

      svg.appendChild(bar);
      svg.appendChild(hit);

      // Selective direct labels only — first, last, and peak. Never every point.
      if (i === 0 || i === series.length - 1 || d === peak) {
        var label = el('text', {
          class: 'bar-label', x: cx, y: y - 7, 'text-anchor': 'middle'
        });
        label.textContent = '$' + compact(d.value);
        svg.appendChild(label);
      }

      var month = el('text', {
        class: 'tick', x: cx, y: baseY + 16, 'text-anchor': 'middle'
      });
      month.textContent = d.month;
      svg.appendChild(month);
    });

    svg.addEventListener('mouseleave', hideTip);
    host.insertBefore(svg, tooltip);
  }

  // ---------- activity table ----------

  function renderActivity() {
    var body = document.getElementById('activity');
    if (!body) return;

    data.activity.forEach(function (row) {
      var tr = document.createElement('tr');

      var customer = document.createElement('td');
      customer.textContent = row.customer;

      var event = document.createElement('td');
      event.textContent = row.event;

      var amount = document.createElement('td');
      amount.className = 'num';
      amount.textContent = money(row.amount);

      var status = document.createElement('td');
      var pill = document.createElement('span');
      pill.className = 'pill ' + row.status;
      pill.textContent = row.status.charAt(0).toUpperCase() + row.status.slice(1);
      status.appendChild(pill);

      [customer, event, amount, status].forEach(function (td) { tr.appendChild(td); });
      body.appendChild(tr);
    });
  }

  // ---------- theme toggle ----------

  function setupTheme() {
    var button = document.getElementById('theme-toggle');
    if (!button) return;
    var icon = button.querySelector('[data-theme-icon]');

    function currentlyDark() {
      var stamped = document.documentElement.getAttribute('data-theme');
      if (stamped) return stamped === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function sync() {
      icon.textContent = currentlyDark() ? 'Light' : 'Dark';
    }

    var saved = null;
    try { saved = localStorage.getItem('dashboard-theme'); } catch (e) { /* private mode */ }
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    }
    sync();

    button.addEventListener('click', function () {
      var next = currentlyDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('dashboard-theme', next); } catch (e) { /* ignore */ }
      sync();
    });
  }

  // ---------- sign out ----------

  function setupSignOut() {
    var button = document.getElementById('sign-out');
    if (!button) return;

    // No session to tear down yet — the sign-in is simulated. When a real one
    // lands, clear it here before navigating.
    button.addEventListener('click', function () {
      window.location.assign('index.html');
    });
  }

  renderMetrics();
  renderChart();
  renderActivity();
  setupTheme();
  setupSignOut();
})();
