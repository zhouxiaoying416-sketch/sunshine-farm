(function(){
  'use strict';

  function shadow(m){ m.castShadow = true; m.receiveShadow = true; return m; }

  function meshBox(THREE, w,h,d, mat, x,y,z){
    var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
    m.position.set(x||0, y||0, z||0);
    return shadow(m);
  }
  function meshCyl(THREE, rTop,rBot,h, segs, mat, x,y,z){
    var m = new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBot,h, segs||8), mat);
    m.position.set(x||0, y||0, z||0);
    return shadow(m);
  }
  function meshSphere(THREE, r, segs, mat, x,y,z){
    segs = segs || 8;
    var m = new THREE.Mesh(new THREE.SphereGeometry(r, segs, Math.max(4, Math.round(segs*0.75))), mat);
    m.position.set(x||0, y||0, z||0);
    return shadow(m);
  }
  function meshCone(THREE, r,h, segs, mat, x,y,z){
    var m = new THREE.Mesh(new THREE.ConeGeometry(r,h, segs||8), mat);
    m.position.set(x||0, y||0, z||0);
    return shadow(m);
  }
  // triangular prism roof, ridge along Z, base centered at (x,y,z)
  function meshPrism(THREE, w,h,d, mat, x,y,z){
    var s = new THREE.Shape();
    s.moveTo(-w/2, 0); s.lineTo(w/2, 0); s.lineTo(0, h); s.lineTo(-w/2, 0);
    var geo = new THREE.ExtrudeGeometry(s, {depth:d, bevelEnabled:false});
    geo.translate(0, 0, -d/2);
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x||0, y||0, z||0);
    return shadow(m);
  }
  function meshTorus(THREE, r, tube, radSegs, tubSegs, mat, x,y,z, arc){
    var m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, radSegs||5, tubSegs||12, arc === undefined ? Math.PI*2 : arc), mat);
    m.position.set(x||0, y||0, z||0);
    return shadow(m);
  }
  function fixTexColor(THREE, tex){
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    else if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function mats(THREE){
    function L(color, extra){
      var o = {color: color, flatShading: true};
      if (extra) for (var k in extra) o[k] = extra[k];
      return new THREE.MeshLambertMaterial(o);
    }
    var M = {
      grass: L(0x8fd16a), grassDark: L(0x6fb552), dirt: L(0xb98a5a), soil: L(0x7a4f2c), soilWet: L(0x4f311b),
      wood: L(0xb07a45), darkWood: L(0x6e4424), lightWood: L(0xd9aa72), straw: L(0xe8c96a), brick: L(0xb5553c),
      brickDark: L(0x8e3f2c), cream: L(0xfff1d6), water: L(0x5cc3ea, {transparent:true, opacity:0.85}),
      metal: L(0xb8c2cc), darkMetal: L(0x5d6670), skin: L(0xf6c9a0), white: L(0xffffff), black: L(0x222222),
      red: L(0xe2463c), darkRed: L(0xa82e2a), orange: L(0xf58a1f), yellow: L(0xffd84a), green: L(0x4caf50),
      darkGreen: L(0x2e7d32), lightGreen: L(0xa5d86a), leaf: L(0x66bb44), gold: L(0xe6b422),
      pastelPink: L(0xffc1d6), pastelBlue: L(0xb5dcff), pastelYellow: L(0xfff0a8), pastelMint: L(0xbdf0d4),
      pastelPurple: L(0xdcc6ff), pink: L(0xff8fb1), brown: L(0x8b5a2b), stone: L(0x9a9a94), stoneLight: L(0xc4c2b8),
      shingle: L(0x3d3a40), glass: L(0xaee4ff, {transparent:true, opacity:0.8}), burlap: L(0xe3c690),
      blue: L(0x3f7fd9), chocolate: L(0x5a3320), cotton: L(0xfafafa), wheatGreen: L(0x9ccc4e)
    };
    // plaid shirt texture
    var c = document.createElement('canvas'); c.width = 64; c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = '#d8423a'; g.fillRect(0,0,64,64);
    g.fillStyle = 'rgba(40,40,90,0.55)';
    for (var i = 0; i < 4; i++){ g.fillRect(i*16+4, 0, 6, 64); g.fillRect(0, i*16+4, 64, 6); }
    g.fillStyle = 'rgba(255,240,200,0.6)';
    for (var j = 0; j < 4; j++){ g.fillRect(j*16+13, 0, 2, 64); g.fillRect(0, j*16+13, 64, 2); }
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.NearestFilter;
    fixTexColor(THREE, tex);
    M.plaid = new THREE.MeshLambertMaterial({map: tex, flatShading: true});
    return M;
  }

  // ---------- animals (facing +Z) ----------
  function makeChicken(THREE, M){
    var g = new THREE.Group();
    var body = meshSphere(THREE, 0.22, 8, M.white, 0, 0.34, 0); body.scale.set(1, 0.9, 1.25); g.add(body);
    var head = new THREE.Group(); head.position.set(0, 0.58, 0.2); g.add(head);
    head.add(meshSphere(THREE, 0.13, 8, M.white, 0, 0, 0));
    head.add(meshBox(THREE, 0.04, 0.07, 0.06, M.red, 0, 0.14, 0.06));
    head.add(meshBox(THREE, 0.04, 0.09, 0.06, M.red, 0, 0.15, 0));
    head.add(meshBox(THREE, 0.04, 0.06, 0.06, M.red, 0, 0.13, -0.06));
    var beak = meshCone(THREE, 0.045, 0.11, 5, M.orange, 0, -0.01, 0.16); beak.rotation.x = Math.PI/2; head.add(beak);
    head.add(meshSphere(THREE, 0.035, 5, M.red, 0, -0.08, 0.11));
    head.add(meshSphere(THREE, 0.022, 5, M.black, 0.08, 0.04, 0.09));
    head.add(meshSphere(THREE, 0.022, 5, M.black, -0.08, 0.04, 0.09));
    var tail = meshCone(THREE, 0.1, 0.24, 5, M.white, 0, 0.5, -0.27); tail.rotation.x = -0.7; g.add(tail);
    var wings = [];
    [-1, 1].forEach(function(s){
      var w = meshSphere(THREE, 0.15, 6, M.cream, s*0.2, 0.36, -0.02); w.scale.set(0.3, 0.7, 1.1); g.add(w); wings.push(w);
      g.add(meshCyl(THREE, 0.015, 0.015, 0.16, 5, M.orange, s*0.08, 0.09, 0));
      g.add(meshBox(THREE, 0.08, 0.02, 0.11, M.orange, s*0.08, 0.01, 0.03));
    });
    g.userData = {kind: 'chicken', head: head, wings: wings, body: body};
    return g;
  }

  function makeDuck(THREE, M){
    var g = new THREE.Group();
    var body = meshSphere(THREE, 0.22, 8, M.yellow, 0, 0.24, 0); body.scale.set(1, 0.75, 1.45); g.add(body);
    g.add(meshCyl(THREE, 0.07, 0.09, 0.2, 6, M.yellow, 0, 0.42, 0.2));
    var head = new THREE.Group(); head.position.set(0, 0.56, 0.22); g.add(head);
    head.add(meshSphere(THREE, 0.12, 8, M.yellow, 0, 0, 0));
    var bill = meshBox(THREE, 0.11, 0.035, 0.14, M.orange, 0, -0.02, 0.15); head.add(bill);
    head.add(meshBox(THREE, 0.09, 0.02, 0.1, M.orange, 0, -0.05, 0.12));
    head.add(meshSphere(THREE, 0.02, 5, M.black, 0.075, 0.04, 0.08));
    head.add(meshSphere(THREE, 0.02, 5, M.black, -0.075, 0.04, 0.08));
    var tail = meshCone(THREE, 0.08, 0.18, 4, M.yellow, 0, 0.34, -0.32); tail.rotation.x = -1.0; g.add(tail);
    var wings = [];
    [-1, 1].forEach(function(s){
      var w = meshSphere(THREE, 0.15, 6, M.pastelYellow, s*0.2, 0.27, -0.03); w.scale.set(0.3, 0.6, 1.2); g.add(w); wings.push(w);
      g.add(meshCyl(THREE, 0.015, 0.015, 0.1, 5, M.orange, s*0.08, 0.06, 0));
      var f = meshBox(THREE, 0.1, 0.02, 0.13, M.orange, s*0.08, 0.01, 0.04); g.add(f);
    });
    g.userData = {kind: 'duck', head: head, wings: wings, body: body};
    return g;
  }

  function makeCow(THREE, M){
    var g = new THREE.Group();
    var body = meshBox(THREE, 0.8, 0.7, 1.4, M.white, 0, 0.95, 0); g.add(body);
    // patches
    g.add(meshBox(THREE, 0.82, 0.35, 0.45, M.black, 0, 1.1, -0.3));
    g.add(meshBox(THREE, 0.3, 0.3, 0.35, M.black, 0.27, 0.9, 0.35));
    g.add(meshBox(THREE, 0.25, 0.25, 0.3, M.black, -0.29, 1.0, 0.1));
    g.add(meshBox(THREE, 0.4, 0.04, 0.4, M.black, -0.1, 1.3, 0.3));
    var head = new THREE.Group(); head.position.set(0, 1.25, 0.85); g.add(head);
    head.add(meshBox(THREE, 0.5, 0.5, 0.5, M.white, 0, 0, 0));
    head.add(meshBox(THREE, 0.2, 0.3, 0.3, M.black, 0.16, 0.11, 0.11));
    head.add(meshBox(THREE, 0.42, 0.24, 0.2, M.pastelPink, 0, -0.14, 0.3));
    head.add(meshBox(THREE, 0.05, 0.05, 0.02, M.chocolate, 0.09, -0.12, 0.41));
    head.add(meshBox(THREE, 0.05, 0.05, 0.02, M.chocolate, -0.09, -0.12, 0.41));
    head.add(meshSphere(THREE, 0.04, 5, M.black, 0.14, 0.1, 0.25));
    head.add(meshSphere(THREE, 0.04, 5, M.black, -0.14, 0.1, 0.25));
    [-1, 1].forEach(function(s){
      var horn = meshCone(THREE, 0.05, 0.18, 5, M.cream, s*0.2, 0.32, 0); horn.rotation.z = -s*0.4; head.add(horn);
      var ear = meshBox(THREE, 0.18, 0.1, 0.05, M.white, s*0.33, 0.14, -0.05); ear.rotation.z = s*0.3; head.add(ear);
    });
    var legs = [];
    [[-0.28, 0.5], [0.28, 0.5], [-0.28, -0.5], [0.28, -0.5]].forEach(function(p){
      var leg = meshBox(THREE, 0.18, 0.6, 0.18, M.white, p[0], 0.36, p[1]); g.add(leg); legs.push(leg);
      g.add(meshBox(THREE, 0.2, 0.1, 0.2, M.black, p[0], 0.05, p[1]));
    });
    g.add(meshBox(THREE, 0.35, 0.14, 0.35, M.pastelPink, 0, 0.56, -0.3));
    var tail = meshCyl(THREE, 0.025, 0.025, 0.6, 5, M.white, 0, 0.95, -0.74); tail.rotation.x = 0.25; g.add(tail);
    g.add(meshSphere(THREE, 0.06, 5, M.black, 0, 0.64, -0.82));
    g.userData = {kind: 'cow', head: head, legs: legs, tail: tail, body: body};
    return g;
  }

  // ---------- props ----------
  function makeScarecrow(THREE, M){
    var g = new THREE.Group();
    g.add(meshCyl(THREE, 0.06, 0.07, 2.0, 6, M.darkWood, 0, 1.0, 0));
    var arm = meshCyl(THREE, 0.045, 0.045, 1.7, 6, M.darkWood, 0, 1.5, 0); arm.rotation.z = Math.PI/2; g.add(arm);
    // plaid shirt: torso + sleeves
    g.add(meshBox(THREE, 0.6, 0.75, 0.34, M.plaid, 0, 1.3, 0));
    g.add(meshBox(THREE, 0.5, 0.24, 0.26, M.plaid, 0.52, 1.5, 0));
    g.add(meshBox(THREE, 0.5, 0.24, 0.26, M.plaid, -0.52, 1.5, 0));
    // belt and ragged trousers
    g.add(meshBox(THREE, 0.62, 0.08, 0.36, M.chocolate, 0, 0.94, 0));
    g.add(meshBox(THREE, 0.24, 0.5, 0.26, M.blue, 0.16, 0.66, 0));
    g.add(meshBox(THREE, 0.24, 0.5, 0.26, M.blue, -0.16, 0.66, 0));
    // straw tufts at hands, feet, neck
    [-1, 1].forEach(function(s){
      var h = meshCone(THREE, 0.12, 0.26, 6, M.straw, s*0.88, 1.5, 0); h.rotation.z = s*Math.PI/2; g.add(h);
      var f = meshCone(THREE, 0.12, 0.22, 6, M.straw, s*0.16, 0.34, 0); g.add(f);
    });
    g.add(meshCyl(THREE, 0.2, 0.14, 0.1, 7, M.straw, 0, 1.72, 0));
    // head
    var head = new THREE.Group(); head.position.set(0, 2.0, 0); g.add(head);
    head.add(meshSphere(THREE, 0.3, 8, M.burlap, 0, 0, 0));
    head.add(meshSphere(THREE, 0.045, 5, M.black, 0.11, 0.06, 0.27));
    head.add(meshSphere(THREE, 0.045, 5, M.black, -0.11, 0.06, 0.27));
    var nose = meshCone(THREE, 0.04, 0.14, 5, M.orange, 0, -0.02, 0.33); nose.rotation.x = Math.PI/2; head.add(nose);
    var smile = meshTorus(THREE, 0.12, 0.018, 4, 8, M.darkRed, 0, -0.06, 0.26, Math.PI); smile.rotation.z = Math.PI; head.add(smile);
    head.add(meshSphere(THREE, 0.04, 5, M.pink, 0.19, -0.05, 0.22));
    head.add(meshSphere(THREE, 0.04, 5, M.pink, -0.19, -0.05, 0.22));
    // straw hat
    head.add(meshCyl(THREE, 0.5, 0.52, 0.04, 10, M.straw, 0, 0.2, 0));
    head.add(meshCyl(THREE, 0.2, 0.28, 0.24, 8, M.straw, 0, 0.33, 0));
    head.add(meshCyl(THREE, 0.285, 0.285, 0.06, 8, M.red, 0, 0.25, 0));
    g.userData = {kind: 'scarecrow', head: head};
    return g;
  }

  function makeShed(THREE, M){
    var g = new THREE.Group();
    g.add(meshBox(THREE, 3.2, 0.2, 2.6, M.stone, 0, 0.1, 0));
    g.add(meshBox(THREE, 3.0, 2.0, 2.4, M.wood, 0, 1.2, 0));
    // plank battens
    for (var i = -3; i <= 3; i++){
      if (Math.abs(i) < 1) continue;
      g.add(meshBox(THREE, 0.06, 2.0, 0.04, M.darkWood, i*0.45, 1.2, 1.21));
    }
    for (var k = -2; k <= 2; k++){
      g.add(meshBox(THREE, 0.04, 2.0, 0.06, M.darkWood, 1.51, 1.2, k*0.5));
      g.add(meshBox(THREE, 0.04, 2.0, 0.06, M.darkWood, -1.51, 1.2, k*0.5));
    }
    // roof with dark shingles
    g.add(meshPrism(THREE, 3.0, 1.0, 2.4, M.wood, 0, 2.2, 0));
    [-1, 1].forEach(function(s){
      var slope = Math.atan2(1.0, 1.5);
      var len = Math.sqrt(1.5*1.5 + 1.0) + 0.3;
      var r = meshBox(THREE, len, 0.1, 2.9, M.shingle, s*0.82, 2.72, 0); r.rotation.z = -s*slope; g.add(r);
      for (var j = 0; j < 3; j++){
        var st = meshBox(THREE, 0.08, 0.05, 2.92, M.black, s*(0.35 + j*0.5), 3.07 - j*0.333, 0); st.rotation.z = -s*slope; g.add(st);
      }
    });
    g.add(meshBox(THREE, 0.2, 0.12, 3.0, M.black, 0, 3.26, 0));
    // door
    g.add(meshBox(THREE, 0.9, 1.5, 0.08, M.darkWood, 0, 0.95, 1.22));
    g.add(meshBox(THREE, 0.76, 0.08, 0.1, M.wood, 0, 1.3, 1.24));
    g.add(meshBox(THREE, 0.76, 0.08, 0.1, M.wood, 0, 0.6, 1.24));
    g.add(meshSphere(THREE, 0.05, 5, M.gold, 0.3, 0.95, 1.28));
    // window
    g.add(meshBox(THREE, 0.6, 0.5, 0.06, M.darkWood, 1.0, 1.5, 1.22));
    g.add(meshBox(THREE, 0.48, 0.38, 0.08, M.glass, 1.0, 1.5, 1.23));
    // tools & crate
    var hoe = meshCyl(THREE, 0.03, 0.03, 1.5, 5, M.lightWood, -1.1, 0.9, 1.32); hoe.rotation.x = -0.15; g.add(hoe);
    g.add(meshBox(THREE, 0.25, 0.06, 0.1, M.darkMetal, -1.1, 1.62, 1.26));
    g.add(meshBox(THREE, 0.5, 0.4, 0.5, M.lightWood, -1.9, 0.2, 0.7));
    g.add(meshCyl(THREE, 0.25, 0.22, 0.6, 8, M.brown, 1.95, 0.3, 0.7));
    g.userData = {kind: 'shed', door: {x: 0, z: 1.8}};
    return g;
  }

  function makeCoop(THREE, M){
    var g = new THREE.Group();
    // stilts
    [[-0.9, -0.6], [0.9, -0.6], [-0.9, 0.6], [0.9, 0.6]].forEach(function(p){
      g.add(meshBox(THREE, 0.14, 0.6, 0.14, M.darkWood, p[0], 0.3, p[1]));
    });
    g.add(meshBox(THREE, 2.2, 0.12, 1.6, M.wood, 0, 0.62, 0));
    g.add(meshBox(THREE, 2.0, 1.2, 1.4, M.red, 0, 1.28, 0));
    // white trim
    g.add(meshBox(THREE, 2.04, 0.08, 1.44, M.white, 0, 0.72, 0));
    [-1, 1].forEach(function(s){
      g.add(meshBox(THREE, 0.08, 1.2, 0.08, M.white, s*1.0, 1.28, 0.7));
    });
    // roof
    g.add(meshPrism(THREE, 2.0, 0.7, 1.4, M.red, 0, 1.88, 0));
    [-1, 1].forEach(function(s){
      var slope = Math.atan2(0.7, 1.0);
      var r = meshBox(THREE, 1.5, 0.08, 1.8, M.shingle, s*0.56, 2.26, 0); r.rotation.z = -s*slope; g.add(r);
    });
    g.add(meshBox(THREE, 0.16, 0.1, 1.85, M.black, 0, 2.63, 0));
    // little door with arch and ramp
    g.add(meshBox(THREE, 0.5, 0.6, 0.06, M.black, -0.4, 1.0, 0.71));
    g.add(meshBox(THREE, 0.6, 0.06, 0.08, M.white, -0.4, 1.33, 0.72));
    g.add(meshBox(THREE, 0.06, 0.66, 0.08, M.white, -0.68, 1.0, 0.72));
    g.add(meshBox(THREE, 0.06, 0.66, 0.08, M.white, -0.12, 1.0, 0.72));
    g.add(meshBox(THREE, 0.8, 0.08, 0.5, M.wood, -0.4, 0.66, 0.95));
    g.name = 'coop';
    return g;
  }
function makePond(THREE, M){
  const pond = new THREE.Group();
  pond.name = 'pond';

  // Water disc: a low-poly, slightly tapered flat cylinder
  const water = meshCyl(THREE, 2.2, 2.0, 0.08, 9, M.water, 0, 0.04, 0);
  water.receiveShadow = true;
  pond.add(water);

  // Reeds: thin leaf-colored stalks with straw-colored heads, clustered at the edge
  // [x, z, height, leanX, leanZ]
  const reeds = [
    [-1.55,  0.70, 1.10,  0.06, -0.08],
    [-1.75,  0.45, 0.85, -0.05,  0.10],
    [-1.40,  0.95, 0.95,  0.10,  0.04],
    [-1.62,  0.98, 0.70, -0.08, -0.05],
    [ 1.10, -1.45, 1.00,  0.05,  0.09],
    [ 1.32, -1.25, 0.78, -0.07, -0.06]
  ];
  for (let i = 0; i < reeds.length; i++){
    const r = reeds[i];
    const h = r[2];
    const reed = new THREE.Group();
    const stalk = meshCyl(THREE, 0.018, 0.035, h, 5, M.leaf, 0, h / 2, 0);
    const head = meshCyl(THREE, 0.05, 0.05, 0.26, 5, M.straw, 0, h + 0.10, 0);
    stalk.castShadow = true;
    head.castShadow = true;
    reed.add(stalk);
    reed.add(head);
    reed.position.set(r[0], 0.06, r[1]);
    reed.rotation.x = r[3];
    reed.rotation.z = r[4];
    pond.add(reed);
  }

  // Two stones: squashed low-segment spheres on the bank
  const stoneA = meshSphere(THREE, 0.48, 5, M.stone, 1.85, 0.14, 0.95);
  stoneA.scale.set(1.25, 0.6, 1.0);
  stoneA.rotation.y = 0.6;
  stoneA.castShadow = true;
  stoneA.receiveShadow = true;
  pond.add(stoneA);

  const stoneB = meshSphere(THREE, 0.30, 5, M.stone, 1.35, 0.10, 1.55);
  stoneB.scale.set(1.0, 0.65, 1.2);
  stoneB.rotation.y = -0.9;
  stoneB.castShadow = true;
  stoneB.receiveShadow = true;
  pond.add(stoneB);

  return pond;
}
function makeTextileMill(THREE, M){
  const g = new THREE.Group();
  g.name = 'textileMill';

  const fallback = { brick:0x9c4a36, wood:0x9a6b3f, darkWood:0x5a3b22, shingle:0x2f2a2c, cream:0xe8dcc0, metal:0x8a8f96, darkMetal:0x3a3d42, white:0xffffff, black:0x15151a, red:0xa02a22, stone:0x8c8a84, water:0x3f7fb5 };
  const mat = (k) => (M && M[k]) ? M[k] : new THREE.MeshLambertMaterial({ color: fallback[k] });
  const brick = mat('brick'), wood = mat('wood'), darkWood = mat('darkWood'), shingle = mat('shingle'),
        cream = mat('cream'), metal = mat('metal'), darkMetal = mat('darkMetal'), black = mat('black'),
        stone = mat('stone'), water = mat('water');

  const add = (m, parent) => { (parent || g).add(m); return m; };

  // dimensions
  const L = 6, D = 3.6, baseH = 0.4, brickH = 2.0, woodH = 1.2;
  const wallTop = baseH + brickH + woodH; // 3.6
  const rise = 1.4, ridgeY = wallTop + rise;

  // foundation
  add(meshBox(THREE, L + 0.3, baseH, D + 0.3, stone, 0, baseH / 2, 0));

  // brick lower storey
  add(meshBox(THREE, L, brickH, D, brick, 0, baseH + brickH / 2, 0));

  // wood upper storey
  add(meshBox(THREE, L, woodH, D, wood, 0, baseH + brickH + woodH / 2, 0));

  // trim band between storeys and at eaves
  add(meshBox(THREE, L + 0.1, 0.12, D + 0.1, darkWood, 0, baseH + brickH, 0));
  add(meshBox(THREE, L + 0.1, 0.1, D + 0.1, darkWood, 0, wallTop - 0.05, 0));

  // corner posts on upper storey
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) {
    add(meshBox(THREE, 0.16, woodH, 0.16, darkWood, c[0] * (L / 2 - 0.03), baseH + brickH + woodH / 2, c[1] * (D / 2 - 0.03)));
  });

  // gable (triangular prism, wood)
  const gShape = new THREE.Shape();
  gShape.moveTo(-D / 2, 0);
  gShape.lineTo(D / 2, 0);
  gShape.lineTo(0, rise);
  gShape.lineTo(-D / 2, 0);
  const gGeo = new THREE.ExtrudeGeometry(gShape, { depth: L, bevelEnabled: false, steps: 1 });
  const gable = new THREE.Mesh(gGeo, wood);
  gable.rotation.y = Math.PI / 2;
  gable.position.set(-L / 2, wallTop, 0);
  add(gable);

  // shingle roof slabs
  const theta = Math.atan2(rise, D / 2);
  const hyp = Math.sqrt(rise * rise + (D / 2) * (D / 2));
  const over = 0.3, slopeLen = hyp + over, thick = 0.12;
  [1, -1].forEach(function (s) {
    const slab = meshBox(THREE, L + 0.6, thick, slopeLen, shingle, 0, 0, 0);
    slab.rotation.x = s * theta;
    slab.position.set(
      0,
      ridgeY - Math.sin(theta) * (slopeLen / 2) + Math.cos(theta) * (thick / 2),
      s * (Math.cos(theta) * (slopeLen / 2) + Math.sin(theta) * (thick / 2))
    );
    add(slab);
  });
  // ridge cap
  add(meshBox(THREE, L + 0.7, 0.12, 0.2, darkWood, 0, ridgeY + 0.1, 0));

  // windows on the long sides
  const winXs = [-2.2, -1.1, 0, 1.1, 2.2];
  [1, -1].forEach(function (s) {
    const zf = s * (D / 2 + 0.02);
    winXs.forEach(function (x) {
      // upper row
      add(meshBox(THREE, 0.5, 0.62, 0.06, cream, x, baseH + brickH + 0.62, zf));
      add(meshBox(THREE, 0.38, 0.5, 0.08, black, x, baseH + brickH + 0.62, zf));
      add(meshBox(THREE, 0.04, 0.5, 0.1, cream, x, baseH + brickH + 0.62, zf));
      // lower row (skip the centre on the front for the door)
      if (!(s === 1 && x === 0)) {
        add(meshBox(THREE, 0.54, 0.8, 0.06, cream, x, baseH + 1.15, zf));
        add(meshBox(THREE, 0.42, 0.68, 0.08, black, x, baseH + 1.15, zf));
        add(meshBox(THREE, 0.04, 0.68, 0.1, cream, x, baseH + 1.15, zf));
        add(meshBox(THREE, 0.42, 0.04, 0.1, cream, x, baseH + 1.15, zf));
        add(meshBox(THREE, 0.62, 0.07, 0.12, stone, x, baseH + 0.72, zf));
      }
    });
  });

  // front door with step
  add(meshBox(THREE, 0.95, 1.5, 0.06, cream, 0, baseH + 0.75, D / 2 + 0.02));
  add(meshBox(THREE, 0.78, 1.4, 0.1, darkWood, 0, baseH + 0.7, D / 2 + 0.02));
  add(meshBox(THREE, 0.06, 0.06, 0.06, metal, 0.26, baseH + 0.7, D / 2 + 0.09));
  add(meshBox(THREE, 1.2, 0.2, 0.5, stone, 0, 0.1, D / 2 + 0.38));
  add(meshBox(THREE, 1.0, 0.2, 0.3, stone, 0, 0.3, D / 2 + 0.28));

  // loft window on the wheel-side gable
  add(meshBox(THREE, 0.06, 0.6, 0.5, cream, L / 2 + 0.02, wallTop + 0.45, 0));
  add(meshBox(THREE, 0.08, 0.48, 0.38, black, L / 2 + 0.02, wallTop + 0.45, 0));

  // chimney on the -X end
  const chX = -L / 2 - 0.65;
  const chBaseH = 0.7, chH = 6.0;
  add(meshBox(THREE, 0.95, chBaseH, 0.95, stone, chX, chBaseH / 2, 0));
  add(meshCyl(THREE, 0.26, 0.4, chH, 8, brick, chX, chBaseH + chH / 2, 0));
  add(meshCyl(THREE, 0.36, 0.38, 0.14, 8, stone, chX, chBaseH + chH * 0.55, 0));
  add(meshCyl(THREE, 0.33, 0.3, 0.18, 8, stone, chX, chBaseH + chH - 0.09, 0));
  add(meshCyl(THREE, 0.2, 0.24, 0.16, 8, darkMetal, chX, chBaseH + chH + 0.08, 0));

  // mill race on the +X end
  const wheelX = L / 2 + 0.72, wheelY = 1.78;
  add(meshBox(THREE, 0.95, 0.12, 6.0, water, wheelX, 0.06, 0));
  add(meshBox(THREE, 0.3, 0.28, 6.0, stone, wheelX + 0.62, 0.14, 0));
  add(meshBox(THREE, 0.14, 0.28, 6.0, stone, L / 2 + 0.2, 0.14, 0));

  // water wheel (axis along X)
  const wheel = new THREE.Group();
  wheel.name = 'waterWheel';
  wheel.position.set(wheelX, wheelY, 0);
  add(wheel);

  const R = 1.5, N = 10, wheelW = 0.7, sideX = wheelW / 2 - 0.05;

  const hub = meshCyl(THREE, 0.24, 0.24, wheelW + 0.1, 10, darkWood, 0, 0, 0);
  hub.rotation.z = Math.PI / 2;
  add(hub, wheel);

  const axle = meshCyl(THREE, 0.08, 0.08, 1.5, 8, darkMetal, -0.02, 0, 0);
  axle.rotation.z = Math.PI / 2;
  add(axle, wheel);

  const rimR = R - 0.22;
  const chord = 2 * rimR * Math.sin(Math.PI / N) + 0.06;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;

    const arm = new THREE.Group();
    arm.rotation.x = a;
    add(arm, wheel);
    // spokes on both sides
    add(meshBox(THREE, 0.07, R, 0.09, wood, -sideX, R / 2, 0), arm);
    add(meshBox(THREE, 0.07, R, 0.09, wood, sideX, R / 2, 0), arm);
    // paddle
    add(meshBox(THREE, wheelW, 0.4, 0.06, darkWood, 0, R, 0), arm);

    // rim segments between paddles
    const seg = new THREE.Group();
    seg.rotation.x = a + Math.PI / N;
    add(seg, wheel);
    const ry = rimR * Math.cos(Math.PI / N);
    add(meshBox(THREE, 0.08, 0.1, chord, wood, -sideX, ry, 0), seg);
    add(meshBox(THREE, 0.08, 0.1, chord, wood, sideX, ry, 0), seg);
  }

  // wall bearing and outer support frame
  add(meshBox(THREE, 0.12, 0.5, 0.5, stone, L / 2 + 0.06, wheelY, 0));
  const supX = wheelX + 0.62;
  add(meshBox(THREE, 0.2, 0.22, 0.34, darkWood, supX, wheelY, 0));
  [1, -1].forEach(function (s) {
    const leg = meshBox(THREE, 0.14, wheelY - 0.2, 0.14, darkWood, supX, 0.28 + (wheelY - 0.28) / 2, s * 0.32);
    leg.rotation.x = s * 0.36;
    add(leg);
  });
  add(meshBox(THREE, 0.12, 0.1, 1.0, darkWood, supX, 0.75, 0));

  // wooden flume feeding the wheel
  add(meshBox(THREE, 0.5, 0.06, 1.6, darkWood, wheelX, wheelY + R + 0.3, -1.3));
  add(meshBox(THREE, 0.05, 0.2, 1.6, darkWood, wheelX - 0.25, wheelY + R + 0.38, -1.3));
  add(meshBox(THREE, 0.05, 0.2, 1.6, darkWood, wheelX + 0.25, wheelY + R + 0.38, -1.3));
  add(meshBox(THREE, 0.4, 0.04, 1.5, water, wheelX, wheelY + R + 0.35, -1.3));
  add(meshBox(THREE, 0.12, wheelY + R + 0.3, 0.12, darkWood, wheelX + 0.2, (wheelY + R + 0.3) / 2, -2.0));
  add(meshBox(THREE, 0.12, wheelY + R + 0.3, 0.12, darkWood, wheelX - 0.2, (wheelY + R + 0.3) / 2, -2.0));
  return g;
}
function makeFlourMill(THREE, M){
  const g = new THREE.Group();
  g.name = 'flourMill';
  const add = (m, parent) => { (parent || g).add(m); return m; };

  // --- Mill body ---
  add(meshBox(THREE, 3.2, 0.3, 2.6, M.stone, 0, 0.15, 0));            // foundation
  add(meshBox(THREE, 3.0, 2.0, 2.4, M.wood, 0, 1.3, 0));              // main walls
  add(meshBox(THREE, 3.06, 0.12, 2.46, M.darkWood, 0, 2.26, 0));      // top trim band
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(meshBox(THREE, 0.16, 2.0, 0.16, M.darkWood, sx * 1.48, 1.3, sz * 1.18)); // corner posts
  }

  // --- Gable roof (two slanted slabs, ridge along X) ---
  const rise = 0.9, half = 1.4;
  const slope = Math.atan(rise / half);
  const slabLen = Math.sqrt(rise * rise + half * half);
  for (const s of [-1, 1]) {
    const slab = add(meshBox(THREE, 3.4, 0.12, slabLen + 0.06, M.shingle, 0, 2.3 + rise / 2, s * half / 2));
    slab.rotation.x = s * slope;
  }
  add(meshBox(THREE, 3.5, 0.1, 0.22, M.darkWood, 0, 3.22, 0));        // ridge cap
  for (const sx of [-1, 1]) {                                         // stepped gable ends
    add(meshBox(THREE, 0.1, 0.3, 1.7, M.darkWood, sx * 1.45, 2.45, 0));
    add(meshBox(THREE, 0.1, 0.3, 0.8, M.darkWood, sx * 1.45, 2.75, 0));
    add(meshBox(THREE, 0.1, 0.15, 0.35, M.darkWood, sx * 1.45, 2.97, 0));
  }

  // --- Chimney ---
  add(meshBox(THREE, 0.4, 1.1, 0.4, M.brick, -1.0, 3.0, -0.55));
  add(meshBox(THREE, 0.5, 0.1, 0.5, M.stone, -1.0, 3.58, -0.55));

  // --- Door, step, windows ---
  add(meshBox(THREE, 0.86, 1.36, 0.05, M.cream, -0.6, 0.98, 1.2));    // door frame
  add(meshBox(THREE, 0.7, 1.25, 0.08, M.darkWood, -0.6, 0.93, 1.21)); // door
  add(meshBox(THREE, 0.06, 0.06, 0.06, M.metal, -0.35, 0.95, 1.27));  // handle
  add(meshBox(THREE, 0.9, 0.15, 0.4, M.stone, -0.6, 0.075, 1.5));     // step
  add(meshBox(THREE, 0.66, 0.66, 0.05, M.cream, 0.7, 1.5, 1.2));      // front window frame
  add(meshBox(THREE, 0.5, 0.5, 0.07, M.black, 0.7, 1.5, 1.21));       // front window
  add(meshBox(THREE, 0.05, 0.66, 0.66, M.cream, -1.5, 1.5, 0));       // side window frame
  add(meshBox(THREE, 0.07, 0.5, 0.5, M.black, -1.51, 1.5, 0));        // side window

  // --- Props: flour sacks and a millstone ---
  add(meshCyl(THREE, 0.16, 0.24, 0.45, 6, M.burlap, 0.35, 0.225, 1.6));
  add(meshCyl(THREE, 0.16, 0.24, 0.45, 6, M.burlap, 0.85, 0.225, 1.7));
  const lyingSack = add(meshCyl(THREE, 0.16, 0.22, 0.45, 6, M.burlap, 0.6, 0.6, 1.65));
  lyingSack.rotation.z = Math.PI / 2;
  const millstone = add(meshCyl(THREE, 0.4, 0.4, 0.14, 10, M.stone, -1.9, 0.38, 0.9));
  millstone.rotation.z = Math.PI / 2 - 0.25;

  // --- Windmill tower ---
  const tx = 2.6, tz = 0.4;
  add(meshCyl(THREE, 0.9, 0.95, 0.4, 8, M.stone, tx, 0.2, tz));       // base ring
  add(meshCyl(THREE, 0.5, 0.8, 3.6, 8, M.cream, tx, 1.8, tz));        // tapered tower
  add(meshCyl(THREE, 0.56, 0.56, 0.12, 8, M.darkWood, tx, 3.6, tz));  // collar
  add(meshCyl(THREE, 0, 0.68, 0.8, 8, M.shingle, tx, 4.05, tz));      // cap (cone)
  add(meshBox(THREE, 0.5, 0.9, 0.12, M.darkWood, tx, 0.85, tz + 0.7)); // tower door
  add(meshBox(THREE, 0.26, 0.32, 0.1, M.black, tx, 2.2, tz + 0.6));   // tower window

  // --- Axle and rotor with 4 box blades ---
  const hubY = 3.2, hubZ = 1.65;
  const axle = add(meshCyl(THREE, 0.07, 0.07, 1.0, 6, M.metal, tx, hubY, 1.2));
  axle.rotation.x = Math.PI / 2;

  const rotor = new THREE.Group();
  rotor.name = 'flourMillRotor';
  rotor.position.set(tx, hubY, hubZ);
  const hub = add(meshCyl(THREE, 0.15, 0.15, 0.2, 8, M.metal, 0, 0, 0), rotor);
  hub.rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Group();
    blade.rotation.z = i * Math.PI / 2;
    add(meshBox(THREE, 0.1, 1.7, 0.05, M.darkWood, 0, 0.85, 0), blade);   // spar
    add(meshBox(THREE, 0.34, 1.25, 0.03, M.white, 0.2, 1.05, 0), blade);  // sail
    add(meshBox(THREE, 0.36, 0.05, 0.04, M.darkWood, 0.2, 1.68, 0), blade); // tip bar
    rotor.add(blade);
  }
  rotor.rotation.z = 0.4;
  g.add(rotor);
  g.userData.rotor = rotor; // spin with rotor.rotation.z += dt

  return g;
}
function makeDairy(THREE, M){
  const g = new THREE.Group();
  g.name = 'dairy';
  const add = (m) => { g.add(m); return m; };
  const W = 4, D = 3.2, base = 0.2, wallH = 2.4, top = base + wallH, rise = 1.2;

  // foundation, step, main body
  add(meshBox(THREE, W + 0.2, base, D + 0.2, M.stone, 0, base / 2, 0));
  add(meshBox(THREE, 1.3, 0.12, 0.5, M.stone, 0, 0.06, D / 2 + 0.3));
  add(meshBox(THREE, W, wallH, D, M.cream, 0, base + wallH / 2, 0));

  // blue trim: base band, top band, corner posts
  add(meshBox(THREE, W + 0.06, 0.26, D + 0.06, M.blue, 0, base + 0.13, 0));
  add(meshBox(THREE, W + 0.06, 0.14, D + 0.06, M.blue, 0, top - 0.07, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(meshBox(THREE, 0.14, wallH, 0.14, M.blue, sx * W / 2, base + wallH / 2, sz * D / 2));
  }

  // gable ends (triangular prism built directly)
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, 0);
  shape.lineTo(W / 2, 0);
  shape.lineTo(0, rise);
  shape.lineTo(-W / 2, 0);
  const gableGeo = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false });
  gableGeo.translate(0, 0, -D / 2);
  const gable = new THREE.Mesh(gableGeo, M.white);
  gable.position.set(0, top, 0);
  add(gable);

  // roof slabs + blue barge boards
  const a = Math.atan2(rise, W / 2), ca = Math.cos(a), sa = Math.sin(a);
  const ov = 0.35, t = 0.1, L = Math.hypot(W / 2, rise) + ov;
  for (const s of [-1, 1]) {
    const mx = W / 4 + ca * ov / 2, my = top + rise / 2 - sa * ov / 2;
    const slab = add(meshBox(THREE, L, t, D + 0.5, M.shingle, s * (mx + sa * t / 2), my + ca * t / 2, 0));
    slab.rotation.z = -s * a;
    for (const sz of [-1, 1]) {
      const barge = add(meshBox(THREE, L, 0.16, 0.06, M.blue, s * (mx - sa * 0.05), my - ca * 0.05, sz * (D / 2 + 0.25)));
      barge.rotation.z = -s * a;
    }
  }
  add(meshBox(THREE, 0.2, 0.12, D + 0.56, M.blue, 0, top + rise + 0.08, 0));

  // chimney
  add(meshBox(THREE, 0.4, 0.9, 0.4, M.brick, 1.1, 3.45, -0.8));
  add(meshBox(THREE, 0.5, 0.08, 0.5, M.stone, 1.1, 3.94, -0.8));

  // door with blue frame
  const fz = D / 2;
  add(meshBox(THREE, 1.0, 1.8, 0.08, M.blue, 0, base + 0.9, fz + 0.02));
  add(meshBox(THREE, 0.8, 1.66, 0.1, M.wood, 0, base + 0.83, fz + 0.04));
  add(meshBox(THREE, 0.8, 0.08, 0.12, M.darkWood, 0, base + 0.55, fz + 0.04));
  add(meshBox(THREE, 0.8, 0.08, 0.12, M.darkWood, 0, base + 1.25, fz + 0.04));
  add(meshBox(THREE, 0.06, 0.14, 0.06, M.metal, 0.28, base + 0.85, fz + 0.11));

  // sign above door
  add(meshBox(THREE, 1.3, 0.3, 0.06, M.blue, 0, 2.25, fz + 0.03));
  add(meshBox(THREE, 1.14, 0.17, 0.08, M.white, 0, 2.25, fz + 0.03));

  // front windows
  for (const s of [-1, 1]) {
    const wx = s * 1.25, wy = 1.55;
    add(meshBox(THREE, 0.8, 0.8, 0.08, M.blue, wx, wy, fz + 0.02));
    add(meshBox(THREE, 0.62, 0.62, 0.1, M.black, wx, wy, fz + 0.02));
    add(meshBox(THREE, 0.05, 0.62, 0.12, M.white, wx, wy, fz + 0.02));
    add(meshBox(THREE, 0.62, 0.05, 0.12, M.white, wx, wy, fz + 0.02));
    add(meshBox(THREE, 0.9, 0.07, 0.16, M.blue, wx, wy - 0.43, fz + 0.05));
  }

  // side windows
  for (const s of [-1, 1]) {
    const sx = s * (W / 2 + 0.02);
    add(meshBox(THREE, 0.08, 0.8, 1.0, M.blue, sx, 1.55, 0));
    add(meshBox(THREE, 0.1, 0.62, 0.82, M.black, sx, 1.55, 0));
    add(meshBox(THREE, 0.12, 0.62, 0.05, M.white, sx, 1.55, 0));
  }

  // round gable window
  const ring = add(meshCyl(THREE, 0.3, 0.3, 0.1, 10, M.blue, 0, top + 0.42, fz));
  ring.rotation.x = Math.PI / 2;
  const pane = add(meshCyl(THREE, 0.21, 0.21, 0.13, 10, M.black, 0, top + 0.42, fz));
  pane.rotation.x = Math.PI / 2;

  // milk cans out front
  const milkCan = (x, z, k) => {
    add(meshCyl(THREE, 0.2 * k, 0.2 * k, 0.5 * k, 10, M.metal, x, 0.25 * k, z));
    add(meshCyl(THREE, 0.11 * k, 0.2 * k, 0.14 * k, 10, M.metal, x, 0.57 * k, z));
    add(meshCyl(THREE, 0.11 * k, 0.11 * k, 0.12 * k, 10, M.metal, x, 0.7 * k, z));
    add(meshCyl(THREE, 0.14 * k, 0.14 * k, 0.04 * k, 10, M.darkMetal, x, 0.78 * k, z));
    add(meshCyl(THREE, 0.04 * k, 0.04 * k, 0.05 * k, 6, M.darkMetal, x, 0.82 * k, z));
    add(meshCyl(THREE, 0.206 * k, 0.206 * k, 0.03 * k, 10, M.darkMetal, x, 0.1 * k, z));
    add(meshCyl(THREE, 0.206 * k, 0.206 * k, 0.03 * k, 10, M.darkMetal, x, 0.42 * k, z));
    for (const s of [-1, 1]) {
      add(meshBox(THREE, 0.03 * k, 0.14 * k, 0.06 * k, M.darkMetal, x + s * 0.19 * k, 0.58 * k, z));
    }
  };
  milkCan(-1.25, D / 2 + 0.55, 1);
  milkCan(-0.75, D / 2 + 0.8, 0.85);

  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
function makeCakeShop(THREE, M){
  const g = new THREE.Group();
  g.name = 'cakeShop';
  const add = m => { g.add(m); return m; };
  const box = (w,h,d,mat,x,y,z) => add(meshBox(THREE,w,h,d,mat,x,y,z));
  const cyl = (rt,rb,h,s,mat,x,y,z) => add(meshCyl(THREE,rt,rb,h,s,mat,x,y,z));
  const ball = (r,mat,x,y,z) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r,10,8), mat);
    m.position.set(x,y,z);
    return add(m);
  };
  const W = 4, H = 2.6, D = 3, F = D/2, Y0 = 0.15;

  // Foundation, walls, trim
  box(W+0.3, Y0, D+0.3, M.white, 0, Y0/2, 0);
  box(W, H, D, M.cream, 0, Y0+H/2, 0);
  box(W+0.04, 0.5, D+0.04, M.pastelPink, 0, Y0+0.25, 0);
  box(W+0.1, 0.14, D+0.1, M.pink, 0, 2.68, 0);
  [-1,1].forEach(sx => [-1,1].forEach(sz =>
    box(0.14, H, 0.14, M.white, sx*W/2, Y0+H/2, sz*F)));

  // Roof slab with icing-like dollops along the front eave
  box(W+0.5, 0.18, D+0.5, M.shingle, 0, 2.84, 0);
  box(W+0.2, 0.06, D+0.2, M.pastelPink, 0, 2.96, 0);
  for (let i = 0; i < 11; i++) ball(0.11, M.white, -2.1+i*0.42, 2.76, F+0.25);

  // Chimney
  box(0.4, 0.7, 0.4, M.pastelPink, 1.5, 3.3, -0.9);
  box(0.5, 0.1, 0.5, M.white, 1.5, 3.7, -0.9);

  // Front door
  box(1.1, 0.1, 0.45, M.darkWood, 0, 0.05, F+0.37);
  box(0.95, 1.8, 0.08, M.white, 0, Y0+0.9, F+0.02);
  box(0.75, 1.65, 0.08, M.wood, 0, Y0+0.825, F+0.05);
  box(0.45, 0.6, 0.04, M.glass, 0, 1.35, F+0.09);
  box(0.55, 0.06, 0.05, M.darkWood, 0, 0.6, F+0.09);
  ball(0.05, M.yellow, 0.27, 0.95, F+0.12);

  // Striped awning over the door (sloped stripes + hanging valance)
  const n = 6, sw = 0.22;
  for (let i = 0; i < n; i++){
    const x = (i-(n-1)/2)*sw;
    const mat = i%2 ? M.white : M.pink;
    const s = box(sw, 0.05, 0.9, mat, x, 1.98, F+0.41);
    s.rotation.x = 0.4;
    box(sw, 0.16, 0.04, i%2 ? M.pink : M.white, x, 1.74, F+0.83);
  }
  box(n*sw+0.06, 0.08, 0.08, M.darkWood, 0, 2.17, F+0.04);

  // Sign board above the awning
  box(1.6, 0.3, 0.06, M.wood, 0, 2.42, F+0.04);
  [M.pink, M.white, M.pastelMint, M.white, M.pink].forEach((m,i) =>
    ball(0.07, m, -0.5+i*0.25, 2.42, F+0.08));

  // Two display windows with mini cakes on the sills
  [-1.25, 1.25].forEach(x => {
    box(1.16, 1.16, 0.08, M.white, x, 1.45, F+0.02);
    box(1.0, 1.0, 0.06, M.glass, x, 1.45, F+0.05);
    box(0.05, 1.0, 0.08, M.white, x, 1.45, F+0.06);
    box(1.3, 0.1, 0.16, M.pastelPink, x, 2.08, F+0.06);
    box(1.3, 0.08, 0.24, M.pastelMint, x, 0.86, F+0.1);
    cyl(0.12, 0.12, 0.12, 10, M.chocolate, x-0.27, 0.96, F+0.14);
    cyl(0.13, 0.13, 0.04, 10, M.pink, x-0.27, 1.04, F+0.14);
    ball(0.035, M.red, x-0.27, 1.09, F+0.14);
    cyl(0.1, 0.12, 0.14, 10, M.cream, x+0.27, 0.97, F+0.14);
    cyl(0.11, 0.11, 0.03, 10, M.white, x+0.27, 1.055, F+0.14);
    ball(0.035, M.yellow, x+0.27, 1.1, F+0.14);
  });

  // Side windows
  [-1,1].forEach(s => {
    box(0.06, 0.96, 1.06, M.white, s*(W/2+0.01), 1.5, 0);
    box(0.06, 0.8, 0.9, M.glass, s*(W/2+0.03), 1.5, 0);
    box(0.2, 0.07, 1.2, M.pastelMint, s*(W/2+0.08), 0.99, 0);
  });

  // Rooftop cake sign: plate, three tiers with icing, dollops, cherry
  cyl(0.85, 0.9, 0.1, 16, M.white, 0, 3.04, 0);
  const tiers = [
    [0.65, 0.40, M.chocolate, M.pink],
    [0.46, 0.34, M.cream, M.white],
    [0.30, 0.28, M.pastelPink, M.white]
  ];
  let y = 3.09;
  tiers.forEach(t => {
    cyl(t[0], t[0], t[1], 16, t[2], 0, y+t[1]/2, 0);
    y += t[1];
    cyl(t[0]+0.04, t[0]+0.04, 0.08, 16, t[3], 0, y, 0);
    y += 0.04;
  });
  for (let i = 0; i < 8; i++){
    const a = i/8*Math.PI*2;
    ball(0.07, M.white, Math.cos(a)*0.57, 3.57, Math.sin(a)*0.57);
  }
  for (let i = 0; i < 6; i++){
    const a = i/6*Math.PI*2 + 0.3;
    ball(0.055, M.pastelMint, Math.cos(a)*0.39, 3.95, Math.sin(a)*0.39);
  }
  ball(0.13, M.red, 0, y+0.12, 0);
  const stem = cyl(0.012, 0.012, 0.16, 5, M.darkWood, 0.03, y+0.3, 0);
  stem.rotation.z = -0.35;

  return g;
}
function makeFenceSegment(THREE, M, length){
  length = (typeof length === 'number' && length > 0) ? length : 4;
  const group = new THREE.Group();
  const railMat = M.wood || M.darkWood;
  const postMat = M.darkWood || M.wood;
  const spans = Math.max(1, Math.round(length / 2));
  const step = length / spans;
  // Posts: one at each end and roughly every 2 units, with slight height/twist variation
  for (let i = 0; i <= spans; i++){
    const h = 1.15 + (i % 2 ? 0.07 : 0);
    const post = meshBox(THREE, 0.16, h, 0.16, postMat, i * step, h / 2, 0);
    post.rotation.y = (i % 2 ? 0.14 : -0.09);
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);
  }
  // Two rails per span, overlapping at the posts and slightly crooked for a rustic look
  const railHeights = [0.42, 0.86];
  for (let s = 0; s < spans; s++){
    const cx = (s + 0.5) * step;
    const zOff = (s % 2 ? -0.05 : 0.05);
    for (let j = 0; j < railHeights.length; j++){
      const rail = meshBox(THREE, step + 0.3, 0.09, 0.07, railMat, cx, railHeights[j], zOff);
      rail.rotation.z = ((s + j) % 2 ? 1 : -1) * 0.025;
      rail.rotation.x = (j % 2 ? 0.08 : -0.06);
      rail.castShadow = true;
      rail.receiveShadow = true;
      group.add(rail);
    }
  }
  return group;
}

function makeNamePlate(THREE, text){
  // Callers sometimes pass (THREE, M, text) — accept both signatures.
  if (text && typeof text === 'object' && arguments.length >= 3) {
    text = arguments[2];
  }
  text = (text === undefined || text === null) ? '' : String(text);
  const group = new THREE.Group();
  const postMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
  const boardMat = new THREE.MeshLambertMaterial({ color: 0x8a5a2b });
  // Post and backing board
  group.add(meshBox(THREE, 0.12, 1.4, 0.12, postMat, 0, 0.7, 0));
  const boardW = 1.6, boardH = 0.4, boardD = 0.06, boardY = 1.2, boardZ = 0.09;
  group.add(meshBox(THREE, boardW, boardH, boardD, boardMat, 0, boardY, boardZ));
  // Canvas with the text
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e8cf9a';
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = '#7a4a1e';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 60);
  const fonts = '"Microsoft YaHei","PingFang SC","Noto Sans SC","SimHei",sans-serif';
  let size = 40;
  ctx.font = 'bold ' + size + 'px ' + fonts;
  while (size > 12 && ctx.measureText(text).width > 232){
    size -= 2;
    ctx.font = 'bold ' + size + 'px ' + fonts;
  }
  ctx.fillStyle = '#5a3210';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34);
  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  // Textured faces on the front and back of the board
  const faceMat = new THREE.MeshLambertMaterial({ map: texture });
  const faceGeo = new THREE.PlaneGeometry(boardW - 0.06, boardH - 0.06);
  const front = new THREE.Mesh(faceGeo, faceMat);
  front.position.set(0, boardY, boardZ + boardD / 2 + 0.002);
  group.add(front);
  const back = new THREE.Mesh(faceGeo, faceMat);
  back.position.set(0, boardY, boardZ - boardD / 2 - 0.002);
  back.rotation.y = Math.PI;
  group.add(back);
  return group;
}
function makePlot(THREE, M, x, z, id){
  var mesh = new THREE.Group();
  var soilMesh = meshBox(THREE, 2.0, 0.12, 2.0, M.dirt, x, 0.06, z);
  soilMesh.receiveShadow = true;
  soilMesh.userData.plotId = id;
  mesh.add(soilMesh);
  if (M.wood){
    var b = [[2.16, 0.08, 0, -1.04], [2.16, 0.08, 0, 1.04], [0.08, 2.0, -1.04, 0], [0.08, 2.0, 1.04, 0]];
    for (var i = 0; i < b.length; i++) mesh.add(meshBox(THREE, b[i][0], 0.18, b[i][1], M.wood, x + b[i][2], 0.09, z + b[i][3]));
  }
  var cropMesh = new THREE.Group();
  cropMesh.position.set(x, 0.12, z);
  mesh.add(cropMesh);
  mesh.userData.plotId = id;
  return {id: id, x: x, z: z, mesh: mesh, soilMesh: soilMesh, cropMesh: cropMesh,
    state: 'untilled', crop: null, watered: false, growT: 0, stage: 0};
}

function setPlotVisual(plot, THREE, M){
  if (!plot) return;
  if (plot.plot && !plot.soilMesh) plot = plot.plot;
  THREE = THREE || window.THREE;
  var st = plot.state, ready = st === 'ready', g = plot.cropMesh;
  if (plot.soilMesh && M) {
    plot.soilMesh.material = st === 'untilled' ? M.dirt : ((plot.watered || st === 'watered') ? M.soilWet : M.soil);
  }
  if (!g) return;
  while (g.children.length){ var c = g.children[0]; g.remove(c); if (c.geometry) c.geometry.dispose(); }
  if (st !== 'planted' && st !== 'growing' && !ready) return;
  var C = setPlotVisual._mats || (setPlotVisual._mats = {});
  function add(geo, hex, px, py, pz){
    var m = new THREE.Mesh(geo, C[hex] || (C[hex] = new THREE.MeshLambertMaterial({color: hex})));
    m.position.set(px, py, pz); m.castShadow = true; g.add(m); return m;
  }
  function box(w, h, d, hex, px, py, pz){ return add(new THREE.BoxGeometry(w, h, d), hex, px, py, pz); }
  function cyl(rt, rb, h, hex, px, py, pz){ return add(new THREE.CylinderGeometry(rt, rb, h, 6), hex, px, py, pz); }
  function sph(r, hex, px, py, pz){ return add(new THREE.SphereGeometry(r, 7, 5), hex, px, py, pz); }
  function cone(r, h, hex, px, py, pz){ return add(new THREE.ConeGeometry(r, h, 6), hex, px, py, pz); }
  function grid(n, sp, fn){
    var k = 0;
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++){
      fn((i - (n - 1) / 2) * sp + Math.sin(k * 7.3) * 0.04, (j - (n - 1) / 2) * sp + Math.cos(k * 4.1) * 0.04, k);
      k++;
    }
  }
  if (st === 'planted'){
    grid(3, 0.6, function(px, pz){
      box(0.03, 0.1, 0.03, 0x4caf50, px, 0.05, pz);
      sph(0.05, 0x66c25a, px + 0.04, 0.11, pz).scale.y = 0.4;
      sph(0.05, 0x66c25a, px - 0.04, 0.11, pz).scale.y = 0.4;
    });
    return;
  }
  var stage = Math.max(0, Math.min(2, plot.stage || 0));
  var s = ready ? 1 : 0.4 + 0.2 * stage;
  var fruit = ready || stage >= 1;
  if (plot.crop === 'carrot'){
    grid(3, 0.6, function(px, pz, k){
      var top = ready ? 0.1 : 0;
      if (ready) cone(0.09, 0.26, 0xf07f1c, px, -0.03, pz).rotation.x = Math.PI;
      for (var i = 0; i < 3; i++){
        var a = i * 2.1 + k;
        var l = cone(0.035 * s + 0.01, 0.34 * s, 0x3fa34a, px + Math.cos(a) * 0.05 * s, top + 0.15 * s, pz + Math.sin(a) * 0.05 * s);
        l.rotation.z = -Math.cos(a) * 0.4; l.rotation.x = Math.sin(a) * 0.4;
      }
    });
  } else if (plot.crop === 'cabbage'){
    grid(3, 0.62, function(px, pz){
      var r = 0.24 * s;
      sph(r * 1.15, 0x2f7d3a, px, r * 0.35, pz).scale.y = 0.45;
      sph(r * 0.8, ready ? 0x9bd67a : 0x5fb35a, px, r * 0.7, pz).scale.y = 0.85;
    });
  } else if (plot.crop === 'tomato'){
    grid(2, 0.9, function(px, pz, k){
      var h = 0.9 * s;
      box(0.04, h + 0.15, 0.04, 0x8a6a3c, px + 0.07, (h + 0.15) / 2, pz);
      cyl(0.025, 0.035, h, 0x2f7d3a, px, h / 2, pz);
      sph(0.22 * s, 0x3c9a45, px, h * 0.55, pz);
      sph(0.17 * s, 0x46a84e, px, h * 0.9, pz);
      if (fruit) for (var i = 0; i < 4; i++){
        var a = i * 1.57 + k;
        sph(ready ? 0.08 : 0.05, 0xe0312b, px + Math.cos(a) * 0.2 * s, h * (0.45 + 0.15 * (i % 2)), pz + Math.sin(a) * 0.2 * s);
      }
    });
  } else if (plot.crop === 'wheat'){
    grid(5, 0.4, function(px, pz, k){
      var h = (0.75 + (k % 3) * 0.06) * s, col = ready ? 0xd9b23c : 0x7fb24a;
      box(0.03, h, 0.03, col, px, h / 2, pz);
      box(0.03, h * 0.85, 0.03, col, px + 0.12, h * 0.425, pz + 0.1).rotation.z = -0.12;
      if (fruit){
        box(0.06, 0.18 * s, 0.06, ready ? 0xe8c85a : 0xa8c060, px, h + 0.07 * s, pz);
        box(0.05, 0.15 * s, 0.05, ready ? 0xe8c85a : 0xa8c060, px + 0.17, h * 0.85 + 0.05 * s, pz + 0.1);
      }
    });
  } else if (plot.crop === 'cotton'){
    grid(3, 0.6, function(px, pz, k){
      var h = 0.6 * s;
      cyl(0.02, 0.03, h, 0x6b4a2b, px, h / 2, pz);
      sph(0.14 * s, 0x3c8a45, px, h * 0.6, pz);
      if (ready){
        sph(0.09, 0xf7f7f2, px, h + 0.05, pz);
        for (var i = 0; i < 3; i++){
          var a = i * 2.1 + k;
          sph(0.08, 0xf7f7f2, px + Math.cos(a) * 0.14, h * (0.55 + 0.12 * i), pz + Math.sin(a) * 0.14);
        }
      }
    });
  } else {
    grid(3, 0.6, function(px, pz){ sph(0.15 * s, 0x4caf50, px, 0.12 * s, pz); });
  }
}

function addTerrainAndLights(THREE, scene, M){
  // Built with THREE directly, so it does not depend on the helper signatures.
  scene.background = new THREE.Color(0x8fd3f4);

  // Lights
  const hemi = new THREE.HemisphereLight(0xcfefff, 0xb5d989, 0.7);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4d6, 0.95);
  sun.position.set(40, 80, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera;
  sc.left = -80; sc.right = 80; sc.top = 80; sc.bottom = -80;
  sc.near = 1; sc.far = 260;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  scene.add(sun.target);

  // Ground
  const grassMat = M.grass;
  const grassDarkMat = M.grassDark || M.grass;
  const ground = new THREE.Mesh(new THREE.BoxGeometry(240, 0.2, 240), grassMat);
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Shared geometries
  const sphereGeo = new THREE.SphereGeometry(1, 20, 14);
  const coneGeo = new THREE.ConeGeometry(1, 1, 10);
  const unitBox = new THREE.BoxGeometry(1, 1, 1);

  // Distant hills around the horizon
  const hillData = [
    [34, 16, 0], [28, 22, 1], [40, 14, 0], [30, 18, 0], [26, 24, 1],
    [38, 15, 0], [32, 20, 0], [27, 23, 1], [42, 13, 0], [30, 17, 0]
  ];
  for (let i = 0; i < hillData.length; i++){
    const d = hillData[i];
    const ang = (i / hillData.length) * Math.PI * 2 + 0.2;
    const r = 128 + (i % 3) * 8;
    const mat = i % 2 === 0 ? grassMat : grassDarkMat;
    const hill = new THREE.Mesh(d[2] ? coneGeo : sphereGeo, mat);
    hill.scale.set(d[0], d[1], d[0]);
    hill.position.set(Math.cos(ang) * r, d[2] ? d[1] / 2 - 2 : -4, Math.sin(ang) * r);
    scene.add(hill);
  }

  // Clouds
  const cloudMat = M.white || M.cloud ||
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
  const cloudPos = [
    [-60, 52, -40], [30, 58, -70], [75, 50, 10],
    [-20, 62, 60], [50, 55, 70], [-85, 57, 30]
  ];
  const puffs = [[0, 0, 0, 5], [5, 1, 1, 4], [-5, 0.5, -1, 3.6], [1.5, 2.5, -0.5, 3.4]];
  for (let i = 0; i < cloudPos.length; i++){
    const g = new THREE.Group();
    for (let j = 0; j < puffs.length; j++){
      const p = puffs[j];
      const s = new THREE.Mesh(sphereGeo, cloudMat);
      s.position.set(p[0], p[1], p[2]);
      s.scale.set(p[3] * 1.3, p[3] * 0.7, p[3]);
      g.add(s);
    }
    g.position.set(cloudPos[i][0], cloudPos[i][1], cloudPos[i][2]);
    g.rotation.y = i * 0.9;
    g.scale.setScalar(1 + (i % 3) * 0.25);
    scene.add(g);
  }

  // Dirt paths (heights differ slightly so the crossings do not z-fight)
  function addPath(x1, z1, x2, z2, width, h){
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const p = new THREE.Mesh(new THREE.BoxGeometry(width, h, len + width), M.dirt);
    p.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
    p.rotation.y = Math.atan2(dx, dz);
    p.receiveShadow = true;
    scene.add(p);
    return p;
  }
  addPath(0, -8, 0, 50, 3, 0.04);
  addPath(-70, 16, 52, 16, 3, 0.05);
  addPath(0, -8, 18, -42, 3, 0.06);

  // Flowers at fixed offsets
  const flowerMats = [0xff5d73, 0xffd23f, 0xffffff, 0xb980ff].map(function(c){
    return new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
  });
  const flowerPos = [
    [3, -4], [-4, 2], [5, 8], [-6, 11], [4, 22],
    [-5, 27], [7, 34], [-3, 41], [12, 12], [-14, 20],
    [22, 20], [-26, 12], [34, 13], [-40, 21], [8, -14],
    [2, -22], [16, -28], [9, -36], [-9, -6], [-12, 36]
  ];
  for (let i = 0; i < flowerPos.length; i++){
    const fx = flowerPos[i][0], fz = flowerPos[i][1];
    const stem = new THREE.Mesh(unitBox, grassDarkMat);
    stem.scale.set(0.05, 0.3, 0.05);
    stem.position.set(fx, 0.15, fz);
    scene.add(stem);
    const bloom = new THREE.Mesh(unitBox, flowerMats[i % flowerMats.length]);
    bloom.scale.set(0.2, 0.14, 0.2);
    bloom.position.set(fx, 0.34, fz);
    bloom.rotation.y = i * 0.7;
    bloom.castShadow = true;
    scene.add(bloom);
  }

  return { ground: ground };
}

function placeHomeAndFields(THREE, scene, M, plots, interactables, colliders, zones){
  // Helper: build a prop, tolerate either an Object3D or a {mesh|group} wrapper,
  // force its X/Z position and make sure it is in the scene.
  function put(label, maker, args, x, z){
    try {
      var out = maker.apply(null, args);
      var obj = out && (out.isObject3D ? out : (out.mesh || out.group || out.object));
      if (!obj || !obj.position) return null;
      obj.position.x = x;
      obj.position.z = z;
      if (!obj.parent) scene.add(obj);
      return obj;
    } catch (e) {
      if (typeof console !== 'undefined') console.warn('placeHomeAndFields: failed to place ' + label, e);
      return null;
    }
  }

  // ---------- 家园 ----------
  put('shed', makeShed, [THREE, M, 0, -22], 0, -22);
  put('scarecrow', makeScarecrow, [THREE, M, 6, -18], 6, -18);
  put('home plate', makeNamePlate, [THREE, M, '家园', -6, -18], -6, -18);

  colliders.push({ min: { x: -5, z: -27 }, max: { x: 5, z: -17 } });
  zones.push({ name: '家园', minX: -16, maxX: 16, minZ: -32, maxZ: -2 });

  // ---------- 大田 ----------
  var crops = ['carrot', 'cabbage', 'tomato', 'wheat', 'cotton'];
  var states = ['untilled', 'tilled', 'planted', 'growing', 'ready'];
  var id = 0;

  for (var b = 0; b < 6; b++) {
    for (var i = 0; i < 8; i++) {
      var x = -42 + b * 14;
      var z = 8 + i * 3.2;

      var plot = makePlot(THREE, M, x, z, 'plot_' + id);
      if (!plot) { id++; continue; }

      if (plot.id === undefined || plot.id === null) plot.id = 'plot_' + id;
      if (typeof plot.x !== 'number') plot.x = x;
      if (typeof plot.z !== 'number') plot.z = z;

      if (plot.mesh && !plot.mesh.parent) scene.add(plot.mesh);
      plots.push(plot);

      // Mixed pattern so the field is not empty.
      var state = states[id % states.length];
      var hasCrop = (state === 'planted' || state === 'growing' || state === 'ready');
      plot.state = state;
      plot.crop = hasCrop ? crops[(b * 2 + i) % crops.length] : null;
      plot.stage = id % 3;
      plot.watered = (id % 2 === 0);

      try {
        setPlotVisual(plot, THREE, M);
      } catch (e) {
        if (typeof console !== 'undefined') console.warn('placeHomeAndFields: setPlotVisual failed for ' + plot.id, e);
      }

      interactables.push({
        type: 'plot',
        id: plot.id,
        position: { x: plot.x, y: 0, z: plot.z },
        radius: 1.6,
        plot: plot
      });

      id++;
    }
  }

  put('field plate', makeNamePlate, [THREE, M, '大田', -20, 4], -20, 4);
  zones.push({ name: '大田', minX: -50, maxX: 20, minZ: 2, maxZ: 36 });
}

function placeAnimals(THREE, scene, M, interactables, colliders, zones){
  // Assumptions: +Z is south; makeFenceSegment builds a segment along local X, centered at origin;
  // makers are called as (THREE, M); makeNamePlate as (THREE, M, text);
  // colliders and zones are AABBs {minX,maxX,minZ,maxZ}.
  const GAP = 3, T = 0.3;

  function addSeg(x, z, len, alongX){
    if (len <= 0.05) return;
    const seg = makeFenceSegment(THREE, M, len);
    seg.position.set(x, 0, z);
    if (!alongX) seg.rotation.y = Math.PI / 2;
    scene.add(seg);
  }

  function addFenceRect(cx, cz, w, d, gateSide){
    const hw = w / 2, hd = d / 2;
    const sides = {
      n: { x: cx,      z: cz - hd, len: w, alongX: true  },
      s: { x: cx,      z: cz + hd, len: w, alongX: true  },
      w: { x: cx - hw, z: cz,      len: d, alongX: false },
      e: { x: cx + hw, z: cz,      len: d, alongX: false }
    };
    for (const key in sides){
      const s = sides[key];
      if (key === gateSide){
        // two shorter pieces with a GAP-wide opening in the middle, no collider
        const part = (s.len - GAP) / 2;
        const off = GAP / 2 + part / 2;
        if (s.alongX){
          addSeg(s.x - off, s.z, part, true);
          addSeg(s.x + off, s.z, part, true);
        } else {
          addSeg(s.x, s.z - off, part, false);
          addSeg(s.x, s.z + off, part, false);
        }
        continue;
      }
      addSeg(s.x, s.z, s.len, s.alongX);
      const hx = s.alongX ? s.len / 2 : T;
      const hz = s.alongX ? T : s.len / 2;
      colliders.push({ minX: s.x - hx, maxX: s.x + hx, minZ: s.z - hz, maxZ: s.z + hz });
    }
  }

  function addPlate(text, x, z){
    const plate = makeNamePlate(THREE, M, text);
    plate.position.set(x, 0, z);
    scene.add(plate);
    return plate;
  }

  function addZone(name, cx, cz, w, d){
    zones.push({ name: name, minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }

  function addAnimals(maker, kind, count, pen){
    for (let i = 0; i < count; i++){
      const mesh = maker(THREE, M);
      const id = kind + '_' + i;
      // spread evenly along X with a little jitter, random Z inside pen
      const fx = (i + 0.5) / count;
      const x = pen.minX + (pen.maxX - pen.minX) * fx + (Math.random() - 0.5) * 0.8;
      const z = pen.minZ + (pen.maxZ - pen.minZ) * Math.random();
      mesh.position.set(
        Math.min(pen.maxX, Math.max(pen.minX, x)),
        mesh.position.y || 0,
        Math.min(pen.maxZ, Math.max(pen.minZ, z))
      );
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.userData = {
        kind: kind,
        id: id,
        pen: { minX: pen.minX, maxX: pen.maxX, minZ: pen.minZ, maxZ: pen.maxZ }
      };
      scene.add(mesh);
      interactables.push({
        type: 'animal',
        id: id,
        position: mesh.position,
        radius: 1.8,
        animal: { kind: kind, id: id },
        mesh: mesh
      });
    }
  }

  // ---------- 鸡舍 ----------
  const coop = makeCoop(THREE, M);
  coop.position.set(52, 0, 8);
  scene.add(coop);
  // building collider from actual bounds (clamped to a sane size around the coop)
  const cb = new THREE.Box3().setFromObject(coop);
  if (isFinite(cb.min.x) && isFinite(cb.max.x)){
    colliders.push({
      minX: Math.max(cb.min.x, 52 - 5), maxX: Math.min(cb.max.x, 52 + 5),
      minZ: Math.max(cb.min.z, 8 - 3.5), maxZ: Math.min(cb.max.z, 8 + 2.5)
    });
  } else {
    colliders.push({ minX: 49.5, maxX: 54.5, minZ: 6, maxZ: 10 });
  }
  addFenceRect(52, 10, 14, 12, 's');
  // chickens roam in the yard area south of the coop building
  addAnimals(makeChicken, 'chicken', 5, { minX: 46.2, maxX: 57.8, minZ: 11.5, maxZ: 15 });
  addPlate('鸡舍', 52 + 3.2, 16 + 0.8);
  addZone('鸡舍', 52, 10, 14, 12);

  // ---------- 鸭塘 ----------
  const pond = makePond(THREE, M);
  pond.position.set(52, 0, 40);
  scene.add(pond);
  addAnimals(makeDuck, 'duck', 4, { minX: 47, maxX: 57, minZ: 35, maxZ: 45 });
  addPlate('鸭塘', 52 + 3.2, 40 + 6.5);
  addZone('鸭塘', 52, 40, 14, 14);

  // ---------- 奶牛牧场 ----------
  addFenceRect(52, 78, 18, 14, 's');
  addAnimals(makeCow, 'cow', 3, { minX: 45, maxX: 59, minZ: 73, maxZ: 83 });
  addPlate('奶牛牧场', 52 + 3.2, 85 + 0.8);
  addZone('奶牛牧场', 52, 78, 18, 14);
}

function placeFactoriesAndShop(THREE, scene, M, interactables, colliders, zones){
  // Assumptions (helper signatures were not given):
  //   makeTextileMill/makeFlourMill/makeDairy/makeCakeShop(THREE, M) -> Object3D (or {group})
  //   makeNamePlate(THREE, text) -> Object3D (sprite or mesh)
  //   collider = {minX,maxX,minZ,maxZ}; zone = {name,x,z,radius,minX,maxX,minZ,maxZ}
  //   building fronts face local +z (as the cake shop door at z=-34 suggests)
  interactables = interactables || [];
  colliders = colliders || [];
  zones = zones || [];

  const asObj = function(r){
    if (r && r.isObject3D) return r;
    if (r && (r.group || r.mesh)) return r.group || r.mesh;
    return new THREE.Group();
  };
  const boundsOf = function(obj){
    obj.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(obj);
  };
  const clamp = function(v, lo, hi){ return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : hi; };
  const addPlate = function(text, x, y, z, rotY){
    let p = null;
    try { p = makeNamePlate(THREE, text); } catch (e) { p = null; }
    if (p && !p.isObject3D) p = p.group || p.mesh || null;
    if (!p) return null;
    p.position.set(x, y, z);
    if (!p.isSprite) p.rotation.y = rotY;
    scene.add(p);
    return p;
  };
  const addMarker = function(x, z){
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.1, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.06, z);
    scene.add(ring);
    return ring;
  };
  const addZone = function(name, x, z, r){
    zones.push({ name: name, x: x, z: z, radius: r, minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r });
  };

  // ---- Factories (west side, fronts turned east toward town) ----
  const FX = -70, HALF = 4, DOOR_OFFSET = 5.5;
  const factories = [
    { id: 'textileMill', factory: 'textile', name: '纺织厂', make: makeTextileMill, z: 16 },
    { id: 'flourMill',   factory: 'flour',   name: '面粉坊', make: makeFlourMill,   z: 46 },
    { id: 'dairy',       factory: 'dairy',   name: '乳品坊', make: makeDairy,       z: 76 }
  ];
  for (let i = 0; i < factories.length; i++){
    const f = factories[i];
    const g = asObj(f.make(THREE, M));
    g.position.set(FX, 0, f.z);
    g.rotation.y = Math.PI / 2; // local +z front -> world +x
    scene.add(g);

    colliders.push({ minX: FX - HALF, maxX: FX + HALF, minZ: f.z - HALF, maxZ: f.z + HALF });

    const top = clamp(boundsOf(g).max.y, 3, 14);
    addPlate(f.name, FX, top + 0.9, f.z, Math.PI / 2);

    // The interaction point sits just outside the collider on the front side.
    // At the building centre it would be unreachable (radius 3.2 < half-size 4).
    const ix = FX + DOOR_OFFSET;
    addMarker(ix, f.z);
    interactables.push({
      type: 'factory',
      id: f.id,
      position: { x: ix, y: 0, z: f.z },
      radius: 3.2,
      factory: f.factory,
      mesh: g
    });

    addZone(f.name, FX, f.z, 12);
  }

  // ---- Cake shop ----
  const SX = 18, SZ = -42;
  const cakeDoor = { x: 18, y: 0, z: -34 };
  const shop = asObj(makeCakeShop(THREE, M));
  shop.position.set(SX, 0, SZ);
  scene.add(shop);

  const sb = boundsOf(shop);
  const hx = clamp((sb.max.x - sb.min.x) / 2, 4, 8);
  const back = clamp(SZ - sb.min.z, 4, 8);
  // Keep the front wall of the collider behind the door point so the door stays reachable.
  const frontZ = Math.min(isFinite(sb.max.z) ? sb.max.z : SZ + 6, cakeDoor.z - 1.2);
  colliders.push({ minX: SX - hx, maxX: SX + hx, minZ: SZ - back, maxZ: Math.max(frontZ, SZ + 3) });

  const shopTop = clamp(sb.max.y, 3, 14);
  addPlate('阳光蛋糕店', SX, shopTop + 0.9, SZ, 0);
  addMarker(cakeDoor.x, cakeDoor.z);

  interactables.push({
    type: 'shop',
    id: 'cakeShop',
    position: { x: cakeDoor.x, y: 0, z: cakeDoor.z },
    radius: 3.2,
    shop: 'cake',
    mesh: shop
  });

  addZone('阳光蛋糕店', SX, (SZ + cakeDoor.z) / 2, 13);

  return { cakeDoor: cakeDoor };
}

function createWorld(THREE, scene){
  var M = mats(THREE);
  var plots=[], interactables=[], colliders=[], zones=[];
  addTerrainAndLights(THREE, scene, M);
  placeHomeAndFields(THREE, scene, M, plots, interactables, colliders, zones);
  placeAnimals(THREE, scene, M, interactables, colliders, zones);
  var shop = placeFactoriesAndShop(THREE, scene, M, interactables, colliders, zones);
  var spawn = {x:0, y:0, z:-8};
  var cakeDoor = (shop && shop.cakeDoor) ? shop.cakeDoor : {x:18,y:0,z:-34};
  var now = 0;

  function initVelocity(ud){
    var a = Math.random() * Math.PI * 2;
    ud.vx = Math.cos(a) * 1.2;
    ud.vz = Math.sin(a) * 1.2;
  }

  function update(dt){
    if (!(dt > 0)) return;
    if (dt > 0.1) dt = 0.1;
    now += dt;
    var spun = [];
    for (var i = 0; i < interactables.length; i++){
      var it = interactables[i];
      if (!it || !it.mesh) continue;
      var mesh = it.mesh;
      var ud = mesh.userData || (mesh.userData = {});

      if (it.type === 'animal'){
        var pen = ud.pen;
        if (!pen){
          pen = ud.pen = {
            minX: mesh.position.x - 2, maxX: mesh.position.x + 2,
            minZ: mesh.position.z - 2, maxZ: mesh.position.z + 2
          };
        }
        if (typeof ud.vx !== 'number' || typeof ud.vz !== 'number') initVelocity(ud);

        var x = mesh.position.x + ud.vx * dt;
        var z = mesh.position.z + ud.vz * dt;
        if (x < pen.minX){ x = pen.minX; ud.vx = Math.abs(ud.vx); }
        else if (x > pen.maxX){ x = pen.maxX; ud.vx = -Math.abs(ud.vx); }
        if (z < pen.minZ){ z = pen.minZ; ud.vz = Math.abs(ud.vz); }
        else if (z > pen.maxZ){ z = pen.maxZ; ud.vz = -Math.abs(ud.vz); }

        mesh.position.x = x;
        mesh.position.z = z;
        mesh.rotation.y = Math.atan2(ud.vx, ud.vz);

        var kind = it.kind || ud.kind;
        var phase = (typeof it.id === 'number') ? it.id : i;
        mesh.position.y = (kind === 'duck') ? 0.05 + Math.sin(now * 2 + phase) * 0.04 : 0;

        if (it.position){
          it.position.x = x;
          it.position.z = z;
        }
      }

      var rotor = ud.rotor;
      if (!rotor && mesh.parent && mesh.parent.userData) rotor = mesh.parent.userData.rotor;
      if (rotor && rotor.rotation && spun.indexOf(rotor) === -1){
        spun.push(rotor);
        rotor.rotation.z += dt * 0.6;
      }
    }
  }

  return {
    spawn: spawn,
    cakeDoor: cakeDoor,
    plots: plots,
    interactables: interactables,
    colliders: colliders,
    zones: zones,
    update: update,
    setPlotVisual: function(p){ setPlotVisual(p, THREE, M); }
  };
}

  window.World = { createWorld, setPlotVisual };
})();
