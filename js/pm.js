import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

  import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";



  const app = initializeApp({

    apiKey: "AIzaSyBERAe8FhHLfhVukrC35eb-Vp7cuXqww0E",

    authDomain: "pasyak-pixels.firebaseapp.com",

    databaseURL: "https://pasyak-pixels-default-rtdb.firebaseio.com",

    projectId: "pasyak-pixels",

    storageBucket: "pasyak-pixels.firebasestorage.app",

    messagingSenderId: "974471457881",

    appId: "1:974471457881:web:ef3380c071516000fad548"

  });

  const db = getDatabase(app);



  const canvas = document.getElementById("canvas");

  const ctx = canvas.getContext("2d");

  const palette = document.getElementById("colorPalette");

  const countdownEl = document.getElementById("countdown");

  const loadOv = document.getElementById("loadingOverlay");

  const zoomUI = document.getElementById("zoomControls");

  const zoomInBt = document.getElementById("zoomIn");

  const zoomOutBt = document.getElementById("zoomOut");

  const onlineCountDot = document.querySelector("#onlineCountBar .dot");

  const maintenanceMsg = document.getElementById("maintenanceMsg");

  const errorMessage = document.getElementById("errorMessage");



  let scale = 20, panX = innerWidth/2, panY = innerHeight/2;

  let currentColor = "#000000", previewPixel = null;

  let animationAngle = 0, animationOffset = 0, animationDir = 1;

  const pixelData = {};

  let lastTouchDist = null;

  let currentTouchMode = null;



  // The cooldown related code is removed.

  const colors = ['#FFFFFF','#E4E4E4','#888888','#000000','#FFA7D1','#E50000','#E59500','#9E6941','#E5D900','#94E044','#02BE01','#00D3DD','#0083C7','#0000EA','#CF6EE4','#820080'];

  colors.forEach(c => {

    const d = document.createElement("div");

    d.className = "color-swatch";

    d.style.backgroundColor = c;

    d.dataset.color = c;

    d.onclick = () => {

      currentColor = c;

      updateSelectedColor();

    };

    palette.appendChild(d);

  });



  function updateSelectedColor() {

    document.querySelectorAll('.color-swatch').forEach(div => {

      div.classList.toggle('selected', div.dataset.color === currentColor);

    });

  }

  updateSelectedColor();



  function showError(msg) {

    errorMessage.textContent = msg;

    errorMessage.style.display = 'block';

    setTimeout(() => errorMessage.style.display = 'none', 3000);

  }



  function draw() {

    ctx.fillStyle = "#fff";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const k in pixelData) {

      const [x, y] = k.split(',').map(Number);

      ctx.fillStyle = pixelData[k];

      ctx.fillRect(x * scale + panX, y * scale + panY, scale, scale);

    }

    if (previewPixel) { // Cooldown check is removed from here.

      const { x, y, color } = previewPixel;

      animationOffset += animationDir * 0.2;

      if (animationOffset > 4 || animationOffset < -4) animationDir *= -1;

      animationAngle += 0.03;

      const px = x * scale + panX + scale / 2 + animationOffset;

      const py = y * scale + panY + scale / 2;

      ctx.save();

      ctx.translate(px, py);

      ctx.rotate(Math.sin(animationAngle) * 0.15);

      ctx.globalAlpha = 0.7;

      ctx.fillStyle = color;

      ctx.fillRect(-scale / 2, -scale / 2, scale, scale);

      ctx.restore();

      ctx.globalAlpha = 1;

    }

  }



  function animate() {

    draw();

    // The cooldown UI update function is removed from here.

    requestAnimationFrame(animate);

  }

  animate();



  function getCanvasCoords(cx, cy) {

    const r = canvas.getBoundingClientRect();

    const x = Math.floor(((cx - r.left) * canvas.width / r.width - panX) / scale);

    const y = Math.floor(((cy - r.top ) * canvas.height / r.height - panY) / scale);

    return [x, y];

  }



  function placePixel(x, y) {

    pixelData[`${x},${y}`] = currentColor;

    set(ref(db, `pixels/${x}_${y}`), currentColor);

    previewPixel = null;

  }



  let drag = false, sx = 0, sy = 0, lx = 0, ly = 0;

  canvas.addEventListener("mousedown", e => { drag = true; sx = e.clientX; sy = e.clientY; lx = panX; ly = panY; });

  canvas.addEventListener("mousemove", e => { if (!drag) return; panX = lx + (e.clientX - sx); panY = ly + (e.clientY - sy); });

  canvas.addEventListener("mouseup", e => {

    if (Math.abs(e.clientX - sx) < 5 && Math.abs(e.clientY - sy) < 5) {

      const [x, y] = getCanvasCoords(e.clientX, e.clientY);

      if (previewPixel && previewPixel.x === x && previewPixel.y === y) placePixel(x, y);

      else previewPixel = { x, y, color: currentColor };

    }

    drag = false;

  });



  function zoomAt(factor, cx = innerWidth / 2, cy = innerHeight / 2) {

    const wx = (cx - panX) / scale, wy = (cy - panY) / scale;

    scale *= factor;

    panX = cx - wx * scale;

    panY = cy - wy * scale;

  }



  canvas.addEventListener("wheel", e => {

    e.preventDefault();

    zoomAt(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY);

  }, { passive: false });



  zoomInBt.onclick = () => { zoomAt(1.2); zoomInBt.blur(); }

  zoomOutBt.onclick = () => { zoomAt(0.8); zoomOutBt.blur(); }



  canvas.addEventListener("touchstart", e => {

    if (e.touches.length === 2) {

      const dx = e.touches[0].clientX - e.touches[1].clientX;

      const dy = e.touches[0].clientY - e.touches[1].clientY;

      lastTouchDist = Math.hypot(dx, dy);

      currentTouchMode = "zoom";

    } else if (e.touches.length === 1) {

      sx = e.touches[0].clientX; sy = e.touches[0].clientY; lx = panX; ly = panY;

      currentTouchMode = "pan";

    }

  });



  canvas.addEventListener("touchmove", e => {

    if (currentTouchMode === "zoom" && e.touches.length === 2 && lastTouchDist) {

      const dx = e.touches[0].clientX - e.touches[1].clientX;

      const dy = e.touches[0].clientY - e.touches[1].clientY;

      const dist = Math.hypot(dx, dy);

      const factor = dist / lastTouchDist;

      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;

      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      zoomAt(factor, cx, cy);

      lastTouchDist = dist;

    } else if (currentTouchMode === "pan" && e.touches.length === 1) {

      panX = lx + (e.touches[0].clientX - sx);

      panY = ly + (e.touches[0].clientY - sy);

    }

    e.preventDefault();

  }, { passive: false });



  canvas.addEventListener("touchend", e => {

    if (currentTouchMode === "pan" && e.changedTouches.length === 1) {

      const [x, y] = getCanvasCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

      if (previewPixel && previewPixel.x === x && previewPixel.y === y) placePixel(x, y);

      else previewPixel = { x, y, color: currentColor };

    }

    lastTouchDist = null;

    currentTouchMode = null;

  });



  onValue(ref(db, 'pixels'), snap => {

    const d = snap.val();

    if (d) for (const k in d) pixelData[k.replace('_', ',')] = d[k];

    loadOv.style.display = "none";

    canvas.style.display = "block";

    palette.style.display = "flex";

    zoomUI.style.display = "flex";

  });



  function resize() {

    canvas.width = innerWidth;

    canvas.height = innerHeight;

  }

  window.addEventListener('resize', resize);

  resize();



  onValue(ref(db, "onlineUsers/statusColor"), snap => {

    if (snap.exists()) {

      const color = snap.val().toLowerCase();

      onlineCountDot.style.backgroundColor = color;

      if (color === "#ff0000" || color === "red") {

        maintenanceMsg.style.display = "block";

        canvas.style.display = "none";

        palette.style.display = "none";

        zoomUI.style.display = "none";

      } else {

        maintenanceMsg.style.display = "none";

        canvas.style.display = "block";

        palette.style.display = "flex";

        zoomUI.style.display = "flex";

      }

    }

  });
