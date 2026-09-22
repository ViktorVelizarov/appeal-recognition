/* StyleStealer demo: illustrative sample output only, no network calls.
   Swap SAMPLES for the real detection + shopping API response when wiring the app.
   Sample photos: set data-src on each [data-sample] button and the stage will show it. */
(function () {
  var SAMPLES = [
    { id: 'IMG-0417', scene: 'Street / overcast', ms: 812, items: [
      { id: 'D-01', name: 'Camel wool trench coat', conf: 0.96, box: [22, 14, 44, 60], matches: [
        { kind: 'Same', shop: 'Maison Nord', item: 'Belted wool trench, camel', price: '$214' },
        { kind: 'Similar', shop: 'Threadline', item: 'Double-breasted trench', price: '$129' },
        { kind: 'Similar', shop: 'Halden & Rowe', item: 'Relaxed gabardine trench', price: '$158' } ] },
      { id: 'D-02', name: 'Black leather ankle boots', conf: 0.91, box: [34, 80, 28, 16], matches: [
        { kind: 'Same', shop: 'Fenwick Lane', item: 'Chelsea boot, black calf', price: '$176' },
        { kind: 'Similar', shop: 'Parcel', item: 'Lug-sole ankle boot', price: '$98' },
        { kind: 'Similar', shop: 'Outfit/Co', item: 'Leather Chelsea', price: '$84' } ] } ] },
    { id: 'IMG-0932', scene: 'Studio / denim', ms: 764, items: [
      { id: 'D-01', name: 'White boxy cotton tee', conf: 0.93, box: [30, 18, 38, 26], matches: [
        { kind: 'Same', shop: 'Parcel', item: 'Heavyweight boxy tee, white', price: '$42' },
        { kind: 'Similar', shop: 'Threadline', item: 'Oversized crew tee', price: '$28' },
        { kind: 'Similar', shop: 'Outfit/Co', item: 'Drop-shoulder tee', price: '$24' } ] },
      { id: 'D-02', name: 'Wide-leg indigo jeans', conf: 0.94, box: [28, 46, 44, 50], matches: [
        { kind: 'Same', shop: 'Halden & Rowe', item: 'Wide-leg rigid denim', price: '$138' },
        { kind: 'Similar', shop: 'Maison Nord', item: 'Straight indigo jean', price: '$119' },
        { kind: 'Similar', shop: 'Fenwick Lane', item: 'Barrel-leg jean', price: '$96' } ] } ] },
    { id: 'IMG-1208', scene: 'Cafe / knitwear', ms: 903, items: [
      { id: 'D-01', name: 'Cream cable-knit sweater', conf: 0.95, box: [24, 22, 46, 40], matches: [
        { kind: 'Same', shop: 'Fenwick Lane', item: 'Chunky cable crew, ecru', price: '$148' },
        { kind: 'Similar', shop: 'Maison Nord', item: 'Merino cable knit', price: '$132' },
        { kind: 'Similar', shop: 'Threadline', item: 'Fisherman sweater', price: '$79' } ] },
      { id: 'D-02', name: 'Tan leather crossbody', conf: 0.89, box: [62, 56, 22, 20], matches: [
        { kind: 'Same', shop: 'Outfit/Co', item: 'Saddle crossbody, tan', price: '$112' },
        { kind: 'Similar', shop: 'Parcel', item: 'Mini flap bag, cognac', price: '$68' },
        { kind: 'Similar', shop: 'Halden & Rowe', item: 'Leather camera bag', price: '$145' } ] } ] }
  ];

  var root = document.querySelector('[data-demo]');
  if (!root) return;
  var stage = root.querySelector('[data-stage]');
  var media = root.querySelector('[data-media]');
  var boxesEl = root.querySelector('[data-boxes]');
  var resultsEl = root.querySelector('[data-results]');
  var picks = root.querySelectorAll('[data-sample]');
  var outs = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-out]'), function (n) { outs[n.getAttribute('data-out')] = n; });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timer = null, current = -1;

  function set(k, v) { if (outs[k]) outs[k].textContent = v; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp() { var d = new Date(); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z'; }

  function hot(k, on) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-det="' + k + '"]'), function (n) { n.classList.toggle('is-hot', on); });
  }

  function render(i) {
    var s = SAMPLES[i];
    boxesEl.innerHTML = s.items.map(function (d, k) {
      var b = d.box;
      return '<div class="box" data-det="' + k + '" style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%">' +
        '<span class="box-tag">' + d.id + ' &middot; ' + d.conf.toFixed(2) + '</span>' +
        '<span class="box-xy">x' + b[0] + ' y' + b[1] + '</span></div>';
    }).join('');
    resultsEl.innerHTML = s.items.map(function (d, k) {
      return '<article class="det" data-det="' + k + '" tabindex="0">' +
        '<header class="det-head"><span class="det-id">' + d.id + '</span><h3 class="det-name">' + d.name + '</h3><span class="det-conf">' + d.conf.toFixed(2) + '</span></header>' +
        '<ul class="matches">' + d.matches.map(function (m) {
          return '<li class="match"><span class="m-kind">' + m.kind + '</span><span class="m-shop">' + m.shop + '</span><span class="m-item">' + m.item + '</span><span class="m-price">' + m.price + '</span>' +
            '<a class="m-buy" href="#demo" aria-label="Buy ' + m.item + ' at ' + m.shop + '">Buy &#8599;</a></li>';
        }).join('') + '</ul></article>';
    }).join('');
    Array.prototype.forEach.call(resultsEl.querySelectorAll('.det'), function (el) {
      var k = el.getAttribute('data-det');
      el.addEventListener('mouseenter', function () { hot(k, true); });
      el.addEventListener('mouseleave', function () { hot(k, false); });
      el.addEventListener('focus', function () { hot(k, true); });
      el.addEventListener('blur', function () { hot(k, false); });
    });
  }

  function select(i) {
    if (timer) clearTimeout(timer);
    current = i;
    var s = SAMPLES[i];
    Array.prototype.forEach.call(picks, function (p, n) { p.setAttribute('aria-pressed', n === i ? 'true' : 'false'); });
    var src = picks[i] && picks[i].getAttribute('data-src');
    if (media && src) media.style.backgroundImage = 'url(' + src + ')';
    stage.setAttribute('data-sample', i);
    root.setAttribute('data-state', 'scanning');
    boxesEl.innerHTML = '';
    resultsEl.innerHTML = '';
    set('id', s.id); set('scene', s.scene); set('status', 'Scanning'); set('count', '--'); set('latency', '--'); set('time', stamp());
    timer = setTimeout(function () {
      render(i);
      root.setAttribute('data-state', 'done');
      set('status', 'Sample result');
      set('count', s.items.length + ' items / ' + s.items.length * 3 + ' matches');
      set('latency', (s.ms / 1000).toFixed(2) + 's');
      set('time', stamp());
    }, reduce ? 0 : 1100);
  }

  Array.prototype.forEach.call(picks, function (p, i) { p.addEventListener('click', function () { select(i); }); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-cta]'), function (a) {
    a.addEventListener('click', function () { if (current < 0) select(0); });
  });
  root.setAttribute('data-state', 'idle');
  set('status', 'Idle'); set('time', stamp());
})();
