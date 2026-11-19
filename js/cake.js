function buildBakeryScene(THREE){
  THREE = THREE || window.THREE;
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfff1e6);

  function box(w, h, d, color, x, y, z, parent){
    var mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({color: color, roughness: 0.85})
    );
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    (parent || scene).add(mesh);
    return mesh;
  }

  // Room: floor, 3 walls, ceiling (front left open for the camera)
  box(10, 0.2, 10, 0xf3d9c4, 0, -0.1, 0).name = 'floor';
  box(10, 5, 0.2, 0xffd9e3, 0, 2.5, -5).name = 'wallBack';
  box(0.2, 5, 10, 0xd9f0e6, -5, 2.5, 0).name = 'wallLeft';
  box(0.2, 5, 10, 0xd9f0e6, 5, 2.5, 0).name = 'wallRight';
  box(10, 0.2, 10, 0xfffaf2, 0, 5.1, 0).name = 'ceiling';

  // Warm lighting
  var hemi = new THREE.HemisphereLight(0xfff4e0, 0xe0b890, 0.9);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffe2b8, 0.9);
  sun.position.set(2.5, 4.5, 3);
  sun.castShadow = true;
  scene.add(sun);

  // Wooden counter (body + top slab), top surface at y = 1.08
  var counter = new THREE.Group();
  counter.name = 'counter';
  box(4.4, 1.0, 1.6, 0x9c6b3f, 0, 0.5, 0, counter).castShadow = true;
  box(4.7, 0.08, 1.9, 0xb98455, 0, 1.04, 0, counter).castShadow = true;
  scene.add(counter);

  // Cake group sits on the counter, origin at the plate
  var cakeGroup = new THREE.Group();
  cakeGroup.name = 'cakeGroup';
  cakeGroup.position.set(0, 1.08, 0);
  scene.add(cakeGroup);

  var plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.75, 0.05, 48),
    new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.3})
  );
  plate.name = 'plate';
  plate.position.y = 0.025;
  plate.receiveShadow = true;
  cakeGroup.add(plate);

  var aspect = (window.innerWidth || 1) / (window.innerHeight || 1);
  var camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
  camera.position.set(0, 2.2, 4.2);
  camera.lookAt(0, 1.4, 0);

  return {scene: scene, camera: camera, cakeGroup: cakeGroup, counter: counter};
}

function updateCakeVisual(THREE, cakeGroup, current){
  THREE = THREE || window.THREE;
  current = current || {};
  var i, j, child;

  // Clear everything except the plate
  for (i = cakeGroup.children.length - 1; i >= 0; i--){
    child = cakeGroup.children[i];
    if (child.name === 'plate') continue;
    cakeGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  }

  // Create the plate if missing
  if (!cakeGroup.getObjectByName('plate')){
    var plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.75, 0.05, 48),
      new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.3})
    );
    plate.name = 'plate';
    plate.position.y = 0.025;
    plate.receiveShadow = true;
    cakeGroup.add(plate);
  }

  function add(geometry, color, x, y, z, name){
    var mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({color: color, roughness: 0.6})
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;
    cakeGroup.add(mesh);
    return mesh;
  }

  var baseColors = {vanilla: 0xf6e2a2, chocolate: 0x5a3320, matcha: 0x88c050};
  var fillingColors = {strawberry: 0xff8fa3, cream: 0xfffbf0, chocolate: 0x3e2214, cheese: 0xffd45e};
  var toppingDefs = {
    strawberry:  {shape: 'sphere', color: 0xe8334a, size: 0.09, count: 6},
    cherry:      {shape: 'sphere', color: 0xb00020, size: 0.07, count: 6},
    tomato:      {shape: 'sphere', color: 0xff6347, size: 0.08, count: 6},
    creamFlower: {shape: 'cone',   color: 0xfffdf5, size: 0.09, count: 6},
    berry:       {shape: 'sphere', color: 0x4b3f9e, size: 0.05, count: 8},
    chocoChips:  {shape: 'box',    color: 0x2e1a0f, size: 0.05, count: 10}
  };

  var topY = 0.05; // top surface of the plate

  if (current.base && baseColors[current.base] !== undefined){
    add(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 40), baseColors[current.base], 0, topY + 0.2, 0, 'base');
    topY += 0.4;
  }

  if (current.filling && fillingColors[current.filling] !== undefined){
    add(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 40), fillingColors[current.filling], 0, topY + 0.05, 0, 'filling');
    topY += 0.1;
  }

  // Toppings: each type forms a ring of pieces around the top
  var toppings = current.toppings || [];
  for (i = 0; i < toppings.length; i++){
    var def = toppingDefs[toppings[i]];
    if (!def) continue;
    var radius = 0.48 - (i % 3) * 0.16;
    for (j = 0; j < def.count; j++){
      var angle = (j / def.count + i * 0.07) * Math.PI * 2;
      var x = Math.cos(angle) * radius;
      var z = Math.sin(angle) * radius;
      var geo, y;
      if (def.shape === 'cone'){
        geo = new THREE.ConeGeometry(def.size, def.size * 1.4, 12);
        y = topY + def.size * 0.7;
      } else if (def.shape === 'box'){
        geo = new THREE.BoxGeometry(def.size, def.size, def.size);
        y = topY + def.size * 0.5;
      } else {
        geo = new THREE.SphereGeometry(def.size, 16, 12);
        y = topY + def.size * 0.8;
      }
      var piece = add(geo, def.color, x, y, z, 'topping_' + toppings[i]);
      piece.rotation.y = angle;
    }
  }

  return cakeGroup;
}

(function(){
  'use strict';
  var THREE, renderer, inv, hooks, scene, camera, cakeGroup, running=false, paused=false, bound=false, timer=55, served=0, totalScore=0, order=null, current=null, escHandler=null, msgTimer=null;

  var BASES = {vanilla:{name:'香草胚'}, chocolate:{name:'巧克力胚'}, matcha:{name:'抹茶胚'}};
  var FILLINGS = {strawberry:{name:'草莓酱'}, cream:{name:'奶油'}, chocolate:{name:'巧克力酱'}, cheese:{name:'奶酪', cost:'cheese'}};
  var TOPPINGS = {strawberry:{name:'草莓'}, creamFlower:{name:'奶油花', cost:'butter'}, berry:{name:'浆果'}, chocoChips:{name:'巧克力碎'}, cherry:{name:'樱桃'}, tomato:{name:'番茄'}};
  var CUSTOMERS = [{name:'小美', face:'👧'},{name:'阿强', face:'🧑'},{name:'奶奶', face:'👵'},{name:'乐乐', face:'🧒'},{name:'厨师', face:'👩‍🍳'}];
  var COST_NAMES = {cheese:'奶酪', butter:'黄油'};
  var STEPS = ['base','filling','toppings'];

  function $(id){ return document.getElementById(id); }
  function show(el, on){ if(el) el.classList.toggle('hidden', !on); }
  function txt(id, v){ var el=$(id); if(el) el.textContent=String(v); }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  function has(k){ return (inv[k]||0)>=1; }
  function nameOf(map, k){ return k && map[k] ? map[k].name : '—'; }
  function names(list){ return list && list.length ? list.map(function(t){ return TOPPINGS[t].name; }).join('、') : '—'; }
  function mark(ok){ return ok ? '✓' : '✗'; }
  // only offer options whose extra ingredient the player actually owns
  function avail(map){ return Object.keys(map).filter(function(k){ var c=map[k].cost; return !c || has(c); }); }

  function sync(){
    if(!current) return;
    txt('cake-cur-base', nameOf(BASES, current.base));
    txt('cake-cur-filling', nameOf(FILLINGS, current.filling));
    txt('cake-cur-toppings', names(current.toppings));
    if(cakeGroup) updateCakeVisual(THREE, cakeGroup, current);
    var activeSet=false;
    STEPS.forEach(function(s){
      var el=$('cake-step-'+s), done = s==='toppings' ? current.toppings.length>0 : !!current[s];
      if(el){ el.classList.toggle('done', done); el.classList.toggle('active', !done && !activeSet); }
      if(!done) activeSet=true;
    });
    document.querySelectorAll('[data-station][data-value]').forEach(function(btn){
      var st=btn.getAttribute('data-station'), v=btn.getAttribute('data-value');
      var sel = st==='base' ? current.base===v : st==='filling' ? current.filling===v : current.toppings.indexOf(v)>=0;
      btn.classList.toggle('selected', sel);
    });
  }

  function newOrder(){
    var tops=avail(TOPPINGS).sort(function(){ return Math.random()-0.5; }).slice(0, 1+Math.floor(Math.random()*2));
    order={base:pick(Object.keys(BASES)), filling:pick(avail(FILLINGS)), toppings:tops, customer:pick(CUSTOMERS), no:served+1};
    timer=55;
    current={base:null, filling:null, toppings:[]};
    txt('cake-order-no', '#'+order.no);
    txt('cake-customer-face', order.customer.face);
    txt('cake-customer-name', order.customer.name);
    txt('cake-order-text', '我想要一个'+BASES[order.base].name+'蛋糕，夹'+FILLINGS[order.filling].name+'，上面放'+names(order.toppings)+'。');
    txt('cake-req-base', BASES[order.base].name);
    txt('cake-req-filling', FILLINGS[order.filling].name);
    txt('cake-req-toppings', names(order.toppings));
    txt('cake-order-reward', '~18');
    txt('cake-timer', 55);
    var fill=$('cake-timer-fill'); if(fill) fill.style.width='100%';
    show($('cake-result'), false); show($('cake-pause'), false); show($('cake-msg'), false);
    sync();
  }

  function msg(text){
    var el=$('cake-msg'); if(!el) return;
    el.textContent=text; show(el,true);
    clearTimeout(msgTimer);
    msgTimer=setTimeout(function(){ show(el,false); }, 2000);
  }

  function choose(station, value){
    if(!current) return;
    var cost, old, i;
    if(station==='base'){
      if(!BASES[value]) return;
      if(!current.base){ // ingredients are paid once per cake; switching flavour is free
        if(!has('flour') || !(has('egg')||has('duckEgg')) || !has('milk')) return msg('材料不足：需要面粉、蛋、牛奶');
        inv.flour--; inv.milk--;
        if(has('egg')) inv.egg--; else inv.duckEgg--;
      }
      current.base=value;
    } else if(station==='filling'){
      if(!FILLINGS[value] || current.filling===value) return;
      cost=FILLINGS[value].cost;
      if(cost && !has(cost)) return msg('材料不足：缺少'+(COST_NAMES[cost]||cost));
      if(cost) inv[cost]--;
      old=current.filling && FILLINGS[current.filling].cost;
      if(old) inv[old]=(inv[old]||0)+1;
      current.filling=value;
    } else {
      if(!TOPPINGS[value]) return;
      cost=TOPPINGS[value].cost; i=current.toppings.indexOf(value);
      if(i>=0){ current.toppings.splice(i,1); if(cost) inv[cost]=(inv[cost]||0)+1; }
      else {
        if(cost && !has(cost)) return msg('材料不足：缺少'+(COST_NAMES[cost]||cost));
        if(cost) inv[cost]--;
        current.toppings.push(value);
      }
    }
    if(window.UI && UI.refresh) UI.refresh(inv);
    sync();
  }

  function serve(){
    if(!order) return;
    var acc=0, n=0;
    n++; if(current.base===order.base) acc++;
    n++; if(current.filling===order.filling) acc++;
    var want=order.toppings.slice().sort(), got=(current.toppings||[]).slice().sort(), o=0;
    // partial credit; extra unwanted toppings lower the score instead of counting as perfect
    n++; want.forEach(function(t){ if(got.indexOf(t)>=0) o++; });
    acc += o/Math.max(want.length, got.length, 1);
    var accuracy=acc/n;
    var timeBonus=Math.floor(Math.max(timer,0)/10);
    var coins=8+Math.round(10*accuracy)+timeBonus;
    inv.coins=(inv.coins||0)+coins; inv.cake=(inv.cake||0)+1;
    served++; totalScore += Math.round(accuracy*100);
    if(hooks && hooks.onEarn) hooks.onEarn(coins);
    if(window.UI && UI.refresh) UI.refresh(inv);
    var stars = accuracy>=0.99 ? 3 : accuracy>=0.6 ? 2 : accuracy>0 ? 1 : 0;
    txt('cake-result-title', ['没做成…','再接再厉','还不错！','完美蛋糕！'][stars]);
    txt('cake-result-stars', ['☆☆☆','★☆☆','★★☆','★★★'][stars]);
    txt('cake-result-text', order.customer.face+' '+order.customer.name+'：'+['这不是我点的呀…','嗯…和我想要的不太一样。','挺好吃的，谢谢！','太棒了，就是这个味道！'][stars]);
    txt('cake-result-base', mark(current.base===order.base)+' '+nameOf(BASES, current.base));
    txt('cake-result-filling', mark(current.filling===order.filling)+' '+nameOf(FILLINGS, current.filling));
    txt('cake-result-toppings', mark(want.join()===got.join())+' '+names(current.toppings));
    txt('cake-result-time', Math.ceil(Math.max(timer,0))+' 秒 (+'+timeBonus+')');
    txt('cake-result-score', Math.round(accuracy*100)+'%');
    txt('cake-result-coins', '+'+coins);
    txt('cake-score', totalScore); txt('cake-served', served);
    show($('cake-pause'), false); show($('cake-result'), true);
    running=false;
  }

  function bind(){
    if(bound) return; bound=true;
    document.querySelectorAll('[data-station][data-value]').forEach(function(btn){
      btn.addEventListener('click', function(){ if(!running||paused) return; choose(btn.getAttribute('data-station'), btn.getAttribute('data-value')); });
    });
    function on(id, fn){ var el=$(id); if(el) el.addEventListener('click', fn); }
    on('btn-cake-serve', function(){ if(running&&!paused) serve(); });
    on('btn-cake-reset', function(){ current={base:null,filling:null,toppings:[]}; sync(); });
    on('btn-cake-pause', function(){ if(running){ paused=true; show($('cake-pause'), true);} });
    on('btn-cake-resume', function(){ paused=false; show($('cake-pause'), false); });
    function leave(){ stop(); if(hooks&&hooks.onReturn) hooks.onReturn(); }
    on('btn-cake-return', leave);
    on('btn-cake-result-return', leave);
    on('btn-cake-next', function(){ show($('cake-result'), false); running=true; paused=false; newOrder(); });
    escHandler=function(e){ if(e.key==='Escape' && running){ paused=!paused; show($('cake-pause'), paused);} };
    document.addEventListener('keydown', escHandler);
  }

  function start(r, inventory, opts){
    THREE=window.THREE; renderer=r; inv=inventory; hooks=opts||{};
    if(!scene){ var built=buildBakeryScene(THREE); scene=built.scene; camera=built.camera; cakeGroup=built.cakeGroup; }
    bind();
    served=served||0; totalScore=totalScore||0;
    if(window.UI){ if(UI.showCakeRoot) UI.showCakeRoot(); if(UI.hideFarmHud) UI.hideFarmHud(); if(UI.refresh) UI.refresh(inv); }
    show($('cake-result'), false); show($('cake-pause'), false);
    running=true; paused=false; newOrder();
  }
  function stop(){ running=false; paused=false; if(window.UI && UI.hideCakeRoot) UI.hideCakeRoot(); show($('cake-pause'), false); }
  function update(dt){
    if(!running||paused) return;
    timer-=dt; if(timer<0) timer=0;
    var t=$('cake-timer'); if(t) t.textContent=String(Math.ceil(timer));
    var fill=$('cake-timer-fill'); if(fill) fill.style.width=(timer/55*100)+'%';
    if($('cake-score')) $('cake-score').textContent=String(totalScore);
    if($('cake-served')) $('cake-served').textContent=String(served);
    if(cakeGroup) cakeGroup.rotation.y += dt*0.35;
    if(timer<=0) serve();
  }

  window.CakeGame = {
    start:start, stop:stop, update:update,
    get scene(){ return scene; }, get camera(){ return camera; }
  };
})();
