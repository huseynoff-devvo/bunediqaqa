import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// Firebase konfiqurasiyası
const firebaseConfig = {
  apiKey: "AIzaSyBERAe8FhHLfhVukrC35eb-Vp7cuXqww0E",
  authDomain: "pasyak-pixels.firebaseapp.com",
  databaseURL: "https://pasyak-pixels-default-rtdb.firebaseio.com",
  projectId: "pasyak-pixels",
  storageBucket: "pasyak-pixels.firebasestorage.app",
  messagingSenderId: "974471457881",
  appId: "1:974471457881:web:ef3380c071516000fad548"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPalette = document.getElementById("colorPalette");
const loadingOverlay = document.getElementById("loadingOverlay");

const zoomControls = document.getElementById("zoomControls");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");

const dot = document.querySelector("#onlineCountBar .dot");

// Onlayn istifadəçilərin status rəngini izləmək
onValue(ref(db, 'onlineUsers/statusColor'), snapshot => {
  const color = snapshot.val();
  if (typeof color === 'string') {
    dot.style.backgroundColor = color;
  }
});

let scale = 20;
let panX = window.innerWidth / 2;
let panY = window.innerHeight / 2;
let currentColor = "#000000";
const pixelData = {}; // Bütün piksellərin saxlandığı obyekt

// Rəng palitrasının tərifi
const colors = [
  '#FFFFFF', '#E4E4E4', '#888888', '#000000', '#FFA7D1', '#E50000',
  '#E59500', '#FFE8D9', '#E5D900', '#94E044', '#02BE01', '#00D3DD',
  '#0083C7', '#0000EA','#CF6EE4','#820080'
];

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

// Seçilmiş rəngi yeniləmək
function updateSelectedColor() {
  document.querySelectorAll('.color-swatch').forEach(div => {
    div.classList.toggle('selected', div.dataset.color === currentColor);
  });
}
updateSelectedColor();

// Kətanı çəkmək funksiyası
function draw() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Yalnız görünən pikselləri çəkmək üçün optimizasiya
  const visibleMinX = Math.floor((-panX) / scale);
  const visibleMaxX = Math.ceil((canvas.width - panX) / scale);
  const visibleMinY = Math.floor((-panY) / scale);
  const visibleMaxY = Math.ceil((canvas.height - panY) / scale);

  for (const key in pixelData) {
    const [x, y] = key.split(',').map(Number);
    // Piksel görünən sahədədirsə çəkin
    if (x >= visibleMinX && x <= visibleMaxX && y >= visibleMinY && y <= visibleMaxY) {
      ctx.fillStyle = pixelData[key];
      ctx.fillRect(x * scale + panX, y * scale + panY, scale, scale);
    }
  }
}

// Animasiya dövrü
function animate() {
  draw();
  requestAnimationFrame(animate);
}
animate();

// Kətan koordinatlarını almaq
function getCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((clientX - rect.left) * canvas.width / rect.width - panX) / scale);
  const y = Math.floor(((clientY - rect.top) * canvas.height / rect.height - panY) / scale);
  return [x, y];
}

// Piksel yerləşdirmək
function placePixel(x, y) {
  pixelData[`${x},${y}`] = currentColor;
  set(ref(db, `pixels/${x}_${y}`), currentColor);
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
    placePixel(x, y);
  }
  isDragging = false;
});

// Zoom funksiyası
function zoomAt(factor, cx = window.innerWidth/2, cy = window.innerHeight/2) {
  // scale dəyərini məhdudlaşdırın. Minimum miqyası 1 olaraq təyin edin.
  const newScale = Math.max(1, Math.min(100, scale * factor));
  const actualFactor = newScale / scale;
  
  const wx = (cx - panX) / scale;
  const wy = (cy - panY) / scale;
  scale = newScale;
  panX = cx - wx * scale;
  panY = cy - wy * scale;
}

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  zoomAt(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY);
}, { passive: false });

zoomInBtn.onclick = () => zoomAt(1.2);
zoomOutBtn.onclick = () => zoomAt(0.8);

let lastTouchDist = null;
canvas.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDist = Math.hypot(dx, dy);
  } else if (e.touches.length === 1) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    lastPanX = panX;
    lastPanY = panY;
  }
});

canvas.addEventListener("touchmove", e => {
  if (e.touches.length === 2 && lastTouchDist) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const factor = dist / lastTouchDist;
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    zoomAt(factor, cx, cy);
    lastTouchDist = dist;
  } else if (e.touches.length === 1) {
    panX = lastPanX + (e.touches[0].clientX - startX);
    panY = lastPanY + (e.touches[0].clientY - startY);
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", e => {
  if (e.changedTouches.length === 1 && !lastTouchDist) {
    const [x, y] = getCanvasCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    placePixel(x, y);
  }
  lastTouchDist = null;
});

// Firebase-dən pikselləri yükləmək
onValue(ref(db, 'pixels'), snapshot => {
  const data = snapshot.val();
  if (data) {
    // Yalnız yeni və ya dəyişdirilmiş pikselləri yeniləyin
    for (const key in data) {
      const formattedKey = key.replace('_', ',');
      if (pixelData[formattedKey] !== data[key]) {
        pixelData[formattedKey] = data[key];
      }
    }
    // Silinmiş pikselləri təmizləyin
    for (const key in pixelData) {
      if (!data[key.replace(',', '_')]) {
        delete pixelData[key];
      }
    }
  } else {
    // Əgər heç bir piksel yoxdursa, təmizləyin
    for (const key in pixelData) delete pixelData[key];
  }
  loadingOverlay.style.display = "none";
  canvas.style.display = "block";
  colorPalette.style.display = "flex";
  zoomControls.style.display = "flex";
});

// Kətanın ölçüsünü dəyişdirmək
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // panX və panY dəyərlərini yenidən hesablayın
  panX = window.innerWidth / 2;
  panY = window.innerHeight / 2;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
