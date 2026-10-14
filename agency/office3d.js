/* Lantai kantor 3D (low-poly isometrik, three.js). Dimuat malas oleh index.html lewat import().
   Tidak menduplikasi logika data: semua status, nama, tampilan karakter, pilihan pegawai dan drawer
   dibaca/dipanggil lewat jembatan window.OFFICE yang disediakan index.html. */
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

const O = () => window.OFFICE;

/* ---------------- palet kantor ---------------- */
const MADU = "#ffc93c", MADU_TUA = "#e0a000", ARANG = "#2a2420", KRIM = "#fff4cf", MUDA = "#ff6f91", LANGIT = "#bfe6ff";
const PAL = {
  light: {floorA: "#fff4cf", floorB: "#fbe6a2", meetA: "#e6f4ff", meetB: "#cfe9fb", pantA: "#fff0c2", pantB: "#f8dc94", slab: MADU_TUA, wall: LANGIT, wallB: MADU, trim: "#fffaf0",
    desk: "#f4cf7a", deskEdge: MADU_TUA, leg: ARANG, chair: MUDA, chairB: "#d9557a", bezel: ARANG, glass: "#e8f6ff", counter: "#fffaf0", counterTop: MADU, fridge: "#f2f6f9", pot: "#e0a000",
    leaf: "#58b36e", leaf2: "#7bcf86", wood: "#c98a4b", sofa: MUDA, rug: MADU, rugB: KRIM, win: "#e6f6ff", light: 1.0, hemi: 1.05},
  dark: {floorA: "#3a312a", floorB: "#332b25", meetA: "#2c3640", meetB: "#27303a", pantA: "#3d3227", pantB: "#352c22", slab: "#15110e", wall: "#463a31", wallB: MADU, trim: "#5a4b3f",
    desk: "#7a5f43", deskEdge: MADU_TUA, leg: "#17120f", chair: "#e0587d", chairB: "#b8436a", bezel: "#15110e", glass: "#34495a", counter: "#4d4036", counterTop: MADU_TUA, fridge: "#8d98a1", pot: "#b88200",
    leaf: "#4a9a60", leaf2: "#66b676", wood: "#9b6b3a", sofa: "#c24d72", rug: "#6b5314", rugB: ARANG, win: "#2d4a63", light: .55, hemi: .62},
};
const FLOOR_TILE = 2;                 /* ubin lantai 2 x 2 satuan */
const COLS = 6, CELL = 5, SPEED = 6.2;

/* ---------------- util ---------------- */
const geoC = new Map(), matC = new Map(), TM = {};
const G = (w, h, d) => { const k = w + "|" + h + "|" + d; let g = geoC.get(k); if (!g) { g = new THREE.BoxGeometry(w, h, d); geoC.set(k, g); } return g; };
const cm = c => { let m = matC.get(c); if (!m) { m = new THREE.MeshStandardMaterial({color: c, roughness: .9}); matC.set(c, m); } return m; };
const bm = c => { const k = "b" + c; let m = matC.get(k); if (!m) { m = new THREE.MeshBasicMaterial({color: c}); matC.set(k, m); } return m; };
const TH = k => { if (!TM[k]) TM[k] = new THREE.MeshStandardMaterial({roughness: .88}); return TM[k]; };
let dark = false;
const pal = () => dark ? PAL.dark : PAL.light;
function applyPal() { const P = pal(); Object.keys(P).forEach(k => { if (typeof P[k] === "string") TH(k).color.set(P[k]); }); TH("glass").transparent = true; TH("glass").opacity = dark ? .38 : .42; TH("glass").roughness = .2; }
function mesh(w, h, d, mat, x, y, z, parent, shadow = true) {
  const m = new THREE.Mesh(G(w, h, d), typeof mat === "string" ? TH(mat) : mat);
  m.position.set(x, y, z); if (shadow) { m.castShadow = true; m.receiveShadow = true; } else m.receiveShadow = true; if (parent) parent.add(m); return m;
}
const lerp = (a, b, k) => a + (b - a) * k;
const angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- state modul ---------------- */
let host, canvas, lblLayer, renderer, scene, cam, ctl, ro, io, root, crew, hemi, sun, ring, ringSel, pad;
let running = false, visible = true, raf = 0, dirty = true, tPrev = 0, tAcc = 0, lastDraw = 0, moved = false;
let lay = null, sigL = "", hoverId = null, selId = null, down = null, fitted = false, userMoved = false;
let chars = new Map(), hits = [], desks = new Map(), screens = new Map(), envs = [], labels = new Map(), signTex = [], floorTex = [];
const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(), v3 = new THREE.Vector3();
let W = 46, D = 36, XVL = 30.8;

/* ---------------- tekstur ---------------- */
function texChecker(a, b, w, d) {
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  g.fillStyle = a; g.fillRect(0, 0, 128, 128); g.fillStyle = b; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64);
  g.strokeStyle = "rgba(42,36,32,.07)"; g.lineWidth = 2; g.strokeRect(1, 1, 126, 126);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / (FLOOR_TILE * 2), d / (FLOOR_TILE * 2)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function svgImg(markup, cb) {
  if (!markup) return;
  const m = markup.replace(/<svg /, '<svg width="692" height="200" ');
  const im = new Image(); im.onload = () => cb(im); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(m);
}
function drawPlate(c, tex, withText) {
  const g = c.getContext("2d"), w = c.width, h = c.height, P = dark;
  g.clearRect(0, 0, w, h);
  const r = h * .16; g.fillStyle = P ? ARANG : KRIM; g.strokeStyle = MADU; g.lineWidth = h * .035;
  g.beginPath(); g.roundRect(h * .02, h * .02, w - h * .04, h - h * .04, r); g.fill(); g.stroke();
  svgImg(O().logoSvg(dark), im => { const lw = w * .78, lh = lw * 200 / 692, ly = withText ? h * .12 : (h - lh) / 2; g.drawImage(im, (w - lw) / 2, ly, lw, lh);
    if (withText) { g.fillStyle = P ? KRIM : ARANG; g.font = `600 ${h * .1}px Inter, system-ui, sans-serif`; g.textAlign = "center"; g.fillText("Briefs in, work out.", w / 2, h * .9); }
    tex.needsUpdate = true; if (running) dirty = true; });
}
function plateTex(wpx, hpx, withText) {
  const c = document.createElement("canvas"); c.width = wpx; c.height = hpx; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData = {c, withText}; drawPlate(c, t, withText); signTex.push(t); return t;
}
function textTex(txt, wpx, hpx, bg, fg, font) {
  const c = document.createElement("canvas"); c.width = wpx; c.height = hpx; const g = c.getContext("2d");
  g.fillStyle = bg; g.beginPath(); g.roundRect(2, 2, wpx - 4, hpx - 4, hpx * .22); g.fill();
  g.fillStyle = fg; g.font = font || `700 ${hpx * .5}px Inter, system-ui, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, wpx / 2, hpx / 2 + hpx * .04);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function screenTex(kind, f) {
  const c = document.createElement("canvas"); c.width = 64; c.height = 40; const g = c.getContext("2d");
  const bgc = {kerja: "#10261b", riset: "#13294a", menunggu: "#2a3150", idle: "#3a3948", off: "#14121a"}[kind];
  g.fillStyle = bgc; g.fillRect(0, 0, 64, 40);
  if (kind === "kerja") { g.fillStyle = "#7dffb0"; for (let i = 0; i < 5; i++) g.fillRect(6, 6 + i * 6, 10 + ((f + i * 3) % 5) * 8, 3); }
  else if (kind === "riset") { g.fillStyle = "#7fc0ff"; g.fillRect(6, 6, 50, 3); g.fillRect(6, 14, 30, 3); g.fillStyle = "#fff"; g.fillRect(6, 24, 8 + f * 8, 3); g.fillRect(6, 31, 26, 3); }
  else if (kind === "menunggu") { g.fillStyle = f ? "#c9d4ff" : "#6d87d6"; g.fillRect(28, 12, 8, 16); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const SCR = {};
function scrMat(kind, f) { const k = kind + (kind === "kerja" || kind === "riset" || kind === "menunggu" ? f % (kind === "riset" ? 4 : 2) : 0); if (!SCR[k]) SCR[k] = new THREE.MeshBasicMaterial({map: screenTex(kind, f % (kind === "riset" ? 4 : 2))}); return SCR[k]; }

/* ---------------- tata letak ---------------- */
function orderStaff() {
  const o = O(), Z = o.zonaUrut;
  return [...o.staff.values()].filter(p => p.id !== o.MGR_ID).sort((a, b) => {
    const za = Z.indexOf(o.zonaDari(a)), zb = Z.indexOf(o.zonaDari(b));
    return (b.core ? 1 : 0) - (a.core ? 1 : 0) || (za < 0 ? 99 : za) - (zb < 0 ? 99 : zb) || String(a.name).localeCompare(String(b.name));
  });
}
function buildLayout() {
  const all = orderStaff(), rows = Math.max(4, Math.ceil(all.length / COLS));
  const L = {rows, deskSt: new Map(), meet: [], pant: [], desks: [], mgr: null};
  XVL = COLS * CELL + .8; W = XVL + .7 + 15; D = 9 + rows * CELL + 2;
  all.forEach((p, i) => {
    const r = Math.floor(i / COLS), c = i % COLS, cx = c * CELL + CELL / 2, z0 = 9 + r * CELL, lane = z0 + 3.7;
    const st = {x: cx, z: z0 + .3, face: 0, pose: "sit", out: [[cx + CELL / 2, z0 + .3], [cx + CELL / 2, lane]], laneZ: lane, kind: "desk", id: p.id, cx, z0};
    L.deskSt.set(p.id, st); L.desks.push(st);
  });
  const mgr = {x: 4.6, z: 1.6, face: 0, pose: "sit", out: [[8.6, 1.6], [8.6, 7.7]], laneZ: 7.7, kind: "desk", id: O().MGR_ID, cx: 4.6, z0: 0.6, mgr: true};
  L.deskSt.set(O().MGR_ID, mgr); L.mgr = mgr;
  const sx = [36.4, 38.4, 40.4, 42.4];
  sx.forEach(x => { L.meet.push({x, z: 3.7, face: 0, pose: "sit", out: [[x, 1.5], [33.1, 1.5], [33.1, 11.3]], laneZ: 11.3});
    L.meet.push({x, z: 9.2, face: Math.PI, pose: "sit", out: [[x, 11.3]], laneZ: 11.3}); });
  [[33.1, 4], [33.1, 6.5], [33.1, 8.5]].forEach(([x, z]) => L.meet.push({x, z, face: Math.PI / 2, pose: "stand", out: [[33.1, 11.3]], laneZ: 11.3}));
  [[45.2, 4.5], [45.2, 6.5], [45.2, 8.5]].forEach(([x, z]) => L.meet.push({x, z, face: -Math.PI / 2, pose: "stand", out: [[45.2, 11.3]], laneZ: 11.3}));
  [33.8, 36.3, 38.8, 41.3, 43.8].forEach(x => L.pant.push({x, z: 16.4, face: Math.PI, pose: "cp", out: [], laneZ: 16.4}));
  [34.4, 36.4, 38.4, 41.4, 43.4].forEach((x, i) => L.pant.push({x, z: 24 + (i % 2) * .5, face: i % 2 ? Math.PI / 2 : -Math.PI / 2, pose: "stand", out: [], laneZ: 24 + (i % 2) * .5}));
  return L;
}
function route(ch, to) {
  const from = ch.st, pts = [];
  if (ch.path.length === 0 && from && ch.moving !== true) { from.out.forEach(p => pts.push(p)); pts.push([XVL, from.laneZ]); }
  else pts.push([XVL, ch.x < XVL - .2 ? Math.max(1.5, ch.z) : ch.z]);
  if (pts[pts.length - 1][1] !== to.laneZ) pts.push([XVL, to.laneZ]);
  [...to.out].reverse().forEach(p => pts.push(p)); pts.push([to.x, to.z]);
  ch.path = pts; ch.st = to;
}

/* ---------------- membangun dunia ---------------- */
function disposeRoot() { if (root) { scene.remove(root); root.traverse(o => { if (o.material && o.material.map && o.userData.own) o.material.map.dispose(); }); } floorTex.forEach(t => t.dispose()); floorTex = []; signTex = []; }
function plant(x, z, h, parent) {
  mesh(.9, .7, .9, "pot", x, .35, z, parent); mesh(.7, h, .7, "leaf", x, .7 + h / 2, z, parent); mesh(1.2, .5, 1.2, "leaf2", x, .7 + h + .1, z, parent);
}
function buildWorld() {
  disposeRoot(); root = new THREE.Group(); scene.add(root); applyPal(); desks.clear(); hits = [];
  const P = pal();
  /* dasar/lantai (diorama) */
  mesh(W, .8, D, "slab", W / 2, -.4, D / 2, root, false);
  const fl = (x0, z0, w, d, a, b) => { const t = texChecker(a, b, w, d); floorTex.push(t); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({map: t, roughness: .95})); m.rotation.x = -Math.PI / 2; m.position.set(x0 + w / 2, .01, z0 + d / 2); m.receiveShadow = true; root.add(m); };
  fl(0, 0, 31.5, D, P.floorA, P.floorB); fl(31.5, 0, W - 31.5, 13.5, P.meetA, P.meetB); fl(31.5, 13.5, W - 31.5, D - 13.5, P.pantA, P.pantB);
  /* dinding belakang & kiri */
  const wallH = 7.5;
  mesh(W, wallH, .6, "wall", W / 2, wallH / 2, -.3, root); mesh(.6, wallH, D, "wall", -.3, wallH / 2, D / 2, root);
  mesh(W, .45, .8, "wallB", W / 2, .22, -.2, root); mesh(.8, .45, D, "wallB", -.2, .22, D / 2, root);
  mesh(W + .6, .35, .9, "wallB", W / 2 - .3, wallH, -.2, root); mesh(.9, .35, D, "wallB", -.2, wallH, D / 2, root);
  /* papan nama kantor di dinding belakang + logo di lantai */
  const sTex = plateTex(1100, 400, true), sign = new THREE.Mesh(new THREE.PlaneGeometry(12, 12 * 400 / 1100), new THREE.MeshBasicMaterial({map: sTex, transparent: true}));
  sign.position.set(19, 5, .02); root.add(sign);
  const sBack = mesh(12.7, 4.7, .3, "trim", 19, 5, -.1, root); sBack.material = TH("wallB");
  const rTex = plateTex(900, 360, false), rug = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.6), new THREE.MeshBasicMaterial({map: rTex, transparent: true}));
  rug.rotation.x = -Math.PI / 2; rug.position.set(14.6, .03, 4.4); root.add(rug);
  /* jendela di dinding kiri */
  [7, 21, 31].forEach(z => { if (z + 3 < D) { mesh(.3, 3, 4.4, "wallB", .12, 4.4, z, root); const w = mesh(.15, 2.5, 3.9, "win", .28, 4.4, z, root); w.material = new THREE.MeshBasicMaterial({color: pal().win}); w.userData.win = true; } });
  /* ruang manajer */
  mesh(5.6, .2, 2.4, "desk", 4.6, 1.5, 3.3, root); mesh(5.6, .12, 2.5, "deskEdge", 4.6, 1.34, 3.3, root);
  [[2, 2.3], [7.2, 2.3], [2, 4.2], [7.2, 4.2]].forEach(([x, z]) => mesh(.3, 1.4, .3, "leg", x, .7, z, root));
  const nameT = textTex("MANAJER · GOD", 512, 128, pal().counterTop, ARANG), np = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .65), new THREE.MeshBasicMaterial({map: nameT}));
  np.position.set(4.6, 1.0, 4.56); root.add(np);
  plant(10.2, 1.4, 1.6, root);
  buildChair(4.6, 1.2, P, root, true);
  const mmon = monitor(3.1, 2.7, .5, root);
  /* meja kerja & kursi */
  desks.set(O().MGR_ID, {mon: mmon.scr});
  lay.desks.forEach(st => { const m = buildDesk(st, root); desks.set(st.id, m); });
  addHit(lay.mgr, 6.6, 3.6);
  /* tanaman pojok & dekorasi lorong */
  plant(.9, D - 1.2, 1.8, root); plant(.9, 8.4, 1.2, root); buildShelf(24.5, 1.0, root);
  /* ruang rapat */
  buildMeeting(root, P); buildPantry(root, P);
  root.updateMatrixWorld(true);
  chars.forEach((c, id) => { const m = desks.get(id); c._mon = m && m.mon; });
  renderer.shadowMap.needsUpdate = true; dirty = true;
}
function monitor(x, z, ry, parent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
  mesh(.7, .12, .5, "leg", 0, 1.38, 0, g); mesh(.14, .5, .14, "leg", 0, 1.6, 0, g);
  mesh(1.7, 1.1, .14, "bezel", 0, 2.2, 0, g);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .9), scrMat("idle", 0)); s.position.set(0, 2.2, .08); g.add(s);
  return {g, scr: s};
}
function buildChair(x, z, P, parent, big) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  mesh(1.2, .18, 1.1, "chair", 0, .27, 0, g); mesh(1.2, 1.0, .2, "chairB", 0, .95, -.55, g); mesh(.18, .25, .18, "leg", 0, .12, 0, g);
  if (big) mesh(1.5, 1.5, .2, "chairB", 0, 1.2, -.58, g);
}
function addHit(st, w, d) {
  const m = new THREE.Mesh(G(w, 3.2, d), new THREE.MeshBasicMaterial({colorWrite: false, depthWrite: false}));
  m.position.set(st.cx, 1.6, st.z0 + 1.8); m.userData.pid = st.id; root.add(m); hits.push(m);
}
function buildDesk(st, parent) {
  const {cx, z0} = st, P = pal(), h = hashS(st.id);
  mesh(3.3, .16, 1.7, "desk", cx, 1.25, z0 + 1.9, parent); mesh(3.3, .1, 1.75, "deskEdge", cx, 1.14, z0 + 1.9, parent);
  [[-1.5, 1.2], [1.5, 1.2], [-1.5, 2.6], [1.5, 2.6]].forEach(([dx, dz]) => mesh(.2, 1.15, .2, "leg", cx + dx, .57, z0 + dz, parent));
  buildChair(cx, z0 + .1, P, parent);
  const mon = monitor(cx - 1.05, z0 + 1.9, .5, parent);
  mesh(1.2, .08, .5, "trim", cx + .55, 1.37, z0 + 2.3, parent); mesh(.4, .06, .3, "leg", cx + 1.15, 1.36, z0 + 2.4, parent);
  if (h % 3 === 0) mesh(.34, .4, .34, cm(MUDA), cx + 1.2, 1.55, z0 + 1.4, parent);
  else if (h % 3 === 1) { mesh(.34, .4, .34, cm(MADU), cx + 1.2, 1.55, z0 + 1.4, parent); }
  else mesh(.5, .5, .5, "leaf", cx + 1.2, 1.6, z0 + 1.4, parent);
  addHit(st, 3.5, 3.4);
  return {mon: mon.scr};
}
function hashS(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function buildMeeting(parent) {
  /* dinding rapat: sekat barat (kaca, ada pintu), sekat depan rendah */
  mesh(.3, 3.2, 10, "glass", 31.65, 1.6, 4.9, parent, false); mesh(.3, 3.2, 1.5, "glass", 31.65, 1.6, 12.75, parent, false);
  mesh(.35, .5, 10, "wallB", 31.65, .25, 4.9, parent); mesh(.35, .5, 1.5, "wallB", 31.65, .25, 12.75, parent);
  mesh(W - 31.5, 1.2, .25, "glass", 31.5 + (W - 31.5) / 2, .6, 13.5, parent, false);
  /* meja rapat */
  mesh(9.2, .22, 3.6, "desk", 39.5, 1.3, 6.4, parent); mesh(9.2, .12, 3.7, "deskEdge", 39.5, 1.16, 6.4, parent);
  [[35.4, 5.2], [43.6, 5.2], [35.4, 7.6], [43.6, 7.6]].forEach(([x, z]) => mesh(.3, 1.2, .3, "leg", x, .6, z, parent));
  [36.4, 38.4, 40.4, 42.4].forEach(x => { buildChairAt(x, 3.7, 0, parent); buildChairAt(x, 9.2, Math.PI, parent); });
  mesh(1.4, .08, 1.0, "trim", 39.5, 1.4, 6.4, parent); mesh(1.6, 1.0, .1, "bezel", 39.5, 2.2, 6.4, parent); /* papan catatan */
  const t = textTex("RAPAT", 256, 96, pal().counterTop, ARANG), sp = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.2), new THREE.MeshBasicMaterial({map: t})); sp.position.set(39.5, 5, .02); parent.add(sp);
  /* layar besar di dinding belakang */
  mesh(7, 3.2, .2, "bezel", 39.5, 4.6, .15, parent); const sc = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 2.8), new THREE.MeshBasicMaterial({color: dark ? "#274f77" : "#79c5ef"})); sc.position.set(39.5, 4.6, .27); parent.add(sc);
  mesh(2, .25, .02, "wallB", 38, 5, .3, parent).material = bm(MADU);
}
function buildShelf(x, z, parent) {
  mesh(5.4, 4.4, 1.1, "wood", x, 2.2, z, parent);
  const cols = [MUDA, MADU, LANGIT, "#7bcf86", KRIM, MADU_TUA];
  [0, 1, 2].forEach(r => { mesh(5.0, .12, 1.15, "trim", x, 1.1 + r * 1.2, z + .05, parent); for (let i = 0; i < 9; i++) mesh(.4, .8 + (i % 3) * .08, .7, cm(cols[(i + r) % 6]), x - 2.0 + i * .5, 1.55 + r * 1.2, z + .1, parent, false); });
}
function buildChairAt(x, z, rot, parent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; parent.add(g);
  mesh(1.2, .18, 1.1, "chair", 0, .27, 0, g); mesh(1.2, 1.0, .2, "chairB", 0, .95, -.55, g); mesh(.18, .25, .18, "leg", 0, .12, 0, g);
}
function buildPantry(parent) {
  mesh(11.5, 1.6, 1.6, "counter", 38.5, .8, 14.9, parent); mesh(11.7, .18, 1.8, "counterTop", 38.5, 1.65, 14.9, parent);
  mesh(1.8, 3.8, 1.8, "fridge", 44.6, 1.9, 14.8, parent); mesh(.08, 1.0, .1, "leg", 43.6, 2.3, 15.75, parent);
  const mach = mesh(1.2, 1.2, 1.0, "bezel", 34.5, 2.34, 14.9, parent); mesh(.6, .3, .1, bm(MADU), 34.5, 2.5, 15.45, parent);
  mesh(.4, .35, .4, "trim", 37, 1.9, 14.9, parent); mesh(.4, .35, .4, cm(MUDA), 38.2, 1.9, 14.9, parent);
  void mach;
  /* meja kopi & bangku */
  mesh(5.6, .18, 1.8, "wood", 39.2, 1.2, 20.1, parent); [[36.6, 19.5], [41.8, 19.5], [36.6, 20.7], [41.8, 20.7]].forEach(([x, z]) => mesh(.2, 1.1, .2, "leg", x, .55, z, parent));
  [37.6, 40.8].forEach(x => { mesh(.8, .6, .8, "chair", x, .3, 18.4, parent); mesh(.8, .6, .8, "chair", x, .3, 21.8, parent); });
  mesh(.5, .45, .5, "trim", 39.2, 1.5, 20.1, parent);
  /* sofa */
  const sz = D - 2.4; mesh(7, .9, 2.4, "sofa", 39, .45, sz, parent); mesh(7, 1.4, .6, "sofa", 39, 1.4, sz + 1.1, parent); mesh(.7, 1.1, 2.4, "sofa", 35.8, .85, sz, parent); mesh(.7, 1.1, 2.4, "sofa", 42.2, .85, sz, parent);
  plant(45.4, D - 1.2, 1.9, parent); plant(32.8, D - 1.4, 1.3, parent);
}

/* ---------------- karakter ---------------- */
function buildChar(p) {
  const L = O().look(p), mgr = L.mgr, g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const skin = cm(L.skin), shirt = cm(L.shirt), pants = cm(L.pants), hair = cm(L.hair), shoe = cm(L.shoe), sh2 = cm(L.shade2);
  const hip = new THREE.Group(); body.add(hip);
  const cc = {};
  [-1, 1].forEach(s => {
    const th = new THREE.Group(); th.position.set(s * .24, 0, 0); hip.add(th);
    const tm = new THREE.Mesh(G(.4, .45, .42), pants); tm.position.y = -.225; tm.castShadow = false; th.add(tm);
    const sn = new THREE.Group(); sn.position.y = -.45; th.add(sn);
    const sm = new THREE.Mesh(G(.34, .5, .36), pants); sm.position.y = -.25; sn.add(sm);
    const fm = new THREE.Mesh(G(.38, .16, .56), shoe); fm.position.set(0, -.5 + .08, .09); sn.add(fm);
    cc[s < 0 ? "thL" : "thR"] = th; cc[s < 0 ? "snL" : "snR"] = sn;
  });
  const torso = new THREE.Mesh(G(1.0, 1.0, .62), shirt); torso.position.y = .5; hip.add(torso);
  const belt = new THREE.Mesh(G(1.02, .16, .64), sh2); belt.position.y = .08; hip.add(belt);
  if (L.core || mgr) { const tie = new THREE.Mesh(G(.2, .6, .05), cm(mgr ? L.tie : MADU)); tie.position.set(0, .55, .33); hip.add(tie); if (mgr) { const col = new THREE.Mesh(G(.5, .12, .06), cm("#ffffff")); col.position.set(0, .86, .33); hip.add(col); } }
  const head = new THREE.Group(); head.position.y = 1.0; hip.add(head);
  const hm = new THREE.Mesh(G(.95, .9, .9), skin); hm.position.y = .5; head.add(hm);
  const hr = new THREE.Mesh(G(1.0, .32, .96), hair); hr.position.y = .97; head.add(hr);
  const hb = new THREE.Mesh(G(1.0, .8, .3), hair); hb.position.set(0, .55, -.35); head.add(hb);
  if (L.hs === 1) { [-1, 1].forEach(s => { const sd = new THREE.Mesh(G(.14, .85, .8), hair); sd.position.set(s * .5, .4, -.05); head.add(sd); }); }
  if (L.hs === 2) { const tf = new THREE.Mesh(G(.3, .3, .3), hair); tf.position.set(.1, 1.25, 0); head.add(tf); }
  [-1, 1].forEach(s => { const e = new THREE.Mesh(G(.14, .2, .06), cm("#1a1320")); e.position.set(s * .22, .52, .46); head.add(e); const ch = new THREE.Mesh(G(.16, .1, .05), cm("#ff9bb0")); ch.position.set(s * .34, .32, .46); head.add(ch); });
  const mo = new THREE.Mesh(G(.2, .06, .05), cm(L.skinSh)); mo.position.set(0, .26, .46); head.add(mo);
  if (mgr) { const cr = new THREE.Mesh(G(.7, .25, .5), cm(MADU)); cr.position.set(0, 1.28, 0); head.add(cr); [-.25, 0, .25].forEach(x => { const pk = new THREE.Mesh(G(.16, .2, .16), cm(MADU)); pk.position.set(x, 1.5, 0); head.add(pk); }); }
  [-1, 1].forEach(s => {
    const ar = new THREE.Group(); ar.position.set(s * .66, .92, 0); hip.add(ar);
    const am = new THREE.Mesh(G(.3, .6, .34), shirt); am.position.y = -.3; ar.add(am);
    const hd = new THREE.Mesh(G(.28, .26, .3), skin); hd.position.y = -.7; ar.add(hd);
    cc[s < 0 ? "arL" : "arR"] = ar;
    if (s > 0) { const cup = new THREE.Mesh(G(.26, .3, .26), cm(KRIM)); cup.position.set(0, -.8, .2); cup.visible = false; ar.add(cup); cc.cup = cup; }
  });
  const sh = new THREE.Mesh(new THREE.CircleGeometry(.85, 16), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .2})); sh.rotation.x = -Math.PI / 2; sh.position.y = .03; g.add(sh);
  const pl = new THREE.Mesh(new THREE.OctahedronGeometry(.32, 0), bm("#ffffff")); pl.scale.set(.8, 1.2, .8); g.add(pl);
  const hit = new THREE.Mesh(G(1.9, 3.2, 1.5), new THREE.MeshBasicMaterial({colorWrite: false, depthWrite: false})); hit.position.y = 1.6; hit.userData.pid = p.id; g.add(hit);
  g.scale.setScalar(mgr ? 1.12 : 1);
  crew.add(g);
  return {id: p.id, g, body, hip, head, ...cc, pl, k: L.k, x: 0, z: 0, heading: 0, path: [], st: null, hipY: .95, pose: "stand", scale: 1, scaleT: 1, a: {}, hit, moving: false, phase: (hashS(p.id) % 628) / 100, pool: null, slot: null};
}
function ensureChars() {
  const o = O();
  chars.forEach((c, id) => { if (!o.staff.has(id)) { crew.remove(c.g); chars.delete(id); } });
  o.staff.forEach(p => { let c = chars.get(p.id); const k = o.look(p).k; if (c && c.k !== k) { crew.remove(c.g); chars.delete(p.id); c = null; } if (!c) { c = buildChar(p); chars.set(p.id, c); c.fresh = true; } });
}
const KC = k => O().KCOL[k] || "#a199ab";
function assignStations() {
  const o = O(), list = [...o.staff.values()].sort((a, b) => a.id < b.id ? -1 : 1), occ = {pant: [], meet: []}, want = new Map();
  list.forEach(p => { const d = o.disp(p); let w = null; if (d === "meeting") w = "meet"; else if (d === "standby" && o.hash(p.id) % 3 === 0) w = "pant"; want.set(p.id, {d, w, slot: null}); });
  list.forEach(p => { const w = want.get(p.id), c = chars.get(p.id); if (w.w && c && c.pool === w.w && c.slot != null && c.slot < lay[w.w].length && !occ[w.w][c.slot]) { occ[w.w][c.slot] = p.id; w.slot = c.slot; } });
  list.forEach(p => { const w = want.get(p.id); if (!w.w || w.slot != null) return; let i = 0; while (i < lay[w.w].length && occ[w.w][i]) i++; if (i < lay[w.w].length) { occ[w.w][i] = p.id; w.slot = i; } else w.w = null; });
  return want;
}
function update() {
  if (!renderer) return;
  const o = O(), sig = [...o.staff.values()].map(p => p.id + o.zonaDari(p) + (p.core ? 1 : 0)).sort().join(",");
  if (!lay || sig !== sigL) { sigL = sig; lay = buildLayout(); buildWorld(); chars.forEach(c => { c.path = []; c.st = null; c.fresh = true; }); fitted = userMoved ? fitted : false; }
  ensureChars();
  const want = assignStations();
  chars.forEach((c, id) => {
    const p = o.staff.get(id), w = want.get(id), d = w.d, desk = lay.deskSt.get(id); if (!desk) return;
    const dest = w.w ? lay[w.w][w.slot] : desk;
    c.d = d; c.pool = w.w; c.slot = w.slot; c.k = o.look(p).k; c.kk = o.kunci(p);
    if (c.fresh) { c.fresh = false; c.st = dest; c.x = dest.x; c.z = dest.z; c.heading = dest.face; c.path = []; c.scale = c.scaleT = d === "off" ? 0 : 1; }
    if (d === "off") { c.scaleT = 0; if (c.scale < .05) { c.st = desk; c.x = desk.x; c.z = desk.z; c.path = []; } }
    else { if (c.scaleT === 0 && c.scale < .05) { c.st = desk; c.x = desk.x; c.z = desk.z; c.path = []; }
      c.scaleT = 1; if (c.st !== dest || (c.path.length === 0 && (Math.abs(c.x - dest.x) > .05 || Math.abs(c.z - dest.z) > .05))) { if (REDUCE) { c.st = dest; c.x = dest.x; c.z = dest.z; c.path = []; } else route(c, dest); } }
    if (REDUCE) c.scale = c.scaleT;
    const m = desks.get(id); if (m) c._mon = m.mon;
  });
  if (!fitted && host && host.clientWidth) fit();
  selId = o.sel(); if (host) host.setAttribute("aria-label", document.getElementById("kantor").getAttribute("aria-label") || "Lantai kantor kantor 3D");
  dirty = true; kick();
}
/* ---------------- amplop ---------------- */
function amplop(id, balik) {
  if (!lay || envs.length > 8) return;
  const a = lay.mgr, b = lay.deskSt.get(id); if (!b) return;
  const A = balik ? b : a, B = balik ? a : b;
  const g = new THREE.Group(); mesh(.8, .12, .55, bm("#ffffff"), 0, 0, 0, g, false); mesh(.18, .14, .18, bm(balik ? "#4daa77" : MUDA), 0, .02, 0, g, false); mesh(.82, .1, .57, bm(ARANG), 0, -.03, 0, g, false);
  root.add(g);
  envs.push({g, x0: A.x, z0: A.z - .5, x1: B.x, z1: B.z - .5, t: 0, dur: REDUCE ? .8 : Math.max(1.2, Math.min(3, Math.hypot(A.x - B.x, A.z - B.z) / 12))});
  dirty = true; kick();
}
/* ---------------- animasi ---------------- */
function animChars(dt, t) {
  const o = O(); let any = false;
  chars.forEach(c => {
    const p = o.staff.get(c.id); if (!p) return;
    /* gerak */
    let walking = false;
    if (c.path.length) {
      let rem = SPEED * dt;
      while (rem > 0 && c.path.length) { const tg = c.path[0], dx = tg[0] - c.x, dz = tg[1] - c.z, Dd = Math.hypot(dx, dz);
        if (Dd <= rem) { c.x = tg[0]; c.z = tg[1]; rem -= Dd; c.path.shift(); } else { c.x += dx / Dd * rem; c.z += dz / Dd * rem; rem = 0; }
        if (Dd > .01) c.th = Math.atan2(dx, dz); }
      walking = c.path.length > 0; c.moving = walking;
    } else c.moving = false;
    const tgtH = walking ? c.th : c.st.face, kH = Math.min(1, dt * (walking ? 12 : 7));
    c.heading += angD(tgtH, c.heading) * kH; c.heading = Math.atan2(Math.sin(c.heading), Math.cos(c.heading));
    c.scale += (c.scaleT - c.scale) * Math.min(1, dt * 6);
    const showing = c.scale > .03; c.g.visible = showing;
    c.g.position.set(c.x, 0, c.z); c.g.rotation.y = c.heading; c.g.scale.setScalar((c.k && o.look(p).mgr ? 1.12 : 1) * Math.max(.001, c.scale));
    /* pose */
    const pose = walking ? "walk" : c.st.pose, d = c.d, ph = t * (d === "coding" ? 9 : 2) + c.phase;
    let tg = {thL: 0, thR: 0, snL: 0, snR: 0, arL: 0, arR: 0, hipY: .95, headX: 0, headY: 0, bodyY: 0, lean: 0};
    if (pose === "walk") { const s = Math.sin(t * 11 + c.phase); tg.thL = s * .7; tg.thR = -s * .7; tg.snL = Math.max(0, -s) * .6; tg.snR = Math.max(0, s) * .6; tg.arL = -s * .6; tg.arR = s * .6; tg.bodyY = Math.abs(s) * .1; }
    else if (pose === "sit") {
      tg.thL = tg.thR = -Math.PI / 2; tg.snL = tg.snR = Math.PI / 2; tg.hipY = .55;
      if (d === "coding") { tg.arL = -1.25 + Math.sin(ph) * .12; tg.arR = -1.25 + Math.sin(ph + 1.9) * .12; tg.headX = .1; tg.lean = .06; }
      else if (d === "riset") { tg.arL = -1.1; tg.arR = -2.3 + Math.sin(ph) * .08; tg.headX = .15 + Math.sin(ph * .6) * .05; tg.headY = Math.sin(ph * .4) * .25; }
      else if (d === "meeting") { tg.arL = -1.0; tg.arR = -1.0 + (Math.sin(ph * 1.3) > .6 ? -.9 : 0); tg.headX = Math.sin(ph * 1.7) * .08; tg.headY = Math.sin(ph * .5) * .3; }
      else { tg.arL = -.6; tg.arR = -.6; tg.headY = Math.sin(ph * .4) * .35; tg.headX = .05; }
    } else {
      if (pose === "cp") { tg.arR = -1.9 + Math.sin(ph) * .06; tg.arL = .1; tg.headX = -.1; }
      else if (d === "meeting") { tg.arL = Math.sin(ph * 1.3) > .5 ? -1.2 : .05; tg.arR = .05; tg.headY = Math.sin(ph * .5) * .3; }
      else { tg.arL = .05 + Math.sin(ph) * .03; tg.arR = .05; tg.headY = Math.sin(ph * .4) * .25; }
      tg.bodyY = Math.sin(ph * .7) * .03;
    }
    if (c.cup) c.cup.visible = pose === "cp";
    const k = Math.min(1, dt * 12), A = c.a;
    ["thL", "thR", "snL", "snR", "arL", "arR", "hipY", "headX", "headY", "bodyY", "lean"].forEach(n => { A[n] = lerp(A[n] == null ? tg[n] : A[n], tg[n], k); });
    c.thL.rotation.x = A.thL; c.thR.rotation.x = A.thR; c.snL.rotation.x = A.snL; c.snR.rotation.x = A.snR;
    c.arL.rotation.x = A.arL; c.arR.rotation.x = A.arR; c.hip.position.y = A.hipY + A.bodyY; c.hip.rotation.x = A.lean;
    c.head.rotation.x = A.headX; c.head.rotation.y = A.headY;
    c.pl.position.y = 3.9 + Math.sin(t * 2 + c.phase) * .12; c.pl.rotation.y = t * 1.5; c.pl.material = bm(KC(c.kk || "idle")); c.pl.visible = showing && c.kk !== "off";
    /* layar monitor */
    if (c._mon) { const kk = c.kk || "idle", f = REDUCE ? 0 : Math.floor(t * 2.5); const kind = kk === "mulai" ? "kerja" : kk; const dsk = c.st && c.st.kind === "desk" && !c.path.length;
      c._mon.material = scrMat(c.scale < .1 || kk === "off" ? "off" : (dsk || true) ? (kind === "kerja" || kind === "riset" || kind === "menunggu" ? kind : "idle") : "idle", f); }
    if (walking || Math.abs(c.scale - c.scaleT) > .01) any = true;
  });
  moved = any;
}
function animEnv(dt) {
  for (let i = envs.length - 1; i >= 0; i--) { const e = envs[i]; e.t += dt / e.dur; const k = Math.min(1, e.t);
    e.g.position.set(lerp(e.x0, e.x1, k), 2.2 + Math.sin(Math.PI * k) * 3.2, lerp(e.z0, e.z1, k)); e.g.rotation.y = k * 6;
    if (e.t >= 1) { root.remove(e.g); envs.splice(i, 1); } }
}
/* ---------------- label ---------------- */
function makeLabel(id) { const d = document.createElement("div"); d.className = "l3"; d.innerHTML = '<i></i><span></span>'; lblLayer.appendChild(d); const l = {el: d, sp: d.lastChild, dot: d.firstChild, txt: "", col: "", w: 60, h: 20, x: -999, y: -999, show: true}; labels.set(id, l); return l; }
function drawLabels() {
  const o = O(), r = host.getBoundingClientRect(), cands = [], placed = [];
  labels.forEach((l, id) => { if (!chars.has(id)) { l.el.remove(); labels.delete(id); } });
  chars.forEach((c, id) => {
    let l = labels.get(id) || makeLabel(id); const p = o.staff.get(id);
    const k = c.kk || "idle", vis = c.g.visible && k !== "off" && c.scale > .5 && p;
    if (!vis) { if (l.show) { l.el.style.display = "none"; l.show = false; } return; }
    const kecil = r.width < 640;
    if (kecil && (k === "idle") && id !== selId && id !== hoverId) { if (l.show) { l.el.style.display = "none"; l.show = false; } return; }
    let txt = o.LBL[k] || k; if (id === selId || id === hoverId) txt = o.pendek(o.namaPendek(p), 18) + " · " + txt;
    if (txt !== l.txt) { l.sp.textContent = txt; l.txt = txt; l.el.style.display = ""; l.w = l.el.offsetWidth || 60; l.h = l.el.offsetHeight || 20; }
    l.el.classList.toggle("sel", id === selId); l.el.classList.toggle("hov", id === hoverId && id !== selId);
    const col = KC(k); if (col !== l.col) { l.dot.style.background = col; l.col = col; }
    v3.set(c.x, 4.7 * (c.g.scale.y), c.z); v3.project(cam);
    cands.push({id, l, x: (v3.x * .5 + .5) * r.width, y: (-v3.y * .5 + .5) * r.height, pr: id === selId ? 0 : id === hoverId ? 1 : c.moving ? 3 : 2, ts: Date.parse(p.updated_at) || 0});
  });
  cands.sort((a, b) => a.pr - b.pr || b.ts - a.ts);
  cands.forEach(cd => {
    const {l} = cd, bw = l.w, bh = l.h; let bx = Math.max(2, Math.min(r.width - bw - 2, cd.x - bw / 2)), by = cd.y - bh - 4, ok = false;
    for (let i = 0; i < 3 && !ok; i++) { const hit = placed.some(q => bx < q.x + q.w + 2 && bx + bw + 2 > q.x && by < q.y + q.h + 2 && by + bh + 2 > q.y); if (!hit && by > 0) ok = true; else by -= bh + 3; }
    if (!ok && cd.pr > 1) { if (l.show) { l.el.style.display = "none"; l.show = false; } return; }
    if (!ok) by = Math.max(2, cd.y - bh - 4);
    placed.push({x: bx, y: by, w: bw, h: bh});
    if (!l.show) { l.el.style.display = ""; l.show = true; }
    if (Math.abs(bx - l.x) > .4 || Math.abs(by - l.y) > .4) { l.el.style.transform = `translate(${bx.toFixed(1)}px,${by.toFixed(1)}px)`; l.x = bx; l.y = by; }
  });
}
/* ---------------- kamera ---------------- */
const FH = 40, DIR = new THREE.Vector3(1, 1, 1).normalize();
function frustum() { const w = host.clientWidth || 1, h = host.clientHeight || 1, a = w / h; cam.left = -FH * a / 2; cam.right = FH * a / 2; cam.top = FH / 2; cam.bottom = -FH / 2; cam.updateProjectionMatrix(); }
function fit() {
  const target = new THREE.Vector3(W / 2, 1.5, D / 2), pts = [];
  [0, W].forEach(x => [0, D].forEach(z => [0, 7.8].forEach(y => pts.push(new THREE.Vector3(x, y, z)))));
  cam.position.copy(target).addScaledVector(DIR, 90); cam.zoom = 1; cam.lookAt(target); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; const inv = cam.matrixWorldInverse;
  pts.forEach(p => { const q = p.clone().applyMatrix4(inv); minx = Math.min(minx, q.x); maxx = Math.max(maxx, q.x); miny = Math.min(miny, q.y); maxy = Math.max(maxy, q.y); });
  const vw = cam.right - cam.left, vh = cam.top - cam.bottom, z = Math.min(vw / (maxx - minx), vh / (maxy - miny)) * .94;
  cam.zoom = z; ctl.minZoom = z * .7; ctl.maxZoom = z * 4.5; ctl.target.copy(target); ctl.update(); cam.updateProjectionMatrix();
  /* pusatkan hasil proyeksi */
  const cxv = (minx + maxx) / 2, cyv = (miny + maxy) / 2; const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
  const shift = right.multiplyScalar(cxv).add(up.multiplyScalar(cyv)); cam.position.add(shift); ctl.target.add(shift); ctl.update(); fitted = true; userMoved = false; dirty = true;
}
function resize() {
  if (!host || !renderer) return; const w = host.clientWidth, h = host.clientHeight; if (w < 2 || h < 2) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(w, h, false); frustum();
  if (!fitted || !userMoved) fit(); dirty = true; kick();
}
/* ---------------- tema ---------------- */
function isDark() { const r = document.documentElement.getAttribute("data-theme"); return r === "dark" || (r !== "light" && matchMedia("(prefers-color-scheme: dark)").matches); }
function syncTheme() {
  const d = isDark(); if (d === dark && renderer && hemi.userData.d === d) return; dark = d; if (!renderer) return; hemi.userData.d = d;
  hemi.intensity = pal().hemi; sun.intensity = 1.5 * pal().light + .3; sun.color.set(d ? "#ffd9a0" : "#fff1cf"); hemi.color.set(d ? "#c9b79a" : "#fff7e0"); hemi.groundColor.set(d ? "#2a2420" : "#e0c27a");
  if (lay) { buildWorld(); chars.forEach(c => { c.fresh = false; }); } dirty = true; kick();
}
/* ---------------- interaksi ---------------- */
function pick(e) {
  const r = canvas.getBoundingClientRect(); mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(mouse, cam);
  const cs = []; chars.forEach(c => { if (c.g.visible && c.scale > .3) cs.push(c.hit); });
  const h = raycaster.intersectObjects(cs, false); if (h.length) return h[0].object.userData.pid;
  const h2 = raycaster.intersectObjects(hits, false); if (h2.length) { const id = h2[0].object.userData.pid; return O().staff.has(id) ? id : null; }
  return null;
}
function bind() {
  canvas.addEventListener("pointermove", e => { if (down) return; const id = pick(e); if (id !== hoverId) { hoverId = id; dirty = true; kick(); }
    canvas.style.cursor = id ? "pointer" : "grab"; O().tip(id, e); });
  canvas.addEventListener("pointerleave", () => { hoverId = null; O().tip(null); dirty = true; kick(); });
  canvas.addEventListener("pointerdown", e => { down = {x: e.clientX, y: e.clientY}; });
  canvas.addEventListener("pointerup", e => { const d = down; down = null; if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return; const id = pick(e); if (id) O().pilih(id); });
  ctl.addEventListener("start", () => { userMoved = true; }); ctl.addEventListener("change", () => { dirty = true; kick(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopLoop(); else kick(); });
  canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); stopLoop(); if (O().gagal3d) O().gagal3d("konteks WebGL hilang"); });
  new MutationObserver(syncTheme).observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncTheme);
}
/* ---------------- loop ---------------- */
function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
function kick() { if (!raf && running && visible && !document.hidden) { tPrev = performance.now(); raf = requestAnimationFrame(loop); } }
function loop(now) {
  raf = 0; if (!running || !visible || document.hidden) return;
  const busy = moved || envs.length > 0 || dirty || !REDUCE, gap = moved || envs.length || dirty ? 30 : 70;
  const el = now - lastDraw;
  if (el >= gap) {
    const dt = Math.min(.1, (now - tPrev) / 1000); tPrev = now; lastDraw = now; tAcc += dt;
    if (!REDUCE) { animChars(dt, tAcc); animEnv(dt); } else if (dirty) animChars(1, tAcc);
    ctl.update();
    ring.visible = !!hoverId && hoverId !== selId && chars.has(hoverId); ringSel.visible = !!selId && chars.has(selId);
    if (ring.visible) { const c = chars.get(hoverId); ring.position.set(c.x, .06, c.z); }
    if (ringSel.visible) { const c = chars.get(selId); ringSel.position.set(c.x, .07, c.z); ringSel.rotation.z = tAcc * .8; }
    clampTarget(); renderer.render(scene, cam); drawLabels(); dirty = false;
  }
  if (busy) raf = requestAnimationFrame(loop);
}
function clampTarget() { const t = ctl.target; const nx = Math.max(2, Math.min(W - 2, t.x)), nz = Math.max(2, Math.min(D - 2, t.z)); if (nx !== t.x || nz !== t.z) { cam.position.x += nx - t.x; cam.position.z += nz - t.z; t.x = nx; t.z = nz; } if (t.y < 0 || t.y > 4) { const ny = Math.max(0, Math.min(4, t.y)); cam.position.y += ny - t.y; t.y = ny; } }

/* ---------------- API ---------------- */
function init(h) {
  host = h; host.innerHTML = "";
  canvas = document.createElement("canvas"); canvas.className = "c3d"; canvas.setAttribute("aria-hidden", "true"); host.appendChild(canvas);
  lblLayer = document.createElement("div"); lblLayer.className = "l3-layer"; host.appendChild(lblLayer);
  renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: "low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  scene = new THREE.Scene(); crew = new THREE.Group(); scene.add(crew);
  cam = new THREE.OrthographicCamera(-20, 20, 20, -20, -200, 400);
  ctl = new OrbitControls(cam, canvas); ctl.enableDamping = true; ctl.dampingFactor = .1; ctl.enablePan = true; ctl.screenSpacePanning = true;
  ctl.minPolarAngle = .5; ctl.maxPolarAngle = 1.26; ctl.minAzimuthAngle = -.2; ctl.maxAzimuthAngle = Math.PI / 2 + .2; ctl.rotateSpeed = .7; ctl.zoomSpeed = .9;
  hemi = new THREE.HemisphereLight("#fff7e0", "#e0c27a", 1.05); scene.add(hemi);
  sun = new THREE.DirectionalLight("#fff1cf", 1.5); sun.position.set(60, 90, 70); sun.target.position.set(23, 0, 18); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, {left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 260}); sun.shadow.bias = -.0006; sun.shadow.normalBias = .04;
  scene.add(sun, sun.target);
  ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.25, 28), new THREE.MeshBasicMaterial({color: "#ffffff", transparent: true, opacity: .9, side: THREE.DoubleSide})); ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
  ringSel = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.4, 6), new THREE.MeshBasicMaterial({color: MADU, side: THREE.DoubleSide})); ringSel.rotation.x = -Math.PI / 2; ringSel.visible = false; scene.add(ringSel);
  dark = isDark(); hemi.userData.d = dark; hemi.intensity = pal().hemi; sun.intensity = 1.5 * pal().light + .3; if (dark) { sun.color.set("#ffd9a0"); hemi.color.set("#c9b79a"); hemi.groundColor.set("#2a2420"); }
  bind();
  ro = new ResizeObserver(resize); ro.observe(host);
  io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { dirty = true; kick(); } else stopLoop(); }, {threshold: 0}); io.observe(host);
}
export const view = {
  start(h) {
    if (!renderer) init(h); else if (host !== h) { h.appendChild(canvas); h.appendChild(lblLayer); host = h; }
    running = true; syncTheme(); resize(); update(); if (!fitted) fit(); dirty = true; kick();
  },
  pause() { running = false; stopLoop(); },
  update,
  amplop,
  reset() { fit(); },
};
