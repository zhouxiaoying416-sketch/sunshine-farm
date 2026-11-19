(function(){
  'use strict';
  const THREE = window.THREE;

  function createFarmer(THREE){
    THREE = THREE || window.THREE;
    const group = new THREE.Group();
    group.name = 'farmer';

    function mat(color){
      return new THREE.MeshLambertMaterial({ color: color, flatShading: true });
    }
    const M = {
      skin: mat(0xf2c9a0),
      shirt: mat(0xf4efe0),
      overalls: mat(0x8a5a2b),
      boots: mat(0x3b2616),
      straw: mat(0xe8c85a),
      band: mat(0xb5442e),
      dark: mat(0x2a1c12),
      cheek: mat(0xee9f8e),
      button: mat(0xf0d060)
    };

    function mesh(geo, material, x, y, z, parent){
      const m = new THREE.Mesh(geo, material);
      m.position.set(x || 0, y || 0, z || 0);
      m.castShadow = true;
      m.receiveShadow = true;
      (parent || group).add(m);
      return m;
    }

    // ----- Legs (pivot at hip) -----
    function makeLeg(name, side){
      const leg = new THREE.Group();
      leg.name = name;
      leg.position.set(side * 0.15, 0.72, 0);
      mesh(new THREE.BoxGeometry(0.22, 0.56, 0.24), M.overalls, 0, -0.28, 0, leg);
      mesh(new THREE.BoxGeometry(0.25, 0.18, 0.36), M.boots, 0, -0.63, 0.05, leg);
      mesh(new THREE.BoxGeometry(0.26, 0.05, 0.38), M.dark, 0, -0.705, 0.05, leg);
      group.add(leg);
      return leg;
    }
    makeLeg('leftLeg', 1);
    makeLeg('rightLeg', -1);

    // ----- Torso -----
    const body = new THREE.Group();
    body.name = 'body';
    group.add(body);

    // hips (overalls)
    mesh(new THREE.BoxGeometry(0.56, 0.2, 0.34), M.overalls, 0, 0.78, 0, body);
    // shirt
    mesh(new THREE.BoxGeometry(0.54, 0.44, 0.32), M.shirt, 0, 1.0, 0, body);
    // overall bib front and back
    mesh(new THREE.BoxGeometry(0.36, 0.3, 0.04), M.overalls, 0, 0.98, 0.175, body);
    mesh(new THREE.BoxGeometry(0.36, 0.22, 0.04), M.overalls, 0, 0.95, -0.175, body);
    // straps
    mesh(new THREE.BoxGeometry(0.07, 0.2, 0.36), M.overalls, 0.14, 1.14, 0, body);
    mesh(new THREE.BoxGeometry(0.07, 0.2, 0.36), M.overalls, -0.14, 1.14, 0, body);
    // buttons
    mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), M.button, 0.14, 1.1, 0.2, body);
    mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), M.button, -0.14, 1.1, 0.2, body);
    // pocket
    mesh(new THREE.BoxGeometry(0.16, 0.1, 0.02), M.dark, 0, 0.96, 0.2, body);
    // neck
    mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.08, 6), M.skin, 0, 1.25, 0, body);

    // ----- Arms (pivot at shoulder) -----
    function makeArm(name, side){
      const arm = new THREE.Group();
      arm.name = name;
      arm.position.set(side * 0.36, 1.18, 0);
      mesh(new THREE.BoxGeometry(0.17, 0.26, 0.19), M.shirt, 0, -0.1, 0, arm);
      mesh(new THREE.BoxGeometry(0.14, 0.24, 0.16), M.skin, 0, -0.33, 0, arm);
      mesh(new THREE.BoxGeometry(0.16, 0.13, 0.18), M.skin, 0, -0.49, 0, arm);
      arm.rotation.z = side * 0.08;
      group.add(arm);
      return arm;
    }
    makeArm('leftArm', 1);
    makeArm('rightArm', -1);

    // ----- Head (slightly oversized) -----
    const head = new THREE.Group();
    head.name = 'head';
    head.position.set(0, 1.47, 0);
    group.add(head);

    mesh(new THREE.BoxGeometry(0.52, 0.44, 0.46), M.skin, 0, 0, 0, head);
    // eyes
    mesh(new THREE.BoxGeometry(0.06, 0.09, 0.03), M.dark, 0.12, 0.03, 0.235, head);
    mesh(new THREE.BoxGeometry(0.06, 0.09, 0.03), M.dark, -0.12, 0.03, 0.235, head);
    // nose
    mesh(new THREE.BoxGeometry(0.07, 0.07, 0.06), M.cheek, 0, -0.04, 0.25, head);
    // smile
    mesh(new THREE.BoxGeometry(0.16, 0.03, 0.02), M.dark, 0, -0.13, 0.235, head);
    mesh(new THREE.BoxGeometry(0.03, 0.04, 0.02), M.dark, 0.09, -0.11, 0.235, head);
    mesh(new THREE.BoxGeometry(0.03, 0.04, 0.02), M.dark, -0.09, -0.11, 0.235, head);
    // cheeks
    mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), M.cheek, 0.19, -0.07, 0.232, head);
    mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), M.cheek, -0.19, -0.07, 0.232, head);
    // ears
    mesh(new THREE.BoxGeometry(0.05, 0.12, 0.1), M.skin, 0.28, 0, 0, head);
    mesh(new THREE.BoxGeometry(0.05, 0.12, 0.1), M.skin, -0.28, 0, 0, head);
    // hair tuft at back
    mesh(new THREE.BoxGeometry(0.5, 0.2, 0.06), M.dark, 0, 0.08, -0.25, head);

    // ----- Straw hat -----
    const hat = new THREE.Group();
    hat.name = 'hat';
    hat.position.set(0, 0.22, 0);
    hat.rotation.x = -0.06;
    head.add(hat);
    mesh(new THREE.CylinderGeometry(0.56, 0.6, 0.04, 10), M.straw, 0, 0.0, 0, hat);
    mesh(new THREE.CylinderGeometry(0.24, 0.31, 0.16, 8), M.straw, 0, 0.09, 0, hat);
    mesh(new THREE.CylinderGeometry(0.315, 0.32, 0.05, 8), M.band, 0, 0.045, 0, hat);

    group.traverse(function(o){
      if (o.isMesh){ o.castShadow = true; }
    });

    return group;
  }

  function createController(opts){
    opts = opts || {};
    const T = opts.THREE || window.THREE;
    const renderer = opts.renderer || null;
    const camera = opts.camera || null;
    const farmer = opts.farmer || null;
    const getColliders = typeof opts.getColliders === 'function' ? opts.getColliders : function(){ return []; };
    const onInteract = typeof opts.onInteract === 'function' ? opts.onInteract : function(){};
    const isEnabledFn = typeof opts.isEnabled === 'function' ? opts.isEnabled : null;

    const canvas = document.getElementById('game') || (renderer && renderer.domElement) || document.body;

    // Tunables
    const SPEED = 6;
    const JUMP_VELOCITY = 8.5;
    const GRAVITY = 24;
    const RADIUS = 0.4;
    const WORLD_LIMIT = 118;
    const CAM_DISTANCE = 7;
    const CAM_HEIGHT = 3.2;
    const LOOK_HEIGHT = 1.5;
    const PITCH_MIN = -0.2;
    const PITCH_MAX = 1.25;
    const MOUSE_SENS = 0.0025;
    const DRAG_THRESHOLD = 5;

    // State
    const pos = new T.Vector3(0, 0, 0);
    if (farmer){ pos.copy(farmer.position); }
    let velY = 0;
    let onGround = true;
    let yaw = 0;
    let pitch = Math.asin(Math.max(-1, Math.min(1, (CAM_HEIGHT - LOOK_HEIGHT) / CAM_DISTANCE)));
    let facing = farmer ? farmer.rotation.y : 0;
    let enabled = true;
    let walkPhase = 0;
    let walkBlend = 0;
    let time = 0;
    let jumpQueued = false;

    const keys = Object.create(null);
    let mouseDown = false;
    let dragDist = 0;
    let lastMX = 0;
    let lastMY = 0;

    const camTarget = new T.Vector3(pos.x, pos.y + LOOK_HEIGHT, pos.z);
    const tmpBox = T.Box3 ? new T.Box3() : null;

    const parts = {
      leftArm: farmer ? farmer.getObjectByName('leftArm') : null,
      rightArm: farmer ? farmer.getObjectByName('rightArm') : null,
      leftLeg: farmer ? farmer.getObjectByName('leftLeg') : null,
      rightLeg: farmer ? farmer.getObjectByName('rightLeg') : null
    };
    const armRestZ = {
      left: parts.leftArm ? parts.leftArm.rotation.z : 0,
      right: parts.rightArm ? parts.rightArm.rotation.z : 0
    };

    function inputActive(){
      if (!enabled) return false;
      if (isEnabledFn){
        try { if (isEnabledFn() === false) return false; } catch (e) { /* ignore */ }
      }
      return true;
    }

    function isLocked(){
      return document.pointerLockElement === canvas;
    }

    function requestPointerLock(){
      if (!canvas || typeof canvas.requestPointerLock !== 'function') return false;
      try {
        const p = canvas.requestPointerLock();
        if (p && typeof p.catch === 'function'){ p.catch(function(){}); }
        return true;
      } catch (e) {
        return false;
      }
    }

    function clampPitch(){
      if (pitch < PITCH_MIN) pitch = PITCH_MIN;
      if (pitch > PITCH_MAX) pitch = PITCH_MAX;
    }

    function isTypingTarget(t){
      if (!t || !t.tagName) return false;
      const tag = t.tagName.toUpperCase();
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable === true;
    }

    function clearKeys(){
      for (const k in keys){ keys[k] = false; }
      jumpQueued = false;
    }

    // ----- Input handlers -----
    function onKeyDown(e){
      if (isTypingTarget(e.target)) return;
      const code = e.code || '';
      if (!inputActive()) return;
      if (code === 'Space' || code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight'){
        e.preventDefault();
      }
      if (code === 'Space' && !e.repeat){ jumpQueued = true; }
      if (code === 'KeyE' && !e.repeat){
        try { onInteract(); } catch (err) { if (window.console) console.error(err); }
      }
      keys[code] = true;
    }

    function onKeyUp(e){
      keys[e.code || ''] = false;
    }

    function onMouseDown(e){
      if (e.button !== 0) return;
      mouseDown = true;
      dragDist = 0;
      lastMX = e.clientX;
      lastMY = e.clientY;
    }

    function onMouseMove(e){
      if (isLocked()){
        if (!inputActive()) return;
        yaw -= (e.movementX || 0) * MOUSE_SENS;
        pitch += (e.movementY || 0) * MOUSE_SENS;
        clampPitch();
        return;
      }
      if (mouseDown){
        const dx = e.clientX - lastMX;
        const dy = e.clientY - lastMY;
        lastMX = e.clientX;
        lastMY = e.clientY;
        dragDist += Math.abs(dx) + Math.abs(dy);
        if (!inputActive()) return;
        if (dragDist > DRAG_THRESHOLD){
          yaw -= dx * MOUSE_SENS * 1.6;
          pitch += dy * MOUSE_SENS * 1.6;
          clampPitch();
        }
      }
    }

    function onMouseUp(e){
      if (e.button !== 0) return;
      if (!mouseDown) return;
      mouseDown = false;
      const wasDrag = dragDist > DRAG_THRESHOLD;
      dragDist = 0;
      if (wasDrag) return;
      if (!inputActive()) return;
      if (isLocked()){
        try { onInteract(); } catch (err) { if (window.console) console.error(err); }
      } else {
        const ok = requestPointerLock();
        if (!ok){
          try { onInteract(); } catch (err) { if (window.console) console.error(err); }
        }
      }
    }

    function onBlur(){
      clearKeys();
      mouseDown = false;
    }

    function onContextMenu(e){
      e.preventDefault();
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onBlur);
    canvas.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('pointerlockchange', function(){
      mouseDown = false;
      dragDist = 0;
    });

    // ----- Collision helpers -----
    function getBounds(c){
      if (!c) return null;
      if (c.isObject3D && tmpBox){
        tmpBox.setFromObject(c);
        if (tmpBox.isEmpty && tmpBox.isEmpty()) return null;
        return tmpBox;
      }
      if (c.box && c.box.min && c.box.max) return c.box;
      if (c.min && c.max) return c;
      if (c.minX != null || c.minZ != null){
        return {
          min: { x: c.minX, y: c.minY != null ? c.minY : 0, z: c.minZ },
          max: { x: c.maxX, y: c.maxY != null ? c.maxY : 3, z: c.maxZ }
        };
      }
      return null;
    }

    function finite(v){
      return typeof v === 'number' && isFinite(v);
    }

    function resolveCollisions(){
      let list;
      try { list = getColliders(); } catch (e) { list = null; }
      let groundY = 0;
      if (!list || !list.length) return groundY;

      for (let pass = 0; pass < 2; pass++){
        for (let i = 0; i < list.length; i++){
          const b = getBounds(list[i]);
          if (!b) continue;
          const minX = b.min.x, maxX = b.max.x, minZ = b.min.z, maxZ = b.max.z;
          if (!finite(minX) || !finite(maxX) || !finite(minZ) || !finite(maxZ)) continue;

          const topY = finite(b.max.y) ? b.max.y : Infinity;
          const bottomY = finite(b.min.y) ? b.min.y : -Infinity;

          // Above the collider: can stand on it instead of being pushed out
          if (pos.y >= topY - 0.12){
            if (pos.x > minX - RADIUS * 0.5 && pos.x < maxX + RADIUS * 0.5 &&
                pos.z > minZ - RADIUS * 0.5 && pos.z < maxZ + RADIUS * 0.5){
              if (topY > groundY) groundY = topY;
            }
            continue;
          }
          // Entirely below a floating collider
          if (pos.y + 1.8 <= bottomY) continue;

          const eMinX = minX - RADIUS, eMaxX = maxX + RADIUS;
          const eMinZ = minZ - RADIUS, eMaxZ = maxZ + RADIUS;
          if (pos.x > eMinX && pos.x < eMaxX && pos.z > eMinZ && pos.z < eMaxZ){
            const dl = pos.x - eMinX;
            const dr = eMaxX - pos.x;
            const db = pos.z - eMinZ;
            const df = eMaxZ - pos.z;
            const m = Math.min(dl, dr, db, df);
            if (m === dl) pos.x = eMinX;
            else if (m === dr) pos.x = eMaxX;
            else if (m === db) pos.z = eMinZ;
            else pos.z = eMaxZ;
          }
        }
      }
      return groundY;
    }

    function angleLerp(a, b, t){
      let d = b - a;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      return a + d * t;
    }

    // ----- Update -----
    function update(dt){
      if (!finite(dt) || dt <= 0) dt = 0.016;
      if (dt > 0.1) dt = 0.1;
      time += dt;

      const active = inputActive();
      let mx = 0, mz = 0;

      if (active){
        if (keys.KeyW || keys.ArrowUp) mz += 1;
        if (keys.KeyS || keys.ArrowDown) mz -= 1;
        if (keys.KeyD || keys.ArrowRight) mx += 1;
        if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      } else {
        jumpQueued = false;
      }

      let moving = false;
      if (mx !== 0 || mz !== 0){
        const len = Math.sqrt(mx * mx + mz * mz);
        mx /= len; mz /= len;
        const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
        const rx = Math.cos(yaw), rz = -Math.sin(yaw);
        const dx = fx * mz + rx * mx;
        const dz = fz * mz + rz * mx;
        pos.x += dx * SPEED * dt;
        pos.z += dz * SPEED * dt;
        const targetFacing = Math.atan2(dx, dz);
        facing = angleLerp(facing, targetFacing, Math.min(1, dt * 12));
        moving = true;
      }

      // Jump
      if (active && jumpQueued && onGround){
        velY = JUMP_VELOCITY;
        onGround = false;
      }
      jumpQueued = false;

      // Gravity
      velY -= GRAVITY * dt;
      pos.y += velY * dt;

      // World bounds
      const lim = WORLD_LIMIT - 0.01;
      if (pos.x > lim) pos.x = lim;
      if (pos.x < -lim) pos.x = -lim;
      if (pos.z > lim) pos.z = lim;
      if (pos.z < -lim) pos.z = -lim;

      // Colliders and ground
      const groundY = resolveCollisions();
      if (pos.x > lim) pos.x = lim;
      if (pos.x < -lim) pos.x = -lim;
      if (pos.z > lim) pos.z = lim;
      if (pos.z < -lim) pos.z = -lim;

      if (pos.y <= groundY){
        pos.y = groundY;
        velY = 0;
        onGround = true;
      } else {
        onGround = false;
      }

      // Animation
      const targetBlend = moving ? 1 : 0;
      walkBlend += (targetBlend - walkBlend) * Math.min(1, dt * 10);
      if (moving){
        walkPhase += dt * 10;
      } else if (walkBlend < 0.02){
        walkPhase = 0;
      }

      const swing = Math.sin(walkPhase) * 0.75 * walkBlend;
      const idle = Math.sin(time * 2.2);
      const airborne = onGround ? 0 : 1;

      if (parts.leftLeg) parts.leftLeg.rotation.x = swing + airborne * 0.25;
      if (parts.rightLeg) parts.rightLeg.rotation.x = -swing - airborne * 0.25;
      if (parts.leftArm){
        parts.leftArm.rotation.x = -swing * 0.9 + idle * 0.04 * (1 - walkBlend);
        parts.leftArm.rotation.z = armRestZ.left + airborne * 0.5 + idle * 0.02 * (1 - walkBlend);
      }
      if (parts.rightArm){
        parts.rightArm.rotation.x = swing * 0.9 - idle * 0.04 * (1 - walkBlend);
        parts.rightArm.rotation.z = armRestZ.right - airborne * 0.5 - idle * 0.02 * (1 - walkBlend);
      }

      if (farmer){
        let bob = 0;
        if (onGround){
          bob = idle * 0.02 * (1 - walkBlend) + Math.abs(Math.sin(walkPhase)) * 0.06 * walkBlend;
        }
        farmer.position.set(pos.x, pos.y + bob, pos.z);
        farmer.rotation.y = facing;
      }

      // Camera follow
      if (camera){
        const follow = Math.min(1, dt * 14);
        camTarget.x += (pos.x - camTarget.x) * follow;
        camTarget.y += (pos.y + LOOK_HEIGHT - camTarget.y) * follow;
        camTarget.z += (pos.z - camTarget.z) * follow;

        const cp = Math.cos(pitch);
        const sp = Math.sin(pitch);
        let cx = camTarget.x + Math.sin(yaw) * cp * CAM_DISTANCE;
        let cy = camTarget.y + sp * CAM_DISTANCE;
        let cz = camTarget.z + Math.cos(yaw) * cp * CAM_DISTANCE;
        if (cy < 0.35) cy = 0.35;
        camera.position.set(cx, cy, cz);
        camera.lookAt(camTarget.x, camTarget.y, camTarget.z);
      }
    }

    function setEnabled(b){
      enabled = !!b;
      if (!enabled){
        clearKeys();
        mouseDown = false;
      }
    }

    function getPosition(){
      return pos.clone();
    }

    function setPosition(x, y, z){
      if (x && typeof x === 'object'){
        z = x.z; y = x.y; x = x.x;
      }
      pos.set(finite(x) ? x : 0, finite(y) ? y : 0, finite(z) ? z : 0);
      velY = 0;
      onGround = pos.y <= 0;
      camTarget.set(pos.x, pos.y + LOOK_HEIGHT, pos.z);
      if (farmer){ farmer.position.copy(pos); }
    }

    function getYaw(){
      return yaw;
    }

    return {
      update: update,
      setEnabled: setEnabled,
      getPosition: getPosition,
      setPosition: setPosition,
      getYaw: getYaw,
      requestPointerLock: requestPointerLock
    };
  }

  window.Player = { createFarmer, createController };
})();
