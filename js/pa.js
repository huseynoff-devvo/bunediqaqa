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
    const colorPalette = document.getElementById("colorPalette");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const zoomControls = document.getElementById("zoomControls");
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    const dot = document.querySelector("#onlineCountBar .dot");

    let scale = 20;
    let panX = window.innerWidth / 2;
    let panY = window.innerHeight / 2;
    let currentColor = "#000000";
    const pixelData = {};
    let previewPixel = null;
    let animationAngle = 0, animationOffset = 0, animationDirection = 1;

    // Dot rəngi Firebase-dən
    onValue(ref(db, 'onlineUsers/statusColor'), snapshot => {
      const color = snapshot.val();
      if (typeof color === 'string') {
        dot.style.backgroundColor = color;
      }
    });

    // Palitra
    const colors = ['#FFFFFF','#E4E4E4','#888888','#000000','#FFA7D1','#E50000','#E59500','#9E6941','#E5D900','#94E044','#02BE01','#00D3DD','#0083C7','#0000EA','#CF6EE4','#820080'];
    colors.forEach(color => {
      const div = document.createElement("div");
      div.className = "color-swatch";
      div.style.backgroundColor = color;
      div.dataset.color = color;
      div.onclick = () => {
        currentColor = color;
        updateSelectedColor();
      };
      colorPalette.appendChild(div);
    });
    function updateSelectedColor() {
      document.querySelectorAll('.color-swatch').forEach(div => {
        div.classList.toggle('selected', div.dataset.color === currentColor);
      });
    }
    updateSelectedColor();

    function draw() {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const key in pixelData) {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = pixelData[key];
        ctx.fillRect(x * scale + panX, y * scale + panY, scale, scale);
      }

      if (previewPixel) {
        const { x, y, color } = previewPixel;
        animationOffset += animationDirection * 0.2;
        if (animationOffset > 4 || animationOffset < -4) animationDirection *= -1;
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
      requestAnimationFrame(animate);
    }
    animate();

    function getCanvasCoords(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(((clientX - rect.left) * canvas.width / rect.width - panX) / scale);
      const y = Math.floor(((clientY - rect.top) * canvas.height / rect.height - panY) / scale);
      return [x, y];
    }

    function placePixel(x, y) {
      pixelData[`${x},${y}`] = currentColor;
      set(ref(db, `pixels/${x}_${y}`), currentColor);
      previewPixel = null;
    }

    let isDragging = false, startX = 0, startY = 0, lastPanX = 0, lastPanY = 0;
    canvas.addEventListener("mousedown", e => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      lastPanX = panX;
      lastPanY = panY;
    });
    canvas.addEventListener("mousemove", e => {
      if (!isDragging) return;
      panX = lastPanX + (e.clientX - startX);
      panY = lastPanY + (e.clientY - startY);
    });
    canvas.addEventListener("mouseup", e => {
      if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) {
        const [x, y] = getCanvasCoords(e.clientX, e.clientY);
        if (previewPixel && previewPixel.x === x && previewPixel.y === y) placePixel(x, y);
        else previewPixel = { x, y, color: currentColor };
      }
      isDragging = false;
    });

    function zoomAt(factor, cx = window.innerWidth / 2, cy = window.innerHeight / 2) {
      const wx = (cx - panX) / scale;
      const wy = (cy - panY) / scale;
      scale *= factor;
      panX = cx - wx * scale;
      panY = cy - wy * scale;
    }

    canvas.addEventListener("wheel", e => {
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY);
    }, { passive: false });

    zoomInBtn.onclick = () => zoomAt(1.2);
    zoomOutBtn.onclick = () => zoomAt(0.8);

    // Touch zoom və pan konflikti düzəldilmiş hissə:
    let lastTouchDist = null;
    let isTouchDragging = false;
    let touchStartX = 0, touchStartY = 0;
    let lastTouchPanX = panX, lastTouchPanY = panY;

    canvas.addEventListener("touchstart", e => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.hypot(dx, dy);
      } else if (e.touches.length === 1) {
        isTouchDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        lastTouchPanX = panX;
        lastTouchPanY = panY;
      }
    }, { passive: false });

    canvas.addEventListener("touchmove", e => {
      if (e.touches.length === 2 && lastTouchDist !== null) {
        // Zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / lastTouchDist;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        zoomAt(factor, cx, cy);
        lastTouchDist = dist;
        isTouchDragging = false; // İki barmaq zoom zamanı sürüşmə olmamalıdır
      } else if (e.touches.length === 1 && isTouchDragging) {
        // Pan
        panX = lastTouchPanX + (e.touches[0].clientX - touchStartX);
        panY = lastTouchPanY + (e.touches[0].clientY - touchStartY);
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchend", e => {
      if (e.changedTouches.length === 1 && !lastTouchDist) {
        const [x, y] = getCanvasCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        if (previewPixel && previewPixel.x === x && previewPixel.y === y) placePixel(x, y);
        else previewPixel = { x, y, color: currentColor };
      }
      if (e.touches.length < 2) lastTouchDist = null;
      if (e.touches.length === 0) isTouchDragging = false;
    });

    // Firebase data yüklənməsi
    onValue(ref(db, 'pixels'), snapshot => {
      const data = snapshot.val();
      if (data) {
        for (const key in data) {
          pixelData[key.replace('_', ',')] = data[key];
        }
      }
      loadingOverlay.style.display = "none";
      canvas.style.display = "block";
      colorPalette.style.display = "flex";
      zoomControls.style.display = "flex";
    });

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
