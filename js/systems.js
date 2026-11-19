(function(){
  'use strict';

  var INV_KEYS = ['coins','carrot','cabbage','tomato','wheat','cotton','egg','duckEgg','milk','flour','cloth','butter','cheese','cake','seed_carrot','seed_cabbage','seed_tomato','seed_wheat','seed_cotton'];
  var CROP_LABELS = {carrot:'胡萝卜', cabbage:'白菜', tomato:'番茄', wheat:'小麦', cotton:'棉花'};
  var SEED_ORDER = ['carrot','cabbage','tomato','wheat','cotton'];
  var STAGE_SECONDS = 10, MAX_STAGE = 3, RIPE_SECONDS = 30, ANIMAL_WAIT = 4000, PROCESS_MS = 1400;

  var Game = null, lastZone = null, lastPrompt = null, lastTarget = null;

  function num(v){ return (typeof v === 'number' && isFinite(v)) ? v : 0; }

  
  function plotOf(it){ return (it && it.plot) ? it.plot : it; }
  function animalKind(it){
    var a = it && (it.animal || it.species || it.kind);
    if (a && typeof a === 'object') return a.kind || a.type || a.name || 'chicken';
    return a || 'chicken';
  }
  function zoneAt(world, player){
    if (!world) return '';
    if (typeof world.getZone === 'function'){
      var z = world.getZone(player);
      return z ? (z.name || z.title || '') : '';
    }
    var p = posOf(player);
    var list = world.zones || [];
    if (!p || !list.length) return '';
    for (var i = 0; i < list.length; i++){
      var z = list[i];
      if (!z) continue;
      var minX = z.minX, maxX = z.maxX, minZ = z.minZ, maxZ = z.maxZ;
      if (minX==null && z.min){ minX=z.min.x; minZ=z.min.z; maxX=z.max.x; maxZ=z.max.z; }
      if (p.x>=minX && p.x<=maxX && p.z>=minZ && p.z<=maxZ) return z.name || z.title || '';
    }
    return '';
  }

  function makeInv(){
    var inv = {}, i;
    for (i = 0; i < INV_KEYS.length; i++) inv[INV_KEYS[i]] = 0;
    inv.coins = 50;
    for (i = 0; i < SEED_ORDER.length; i++) inv['seed_' + SEED_ORDER[i]] = 8;
    inv.wheat = 6;
    inv.egg = 2;
    inv.carrot = 2;
    inv.cotton = 2;
    return inv;
  }

  function getUI(){ return window.UI || (Game && Game.UI) || null; }

  function toast(UI, msg, kind){ if (UI && typeof UI.toast === 'function') UI.toast(msg, kind || 'good'); }

  function posOf(player){
    if (!player) return null;
    if (typeof player.getPosition === 'function') return player.getPosition();
    return player.position || (player.mesh && player.mesh.position) || null;
  }

  function nearestInteractable(world, player){
    if (!world) return null;
    var list = world.interactables || world.objects || null;
    if (!list || !list.length) return null;
    var p = posOf(player);
    if (!p) return null;
    var best = null, bestD = Infinity;
    for (var i = 0; i < list.length; i++){
      var it = list[i];
      if (!it || it.active === false) continue;
      var ip = it.position || (it.mesh && it.mesh.position);
      if (!ip) continue;
      var dx = ip.x - p.x, dz = ip.z - p.z;
      var d = Math.sqrt(dx * dx + dz * dz);
      var r = (typeof it.radius === 'number') ? it.radius : 2.4;
      if (d <= r && d < bestD){ bestD = d; best = it; }
    }
    return best;
  }

  function readAnimal(it){
    var ud = (it.mesh && it.mesh.userData) ? it.mesh.userData : null;
    return {
      fed: ud && typeof ud.fed !== 'undefined' ? ud.fed : !!it.fed,
      collectAt: ud && typeof ud.collectAt !== 'undefined' ? ud.collectAt : num(it.collectAt),
      collected: ud && typeof ud.collected !== 'undefined' ? ud.collected : !!it.collected
    };
  }

  function writeAnimal(it, s){
    it.fed = s.fed; it.collectAt = s.collectAt; it.collected = s.collected;
    if (it.mesh){
      if (!it.mesh.userData) it.mesh.userData = {};
      it.mesh.userData.fed = s.fed;
      it.mesh.userData.collectAt = s.collectAt;
      it.mesh.userData.collected = s.collected;
    }
  }

  function hop(it, dy){
    var mesh = it.mesh || it.object || null;
    if (mesh && mesh.position) mesh.position.y += dy;
  }

  function promptFor(it, G, UI){
    if (!it || !UI || !G) return;
    var inv = G.inv, text = '', type = it.type || it.kind || '';

    if (type === 'plot'){
      var plot = plotOf(it);
      var st = plot.state || 'untilled';
      if (st === 'untilled') text = '按 E 翻土';
      else if (st === 'tilled'){
        var seed = G.selectedSeed;
        text = num(inv['seed_' + seed]) >= 1
          ? '按 E 播种「' + (CROP_LABELS[seed] || seed) + '」'
          : '按 E 播种（先选择种子）';
      } else if (st === 'ready'){
        text = '按 E 收获「' + (CROP_LABELS[plot.crop] || '作物') + '」';
      } else if (!plot.watered){
        text = '按 E 浇水';
      } else {
        text = '生长中… 剩余约 ' + Math.max(0, Math.ceil(RIPE_SECONDS - num(plot.growT))) + ' 秒';
      }
    } else if (type === 'animal'){
      var a = readAnimal(it);
      var ready = a.fed && !a.collected && Date.now() >= a.collectAt;
      var kind = animalKind(it);
      if (kind === 'cow') text = ready ? '按 E 挤奶' : '按 E 喂牛（小麦或胡萝卜x1）';
      else if (kind === 'duck') text = ready ? '按 E 收集鸭蛋' : '按 E 喂鸭（小麦x1）';
      else text = ready ? '按 E 收集鸡蛋' : '按 E 喂鸡（小麦x1）';
    } else if (type === 'factory'){
      var f = it.factory || it.subtype || it.machine || '';
      if (f === 'textile'){
        text = '按 E 加工「2棉花→1布料」';
        if (num(inv.cloth) >= 1) text += '\n再按 E 出售1布料 +12金币';
      } else if (f === 'flour'){
        text = '按 E 加工「2小麦→1面粉」';
      } else if (f === 'dairy'){
        text = num(inv.milk) >= 2 ? '按 E 加工「2牛奶→1奶酪」' : '按 E 加工「1牛奶→1黄油」';
      }
      if (it.processing) text = '加工中…请稍候';
    } else if (type === 'shop' || type === 'cake'){
      text = '按 E 进入蛋糕店';
    }

    if (text === lastPrompt && lastTarget === it) return;
    lastPrompt = text;
    lastTarget = it;
    if (!text){ if (UI.hidePrompt) UI.hidePrompt(); return; }
    if (UI.showPrompt) UI.showPrompt(text);
  }

  function runProcess(it, UI, label, fn){
    it.processing = true;
    var done = function(){
      it.processing = false;
      fn();
      if (UI && UI.refresh) UI.refresh(Game.inv);
      lastPrompt = null; lastTarget = null;
    };
    var rev = (UI && typeof UI.showProgress === 'function') ? UI.showProgress(label, PROCESS_MS) : null;
    if (rev && typeof rev.then === 'function') rev.then(done, done);
    else done();
  }

  function System_init(world, playerController, UI){
    Game = window.Game || {};
    Game.mode = Game.mode || 'start';
    Game.inv = makeInv();
    Game.selectedSeed = 'carrot';
    Game.world = world;
    Game.player = playerController;
    Game.UI = UI;
    window.Game = Game;

    if (UI && UI.init) UI.init();
    if (UI && UI.setSelectedSeed) UI.setSelectedSeed(Game.selectedSeed);
    if (UI && UI.refresh) UI.refresh(Game.inv);
    if (UI && UI.bindSeedBar){
      UI.bindSeedBar(function(seed){
        if (SEED_ORDER.indexOf(seed) === -1) return;
        Game.selectedSeed = seed;
        if (UI.setSelectedSeed) UI.setSelectedSeed(seed);
        toast(UI, '已选择「' + (CROP_LABELS[seed] || seed) + '」种子');
      });
    }

    window.addEventListener('keydown', function(e){
      if (!Game || Game.mode !== 'farm') return;
      var idx = parseInt(e.key, 10);
      if (isNaN(idx) || idx < 1 || idx > 5) return;
      var seed = SEED_ORDER[idx - 1];
      Game.selectedSeed = seed;
      if (UI && UI.setSelectedSeed) UI.setSelectedSeed(seed);
    });
  }

  function growPlot(p, dt, world){
    if (!p) return;
    var st = p.state || 'untilled';
    if (st !== 'planted' && st !== 'growing') return;
    p.growT = num(p.growT) + dt * (p.watered ? 1 : 0.25);
    p.stage = num(p.stage);
    if (p.growT >= RIPE_SECONDS || p.stage >= MAX_STAGE){
      p.stage = MAX_STAGE;
      p.state = 'ready';
      if (world && world.setPlotVisual) world.setPlotVisual(p);
      return;
    }
    var want = Math.min(MAX_STAGE - 1, Math.floor(p.growT / STAGE_SECONDS));
    if (want !== p.stage){
      p.stage = want;
      p.state = want >= 1 ? 'growing' : 'planted';
      if (world && world.setPlotVisual) world.setPlotVisual(p);
    }
  }

  function update(dt){
    if (!Game || Game.mode !== 'farm') return;
    dt = (typeof dt === 'number' && isFinite(dt)) ? dt : 0;
    var world = Game.world, UI = getUI();

    var plots = world && world.plots;
    if (plots && plots.length){
      for (var i = 0; i < plots.length; i++) growPlot(plots[i], dt, world);
    }

    var zname = zoneAt(world, Game.player);
    if (zname !== lastZone){
      lastZone = zname;
      if (UI){
        if (zname && UI.setZone) UI.setZone(zname);
        if (zname && UI.showZoneBanner) UI.showZoneBanner(zname);
      }
    }

    var it = nearestInteractable(world, Game.player);
    if (it){
      promptFor(it, Game, UI);
    } else if (lastPrompt !== '' || lastTarget !== null){
      lastPrompt = ''; lastTarget = null;
      if (UI && UI.hidePrompt) UI.hidePrompt();
    }

    if (world && typeof world.update === 'function') world.update(dt);
  }

  function tryInteract(){
    if (!Game) return;
    var UI = getUI();
    var world = Game.world;
    var it = nearestInteractable(world, Game.player);
    if (!it){ lastPrompt = ''; lastTarget = null; if (UI && UI.hidePrompt) UI.hidePrompt(); return; }

    var inv = Game.inv;
    var type = it.type || it.kind || '';

    if (type === 'plot'){
      var plot = plotOf(it);
      var st = plot.state || 'untilled';
      if (st === 'untilled'){
        plot.state = 'tilled'; plot.crop = null; plot.watered = false; plot.growT = 0; plot.stage = 0;
        if (world && world.setPlotVisual) world.setPlotVisual(plot);
        toast(UI, '已翻土，可以播种了');
      } else if (st === 'tilled'){
        var seed = Game.selectedSeed, key = 'seed_' + seed;
        if (num(inv[key]) < 1){
          toast(UI, '种子不足，请先选择种子', 'bad');
        } else {
          inv[key] = num(inv[key]) - 1;
          plot.state = 'planted'; plot.crop = seed; plot.watered = false; plot.growT = 0; plot.stage = 0;
          if (world && world.setPlotVisual) world.setPlotVisual(plot);
          toast(UI, '已播种「' + (CROP_LABELS[seed] || seed) + '」');
        }
      } else if (st === 'ready'){
        var crop = plot.crop || 'carrot';
        inv[crop] = num(inv[crop]) + 1;
        inv.coins = num(inv.coins) + 2;
        plot.state = 'tilled'; plot.crop = null; plot.watered = false; plot.growT = 0; plot.stage = 0;
        if (world && world.setPlotVisual) world.setPlotVisual(plot);
        toast(UI, '收获「' + (CROP_LABELS[crop] || crop) + '」x1，金币 +2');
      } else if (!plot.watered){
        plot.watered = true;
        if (world && world.setPlotVisual) world.setPlotVisual(plot);
        toast(UI, '已浇水，生长加快');
      } else {
        toast(UI, '这块地已经浇过水了', 'bad');
      }
      if (UI && UI.refresh) UI.refresh(inv);
    } else if (type === 'animal'){
      var s = readAnimal(it);
      var kind = animalKind(it);
      var now = Date.now();
      if (s.fed && !s.collected && now >= s.collectAt){
        var prod = kind === 'cow' ? 'milk' : (kind === 'duck' ? 'duckEgg' : 'egg');
        var prodName = {milk:'牛奶', duckEgg:'鸭蛋', egg:'鸡蛋'}[prod];
        inv[prod] = num(inv[prod]) + 1;
        writeAnimal(it, {fed:false, collectAt:0, collected:true});
        hop(it, 0.06);
        toast(UI, '收集到「' + prodName + '」x1');
      } else if (!s.fed){
        var fedWith = null;
        if (kind === 'cow'){
          if (num(inv.wheat) >= 1){ inv.wheat -= 1; fedWith = '小麦'; }
          else if (num(inv.carrot) >= 1){ inv.carrot -= 1; fedWith = '胡萝卜'; }
        } else if (num(inv.wheat) >= 1){
          inv.wheat -= 1; fedWith = '小麦';
        }
        if (!fedWith){
          toast(UI, '材料不足：需要小麦x1', 'bad');
        } else {
          writeAnimal(it, {fed:true, collectAt: now + ANIMAL_WAIT, collected:false});
          hop(it, 0.12);
          toast(UI, '已喂食（' + fedWith + 'x1），稍等片刻');
        }
      } else {
        toast(UI, '它正在生产中，请稍等一下', 'bad');
      }
      if (UI && UI.refresh) UI.refresh(inv);
    } else if (type === 'factory'){
      var f = it.factory || it.subtype || it.machine || '';
      if (it.processing){ toast(UI, '正在加工中，请稍候', 'bad'); return; }
      if (f === 'textile'){
        runProcess(it, UI, '纺织中…', function(){
          if (num(inv.cotton) >= 2){
            inv.cotton -= 2; inv.cloth = num(inv.cloth) + 1;
            toast(UI, '纺织完成：布料 x1');
          } else if (num(inv.cloth) >= 1){
            inv.cloth -= 1; inv.coins = num(inv.coins) + 12;
            toast(UI, '出售布料 x1，金币 +12');
          } else {
            toast(UI, '材料不足', 'bad');
          }
        });
      } else if (f === 'flour'){
        runProcess(it, UI, '磨面中…', function(){
          if (num(inv.wheat) >= 2){
            inv.wheat -= 2; inv.flour = num(inv.flour) + 1;
            toast(UI, '磨面完成：面粉 x1');
          } else {
            toast(UI, '材料不足', 'bad');
          }
        });
      } else if (f === 'dairy'){
        runProcess(it, UI, '加工中…', function(){
          if (num(inv.milk) >= 2){
            inv.milk -= 2; inv.cheese = num(inv.cheese) + 1;
            toast(UI, '制作完成：奶酪 x1');
          } else if (num(inv.milk) >= 1){
            inv.milk -= 1; inv.butter = num(inv.butter) + 1;
            toast(UI, '制作完成：黄油 x1');
          } else {
            toast(UI, '材料不足', 'bad');
          }
        });
      }
    } else if (type === 'shop' || type === 'cake'){
      if (typeof Game.enterCake === 'function') Game.enterCake();
    }

    lastPrompt = null; lastTarget = null;
  }

  window.Systems = {
    init: System_init,
    update: update,
    tryInteract: tryInteract,
    getInv: function(){ return Game && Game.inv; }
  };
})();
