(function(){
  'use strict';

  function boot(){
    var THREE = window.THREE;
    var status = function(t){ if (window.UI && UI.setStartStatus) UI.setStartStatus(t); };
    if (!THREE){ status('无法加载 3D 引擎（THREE 缺失）'); return; }
    var canvas = document.getElementById('game');
    if (!canvas){ status('缺少画布'); return; }

    // Make sure every required module is present before touching it
    var need = ['World','Player','UI','Systems'];
    for (var i=0; i<need.length; i++){
      if (!window[need[i]]){ status('模块缺失：' + need[i]); return; }
    }
    var Game = window.Game = window.Game || {};
    if (!Game.inv) Game.inv = {};
    if (!Game.mode) Game.mode = 'start';

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true });
    } catch (err){
      status('无法初始化 WebGL，请更换浏览器或开启硬件加速');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.setSize(window.innerWidth, Math.max(window.innerHeight,1), false);
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    if (THREE.PCFSoftShadowMap) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); }, false);

    var farmScene = new THREE.Scene();
    var farmCamera = new THREE.PerspectiveCamera(55, window.innerWidth/Math.max(window.innerHeight,1), 0.1, 400);

    var world, farmer, controller;
    try {
      world = window.World.createWorld(THREE, farmScene) || {};
      farmer = window.Player.createFarmer(THREE);
      farmScene.add(farmer);
      if (world.spawn) farmer.position.set(world.spawn.x, world.spawn.y||0, world.spawn.z);

      controller = window.Player.createController({
        THREE:THREE, renderer:renderer, camera:farmCamera, farmer:farmer,
        getColliders: function(){ return world.colliders || []; },
        onInteract: function(){ if (window.Systems && Game.mode==='farm') Systems.tryInteract(); },
        isEnabled: function(){ return Game.mode==='farm'; }
      });
      if (world.spawn && controller.setPosition) controller.setPosition(world.spawn.x, world.spawn.y||0, world.spawn.z);

      window.UI.init();
      window.Systems.init(world, controller, window.UI);
    } catch (err2){
      if (window.console) console.error(err2);
      status('农场初始化失败：' + (err2 && err2.message ? err2.message : err2));
      return;
    }

    function refreshUI(){ if (window.UI && UI.refresh) UI.refresh(Game.inv); }

    Game.enterCake = function(){
      if (Game.mode !== 'farm' || !window.CakeGame) return;
      if (controller.setEnabled) controller.setEnabled(false);
      if (document.exitPointerLock) document.exitPointerLock();
      Game.mode = 'cake';
      window.UI.hideFarmHud(); window.UI.showCakeRoot();
      try {
        window.CakeGame.start(renderer, Game.inv, {
          onReturn: function(){ Game.exitCake(); },
          onEarn: refreshUI
        });
        onResize();
      } catch (err){
        if (window.console) console.error(err);
        Game.exitCake();
      }
    };

    Game.exitCake = function(){
      if (Game.mode !== 'cake') return;
      try { if (window.CakeGame && CakeGame.stop) CakeGame.stop(); }
      catch (err){ if (window.console) console.error(err); }
      Game.mode = 'farm';
      window.UI.hideCakeRoot(); window.UI.showFarmHud(); refreshUI();
      if (window.UI.setPointerHint) window.UI.setPointerHint(true);
      var d = world.cakeDoor || {x:18,y:0,z:-34};
      if (controller.setPosition) controller.setPosition(d.x, d.y||0, d.z);
      if (controller.setEnabled) controller.setEnabled(true);
      onResize();
      last = performance.now();
    };

    function onResize(){
      var w=window.innerWidth, h=Math.max(window.innerHeight,1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
      renderer.setSize(w,h,false);
      farmCamera.aspect=w/h; farmCamera.updateProjectionMatrix();
      if (window.CakeGame && CakeGame.camera){
        CakeGame.camera.aspect=w/h;
        if (CakeGame.camera.updateProjectionMatrix) CakeGame.camera.updateProjectionMatrix();
      }
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    var started=false, last=0;
    window.UI.onStart(function(){
      if (started) return; started=true;
      Game.mode='farm';
      window.UI.hideStart(); window.UI.showFarmHud();
      if (window.UI.setPointerHint) window.UI.setPointerHint(true);
      refreshUI();
      document.body.classList.remove('mode-start');
      if (controller.requestPointerLock) controller.requestPointerLock();
      onResize();
      last = performance.now();
      requestAnimationFrame(loop);
    });

    // Avoid a large time jump after the tab was hidden
    document.addEventListener('visibilitychange', function(){
      if (!document.hidden) last = performance.now();
    });

    window.UI.setStartStatus('农场已就绪，点击开始游戏');

    function loop(now){
      requestAnimationFrame(loop);
      var dt=Math.max(0, Math.min(0.05, (now-last)/1000)); last=now;
      try {
        if (Game.mode==='cake' && window.CakeGame){
          window.CakeGame.update(dt);
          if (CakeGame.scene && CakeGame.camera) renderer.render(CakeGame.scene, CakeGame.camera);
        } else {
          if (Game.mode==='farm'){
            window.Systems.update(dt);
            controller.update(dt);
          }
          renderer.render(farmScene, farmCamera);
        }
      } catch (err){
        if (window.console) console.error(err);
      }
    }
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
