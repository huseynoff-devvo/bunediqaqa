// Firebase modullarının idxalı
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
  import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

  // Firebase konfiqurasiyası
  const firebaseConfig = {
    apiKey: "AIzaSyBERAe8FhHLfhVukrC35eb-Vp7cuXqww0E",
    authDomain: "pasyak-pixels.firebaseapp.com",
    databaseURL: "https://pasyak-pixels-default-rtdb.firebaseio.com",
    projectId: "pasyak-pixels",
    storageBucket: "pasyak-pixels.firebaseapp.com",
    messagingSenderId: "974471457881",
    appId: "1:974471457881:web:ef3380c071516000fad548"
  };

  // Firebase tətbiqini başla
  const app = initializeApp(firebaseConfig);
  // Firebase Realtime Database nümunəsini al
  const db = getDatabase(app);

  // DOM elementlərini al
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const palette = document.getElementById("colorPalette");
  const shadesPalette = document.getElementById("shadesPalette"); // Ton palitrası elementi
  const countdownEl = document.getElementById("countdown");
  const loadOv = document.getElementById("loadingOverlay");
  const zoomUI = document.getElementById("zoomControls");
  const zoomInBt = document.getElementById("zoomIn");
  const zoomOutBt = document.getElementById("zoomOut");
  const onlineCountDot = document.querySelector("#onlineCountBar .dot");
  const maintenanceMsg = document.getElementById("maintenanceMsg");
  const errorMessage = document.getElementById("errorMessage");

  // Kətanın və pikselin vəziyyət dəyişənləri
  // URL-dən koordinatları oxuyan hissə ləğv edildi.
  // const urlParams = new URLSearchParams(window.location.search);
  let scale = 20; // Başlanğıc miqyas
  let panX = innerWidth / 2; // Başlanğıc üfüqi sürüşmə
  let panY = innerHeight / 2; // Başlanğıc şaquli sürüşmə

  let currentColor = "#000000"; // Cari seçilmiş rəng
  let selectedBaseColor = null; // Əsas palitradan seçilmiş rəngi izləmək üçün
  let previewPixel = null; // Önizləmə pikseli
  let animationAngle = 0; // Önizləmə animasiyasının bucağı
  let animationOffset = 0; // Önizləmə animasiyasının ofseti
  let animationDir = 1; // Önizləmə animasiyasının istiqaməti
  const pixelData = {}; // Bütün piksellərin saxlandığı obyekt
  let cooldownDuration = 30000; // Piksel yerləşdirmə üçün soyuma müddəti (milisaniyə)
  // Soyuma müddətinin bitmə vaxtı, yerli yaddaşdan alınır və ya sıfır
  let cooldownEnd = Number(localStorage.getItem('pixelCooldown')) || 0;
  let lastTouchDist = null; // Son toxunma məsafəsi (zoom üçün)
  let currentTouchMode = null; // Cari toxunma rejimi (pan/zoom)

  // Kətan hüdudları
  // 50 milyon piksel üçün hüdudlar (təxminən 7071x7071)
  const WORLD_MIN_X = -3535;
  const WORLD_MAX_X = 3535;
  const WORLD_MIN_Y = -3535;
  const WORLD_MAX_Y = 3535;
  const MAX_SCALE = 100;
  const MIN_SCALE = 1;

  // Hex-dən RGB-yə çevirmə funksiyası
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  // RGB-dən Hex-ə çevirmə funksiyası
  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  // Verilmiş əsas rəng üçün tonlar yaradan funksiyası
  function generateShades(baseHexColor) {
    const shades = [];
    const baseRgb = hexToRgb(baseHexColor);

    // Daha açıq tonlar (ağ ilə qarışdıraraq)
    for (let i = 3; i >= 1; i--) { // 3 addım daha açıq
      const factor = i * 0.2;
      const r = Math.round(baseRgb.r + (255 - baseRgb.r) * factor);
      const g = Math.round(baseRgb.g + (255 - baseRgb.g) * factor);
      const b = Math.round(baseRgb.b + (255 - baseRgb.b) * factor);
      shades.push(rgbToHex(r, g, b));
    }

    shades.push(baseHexColor); // Əsas rəngin özünü əlavə et

    // Daha tünd tonlar (qara ilə qarışdıraraq)
    for (let i = 1; i <= 3; i++) { // 3 addım daha tünd
      const factor = i * 0.2;
      const r = Math.round(baseRgb.r * (1 - factor));
      const g = Math.round(baseRgb.g * (1 - factor));
      const b = Math.round(baseRgb.b * (1 - factor));
      shades.push(rgbToHex(r, g, b));
    }
    return shades;
  }

  // URL-i yeniləmək funksiyası (Koordinatların URL-ə yazılması hissəsi ləğv edildi)
  function updateURL() {
    // const params = new URLSearchParams();
    // params.set('x', panX.toFixed(2));
    // params.set('y', panY.toFixed(2));
    // params.set('s', scale.toFixed(2));
    // window.history.pushState(null, '', `?${params.toString()}`);
  }

  // Pan hüdudlarını tətbiq edən funksiya
  function clampPan(currentPan, canvasDimension, worldMinCoord, worldMaxCoord, currentScale) {
    const worldWidth = worldMaxCoord - worldMinCoord;
    const worldWidthPx = worldWidth * currentScale;

    // Əgər dünya kətan ölçüsündən kiçikdirsə, mərkəzləşdirin
    if (worldWidthPx < canvasDimension) {
      const centerOffset = (canvasDimension - worldWidthPx) / 2;
      return -worldMinCoord * currentScale + centerOffset;
    } else {
      // Əks halda, hüdudlar daxilində saxlayın
      const minAllowedPan = canvasDimension - (worldMaxCoord * currentScale);
      const maxAllowedPan = -(worldMinCoord * currentScale);
      return Math.min(maxAllowedPan, Math.max(minAllowedPan, currentPan));
    }
  }

  // Pan dəyərlərini hüdudlar daxilində saxlamaq
  function applyPanLimits() {
    panX = clampPan(panX, canvas.width, WORLD_MIN_X, WORLD_MAX_X, scale);
    panY = clampPan(panY, canvas.height, WORLD_MIN_Y, WORLD_MAX_Y, scale);
    // updateURL(); // URL-i yeniləmə çağırışı ləğv edildi
  }

  // Soyuma müddətini Firebase-dən almaq
  onValue(ref(db, 'settings/pixelCooldownMs'), snap => {
    if (snap.exists()) {
      const val = Number(snap.val());
      if (!isNaN(val) && val > 0) {
        cooldownDuration = val;
        // Əgər aktiv soyuma müddəti varsa, onu yeniləyin
        if (Date.now() < cooldownEnd) {
          cooldownEnd = Date.now() + cooldownDuration;
          localStorage.setItem('pixelCooldown', cooldownEnd);
        }
      }
    }
  });

  // Rəng palitrasının tərifi (yenilənmiş)
  const colors = [
    '#FFFFFF', '#C0C0C0', '#808080', '#000000', // Grays
    '#FF0000', '#FF8C00', '#FFD700', '#ADFF2F', // Reds, Orange, Yellow, Green-Yellow
    '#008000', '#00CED1', '#0000FF', '#4B0082', // Dark Green, Turquoise, Blue, Indigo
    '#EE82EE', '#FF69B4', '#800080', '#A52A2A'  // Violet, Hot Pink, Purple, Brown
  ];

  // Əsas rəng palitrasını doldur
  colors.forEach(c => {
    const d = document.createElement("div");
    d.className = "color-swatch";
    d.style.backgroundColor = c;
    d.dataset.color = c;
    d.onclick = () => {
      if (Date.now() < cooldownEnd) {
        showError("Xəta 1001 – Zəhmət olmasa gözləyin!");
        return;
      }
      selectedBaseColor = c; // Ana palitradan seçilmiş rəng
      currentColor = c; // Cari piksel rəngi ana rəng olaraq təyin edilir
      updateSelectedColor();
      displayShades(c); // Seçilmiş ana rəngin tonlarını göstər
    };
    palette.appendChild(d);
  });

  // Tonları göstərmək funksiyası
  function displayShades(baseColor) {
    shadesPalette.innerHTML = ''; // Əvvəlki tonları təmizlə
    shadesPalette.style.display = 'flex'; // Ton palitrasını göstər

    const shades = generateShades(baseColor);

    shades.forEach(shade => {
      const d = document.createElement("div");
      d.className = "color-swatch";
      d.style.backgroundColor = shade;
      d.dataset.color = shade;
      d.onclick = () => {
        if (Date.now() < cooldownEnd) {
          showError("Xəta 1001 – Zəhmət olmasa gözləyin!");
          return;
        }
        currentColor = shade; // Cari piksel rəngini ton olaraq təyin et
        updateSelectedColor(); // Seçimi yenilə
      };
      shadesPalette.appendChild(d);
    });
  }

  // Seçilmiş rəngi yeniləmək funksiyası
  function updateSelectedColor() {
    // Ana palitradakı seçimi yenilə
    document.querySelectorAll('#colorPalette .color-swatch').forEach(div => {
      div.classList.toggle('selected', div.dataset.color === selectedBaseColor);
    });
    // Ton palitrasındakı seçimi yenilə
    document.querySelectorAll('#shadesPalette .color-swatch').forEach(div => {
      div.classList.toggle('selected', div.dataset.color === currentColor);
    });
  }
  // Başlanğıcda ilk rəngi seç və tonlarını göstər
  if (colors.length > 0) {
    selectedBaseColor = colors[0];
    currentColor = colors[0];
    updateSelectedColor();
    displayShades(colors[0]);
  }

  // Xəta mesajını göstərmək funksiyası
  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
    setTimeout(() => errorMessage.style.display = 'none', 3000); // 3 saniyədən sonra gizlət
  }

  // Kətanı çəkmək funksiyası
  function draw() {
    ctx.fillStyle = "#fff"; // Arxa fonu ağ rəngə qoy
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Bütün kətanı doldur

    // Yalnız görünən pikselləri çəkmək üçün optimizasiya
    // Görünən sahənin minimum və maksimum X və Y koordinatlarını hesabla
    const visibleMinX = Math.floor((-panX) / scale);
    const visibleMaxX = Math.ceil((canvas.width - panX) / scale);
    const visibleMinY = Math.floor((-panY) / scale);
    const visibleMaxY = Math.ceil((canvas.height - panY) / scale);

    // Hər bir pikseli dövr et
    for (const k in pixelData) {
      const [x, y] = k.split(',').map(Number); // Pikselin koordinatlarını al
      // Piksel görünən sahədədirsə çəkin
      if (x >= visibleMinX && x <= visibleMaxX && y >= visibleMinY && y <= visibleMaxY) {
        ctx.fillStyle = pixelData[k]; // Pikselin rəngini təyin et
        ctx.fillRect(x * scale + panX, y * scale + panY, scale, scale); // Pikseli çək
      }
    }

    // Əgər önizləmə pikseli varsa və soyuma müddəti bitibsə
    if (previewPixel && Date.now() >= cooldownEnd) {
      const { x, y, color } = previewPixel;
      animationOffset += animationDir * 0.2; // Animasiya ofsetini yenilə
      if (animationOffset > 4 || animationOffset < -4) animationDir *= -1; // Animasiya istiqamətini dəyiş
      animationAngle += 0.03; // Animasiya bucağını yenilə
      const px = x * scale + panX + scale / 2 + animationOffset; // Pikselin mərkəz X koordinatı
      const py = y * scale + panY + scale / 2; // Pikselin mərkəz Y koordinatı
      ctx.save(); // Kətanın cari vəziyyətini yadda saxla
      ctx.translate(px, py); // Mərkəzi pikselin koordinatlarına sürüşdür
      ctx.rotate(Math.sin(animationAngle) * 0.15); // Dönmə effektini tətbiq et
      ctx.globalAlpha = 0.7; // Şəffaflığı təyin et
      ctx.fillStyle = color; // Rəngi təyin et
      ctx.fillRect(-scale / 2, -scale / 2, scale, scale); // Önizləmə pikselini çək
      ctx.restore(); // Kətanın əvvəlki vəziyyətini bərpa et
      ctx.globalAlpha = 1; // Şəffaflığı sıfırla
    }
  }

  // Animasiya dövrü
  function animate() {
    draw(); // Kətanı çək
    updateCooldownUI(); // Soyuma UI-nı yenilə
    requestAnimationFrame(animate); // Növbəti kadrı tələb et
  }
  animate(); // Animasiyanı başlat

  // Zamanı formatlama funksiyası (MM:SS)
  function formatTime(s) {
    const m = Math.floor(s / 60); // Dəqiqəni hesabla
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`; // Formatlanmış zamanı qaytar
  }

  // Soyuma UI-nı yeniləmək funksiyası
  function updateCooldownUI() {
    const diff = Math.floor((cooldownEnd - Date.now()) / 1000); // Qalan soyuma müddətini saniyə ilə hesabla
    if (diff > 0) {
      countdownEl.style.display = 'block'; // Geri sayımı göstər
      countdownEl.textContent = formatTime(diff); // Geri sayımı yenilə
    } else {
      countdownEl.style.display = 'none'; // Geri sayımı gizlət
      cooldownEnd = 0; // Soyuma müddətini sıfırla
      localStorage.removeItem('pixelCooldown'); // Yerli yaddaşdan sil
    }
  }

  // Kətan koordinatlarını almaq funksiyası
  function getCanvasCoords(cx, cy) {
    const r = canvas.getBoundingClientRect(); // Kətanın ölçülərini al
    const x = Math.floor(((cx - r.left) * canvas.width / r.width - panX) / scale); // X koordinatını hesabla
    const y = Math.floor(((cy - r.top ) * canvas.height / r.height - panY) / scale); // Y koordinatını hesabla
    return [x, y]; // Koordinatları qaytar
  }

  // Piksel yerləşdirmək funksiyası
  function placePixel(x, y) {
    // Əgər soyuma müddəti aktivdirsə, xəta göstər
    if (Date.now() < cooldownEnd) {
      showError("Xəta 1001 – Zəhmət olmasa gözləyin!");
      return;
    }
    // Kətan hüdudlarını yoxlayın
    if (x < WORLD_MIN_X || x > WORLD_MAX_X || y < WORLD_MIN_Y || y > WORLD_MAX_Y) {
      showError("Xəta: Kənar hüdudlar xaricində piksel yerləşdirə bilməzsiniz!");
      return;
    }

    pixelData[`${x},${y}`] = currentColor; // Piksel məlumatını yenilə
    set(ref(db, `pixels/${x}_${y}`), currentColor); // Firebase-ə pikseli yaz
    cooldownEnd = Date.now() + cooldownDuration; // Yeni soyuma müddətini təyin et
    localStorage.setItem('pixelCooldown', cooldownEnd); // Yerli yaddaşa yaz
    previewPixel = null; // Önizləmə pikselini sıfırla
  }

  // Sürüşdürmə dəyişənləri
  let drag = false, sx = 0, sy = 0, lx = 0, ly = 0;
  // Mouse aşağı hadisəsi
  canvas.addEventListener("mousedown", e => { drag = true; sx = e.clientX; sy = e.clientY; lx = panX; ly = panY; });
  // Mouse hərəkəti hadisəsi
  canvas.addEventListener("mousemove", e => {
    if (!drag) return; // Əgər sürükləmə aktiv deyilsə, çıx
    panX = lx + (e.clientX - sx); // PanX-i yenilə
    panY = ly + (e.clientY - sy); // PanY-i yenilə
    applyPanLimits(); // Pan hüdudlarını tətbiq et
  });
  // Mouse yuxarı hadisəsi
  canvas.addEventListener("mouseup", e => {
    // Əgər sürüşdürmə minimal idisə (klik hesab olunur)
    if (Math.abs(e.clientX - sx) < 5 && Math.abs(e.clientY - sy) < 5) {
      const [x, y] = getCanvasCoords(e.clientX, e.clientY); // Kətan koordinatlarını al
      // Əgər önizləmə pikseli eyni yerdədirsə, pikseli yerləşdir
      if (previewPixel && previewPixel.x === x && previewPixel.y === y) placePixel(x, y);
      // Əks halda, önizləmə pikselini təyin et
      else previewPixel = { x, y, color: currentColor };
    }
    drag = false; // Sürükləməni sıfırla
    // updateURL(); // URL-i yeniləmə çağırışı ləğv edildi
  });

  // Zoom funksiyası
  function zoomAt(factor, cx = innerWidth / 2, cy = innerHeight / 2) {
    // scale dəyərini məhdudlaşdırın. Minimum miqyası 1, maksimum 100 olaraq təyin edin.
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    // Faktiki miqyas faktorunu hesabla
    const actualFactor = newScale / scale;

    // Dünya koordinatlarını hesabla
    const wx = (cx - panX) / scale;
    const wy = (cy - panY) / scale;
    scale = newScale; // Yeni miqyası təyin et
    // PanX və PanY-i yenidən hesabla
    panX = cx - wx * scale;
    panY = cy - wy * scale;

    applyPanLimits(); // Pan hüdudlarını tətbiq et
    // updateURL(); // URL-i yeniləmə çağırışı ləğv edildi
  }

  // Scroll hadisəsi (zoom üçün)
  canvas.addEventListener("wheel", e => {
    e.preventDefault(); // Varsayılan scroll davranışını ləğv et
    zoomAt(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY); // Zoom et
  }, { passive: false });

  // Zoom daxil və xaric düymələrinin hadisələri
  zoomInBt.onclick = () => { zoomAt(1.2); zoomInBt.blur(); }
  zoomOutBt.onclick = () => { zoomAt(0.8); zoomOutBt.blur(); }

  // Toxunma hadisələri
  canvas.addEventListener("touchstart", e => {
    if (e.touches.length === 2) { // İki barmaqla toxunma (zoom)
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.hypot(dx, dy); // Barmaqlar arasındakı məsafəni hesabla
      currentTouchMode = "zoom"; // Rejimi "zoom" olaraq təyin et
    } else if (e.touches.length === 1) { // Bir barmaqla toxunma (pan)
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; lx = panX; ly = panY;
      currentTouchMode = "pan"; // Rejimi "pan" olaraq təyin et
    }
  });

  canvas.addEventListener("touchmove", e => {
    if (currentTouchMode === "zoom" && e.touches.length === 2 && lastTouchDist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy); // Yeni məsafəni hesabla
      const factor = dist / lastTouchDist; // Zoom faktorunu hesabla
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2; // Mərkəzi X koordinatı
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2; // Mərkəzi Y koordinatı
      zoomAt(factor, cx, cy); // Zoom et
      lastTouchDist = dist; // Son məsafəni yenilə
    } else if (currentTouchMode === "pan" && e.touches.length === 1) {
      panX = lx + (e.touches[0].clientX - sx); // PanX-i yenilə
      panY = ly + (e.touches[0].clientY - sy); // PanY-i yenilə
      applyPanLimits(); // Pan hüdudlarını tətbiq et
    }
    e.preventDefault(); // Varsayılan toxunma davranışını ləğv et
  }, { passive: false });

  canvas.addEventListener("touchend", e => {
    if (currentTouchMode === "pan" && e.changedTouches.length === 1) {
      const [x, y] = getCanvasCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      // Yalnız klik hadisəsini idarə edin (sürüşdürmə deyil)
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      if (Math.abs(touchEndX - sx) < 5 && Math.abs(touchEndY - sy) < 5) {
        if (previewPixel && previewPixel.x === x && previewPixel.y === y) placePixel(x, y);
        else previewPixel = { x, y, color: currentColor };
      }
    }
    lastTouchDist = null; // Son toxunma məsafəsini sıfırla
    currentTouchMode = null; // Cari toxunma rejimini sıfırla
    // updateURL(); // URL-i yeniləmə çağırışı ləğv edildi
  });

  // Firebase-dən pikselləri yükləmək və yeniləmək
  onValue(ref(db, 'pixels'), snap => {
    const d = snap.val(); // Firebase-dən piksel məlumatlarını al
    if (d) {
      // Yalnız yeni və ya dəyişdirilmiş pikselləri yeniləyin
      for (const k in d) {
        const key = k.replace('_', ','); // Açar formatını çevir
        if (pixelData[key] !== d[k]) { // Əgər piksel dəyişibsə və ya yenidirsə
          pixelData[key] = d[k]; // Piksel məlumatını yenilə
        }
      }
      // Silinmiş pikselləri təmizləyin
      for (const k in pixelData) {
        if (!d[k.replace(',', '_')]) { // Əgər piksel Firebase-dən siliniblərsə
          delete pixelData[k]; // Yerli olaraq sil
        }
      }
    } else {
      // Əgər heç bir piksel yoxdursa, bütün yerli pikselləri təmizləyin
      for (const k in pixelData) delete pixelData[k];
    }
    // Yükləmə örtüyünü gizlət və interfeys elementlərini göstər
    loadOv.style.display = "none";
    canvas.style.display = "block";
    palette.style.display = "flex";
    zoomUI.style.display = "flex";
    applyPanLimits(); // İlkin yükləmədə pan hüdudlarını tətbiq edin
    // updateURL(); // İlkin yükləmədə URL-i yeniləmə çağırışı ləğv edildi
  });

  // Pəncərənin ölçüsünü dəyişdirmək funksiyası
  function resize() {
    canvas.width = window.innerWidth; // Kətanın enini pəncərənin eninə bərabərləşdir
    canvas.height = window.innerHeight; // Kətanın hündürlüyünü pəncərənin hündürlüyünə bərabərləşdir
    // panX və panY dəyərlərini yenidən hesablayın (mərkəzləşdirmə üçün)
    // URL-dən oxunan dəyərlər varsa, onları saxlayın, yoxsa pəncərənin mərkəzinə qoyun
    // URL parametrləri oxuyan hissə ləğv edildi
    // const initialPanX = parseFloat(urlParams.get('x'));
    // const initialPanY = parseFloat(urlParams.get('y'));

    // panX = isNaN(initialPanX) ? window.innerWidth / 2 : initialPanX;
    // panY = isNaN(initialPanY) ? window.innerHeight / 2 : initialPanY;
    
    // Yalnız mərkəzi dəyərləri istifadə et
    panX = window.innerWidth / 2;
    panY = window.innerHeight / 2;

    applyPanLimits(); // Pan hüdudlarını tətbiq et
    // updateURL(); // URL-i yeniləmə çağırışı ləğv edildi
    draw(); // Kətanı yenidən çək
  }
  window.addEventListener('resize', resize); // Pəncərə ölçüsü dəyişdikdə resize funksiyasını çağır
  resize(); // Başlanğıcda kətanın ölçüsünü təyin et

  // Onlayn istifadəçilərin statusunu izləmək
  onValue(ref(db, "onlineUsers/statusColor"), snap => {
    if (snap.exists()) {
      const color = snap.val().toLowerCase(); // Status rəngini al
      onlineCountDot.style.backgroundColor = color; // Nöqtənin rəngini dəyiş
      if (color === "#ff0000" || color === "red") { // Əgər status "qırmızı"dırsa (təmir rejimi)
        maintenanceMsg.style.display = "block"; // Təmir mesajını göstər
        canvas.style.display = "none"; // Kətanı gizlət
        palette.style.display = "none"; // Palitranı gizlət
        zoomUI.style.display = "none"; // Zoom idarəetmələrini gizlət
      } else {
        maintenanceMsg.style.display = "none"; // Təmir mesajını gizlət
        canvas.style.display = "block"; // Kətanı göstər
        palette.style.display = "flex"; // Palitranı göstər
        zoomUI.style.display = "flex"; // Zoom idarəetmələrini göstər
      }
    }
  });
