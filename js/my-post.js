// Firebase V9 Modular SDK Imports
    import { initializeApp as initializeAppV9 } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
    import { 
        getDatabase as getDatabaseV9, 
        ref as refV9, 
        get as getV9,
        onValue as onValueV9 // <<< V9 REAL-TIME DINLƏYİCİ ƏLAVƏ OLUNDU
    } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

    // --- Firebase konfiqurasiyaları (əvvəlki kimi qaldı) ---
    const postsFirebaseConfig = { apiKey: "AIzaSyAjW7zigfYvSyF0DXt3ywu-1PqZDHFbKcc", authDomain: "limon-post.firebaseapp.com", databaseURL: "https://limon-post-default-rtdb.firebaseio.com", projectId: "limon-post", storageBucket: "limon-post.firebasestorage.app", messagingSenderId: "213746799645", appId: "1:213746799645:web:3a4eb82131dc2e1b1622f4" };
    const videosFirebaseConfig = { apiKey: "AIzaSyCI3oZyJXBbZfAFYhhx3mqbtj2lBsVtlVU", authDomain: "limon-video.firebaseapp.com", databaseURL: "https://limon-video-default-rtdb.firebaseio.com", projectId: "limon-video", storageBucket: "limon-video.firebasestorage.app", messagingSenderId: "1027523081229", appId: "1:1027523081229:web:957f99b23a2310a2849144" };
    const postsCommentsFirebaseConfig = { apiKey: "AIzaSyBin2WZ96znrq97fWwxQK5LrLRpVtmnMPU", authDomain: "limon-post-comment.firebaseapp.com", databaseURL: "https://limon-post-comment-default-rtdb.firebaseio.com", projectId: "limon-post-comment", storageBucket: "limon-post-comment.firebasestorage.app", messagingSenderId: "276602642114", appId: "1:276602642114:web:7c0608c003c5e0a254e55b" };
    const snapCommentsFirebaseConfig = { apiKey: "AIzaSyC6YBAAly4wH6o1981ntYANsJIzK_eph1I", authDomain: "limons-video-comment.firebaseapp.com", databaseURL: "https://limons-video-comment-default-rtdb.firebaseio.com", projectId: "limons-video-comment", storageBucket: "limons-video-comment.firebasestorage.app", messagingSenderId: "1097578178676", appId: "1:1097578178676:web:a4f8be6d55b883f6ea8921" };
    const userFirebaseConfig = { apiKey: "AIzaSyA6slU31pyfp7tljAB20Vui1gvptSPEv8M", authDomain: "limons-user-e43c0.firebaseapp.com", databaseURL: "https://limons-user-e43c0-default-rtdb.firebaseio.com", projectId: "limons-user-e43c0", storageBucket: "limons-user-e43c0.firebasestorage.app", messagingSenderId: "484283046830", appId: "1:484283046830:web:ad76e2d2168f22fd063f", measurementId: "G-SHMJSY1S5Z" };
    const followFirebaseConfig = { apiKey: "AIzaSyDohN9yaNE5lxQet1I9m8s4zD778OyYVzg", authDomain: "limon-follow.firebaseapp.com", databaseURL: "https://limon-follow-default-rtdb.firebaseio.com", projectId: "limon-follow", storageBucket: "limon-follow.firebasestorage.app", messagingSenderId: "851250357014", appId: "1:851250357014:web:d7b99931c1a86dbbc2e637", measurementId: "G-N63PV11W8Q" };
    const followingFirebaseConfig = { apiKey: "AIzaSyAHuOrVvJwNk3LG9tqvSA5sdOn7zCs9QAc", authDomain: "limon-following.firebaseapp.com", databaseURL: "https://limon-following-default-rtdb.firebaseio.com", projectId: "limon-following", storageBucket: "limon-following.firebasestorage.app", messagingSenderId: "128241854550", appId: "1:128241854550:web:868457b4e76ff7cefb73f7", measurementId: "G-70DTD9NGBF" };

    const tickFirebaseConfig = { apiKey: "AIzaSyAoYfYv4C22xKKlLQZHSty9YTV6el8QzZw", authDomain: "limons-tick.firebaseapp.com", databaseURL: "https://limons-tick-default-rtdb.firebaseio.com", projectId: "limons-tick", storageBucket: "limons-tick.firebasestorage.app", messagingSenderId: "803200776941", appId: "1:803200776941:web:92acaa749ee25eeeab2ae4", measurementId: "G-7HCR9FS6Q4" }; 
    const premiumFirebaseConfig = { apiKey: "AIzaSyCiOg6YwhtoBNGO3TboCyq0dusXjPLkW5A", authDomain: "limons-premium.firebaseapp.com", databaseURL: "https://limons-premium-default-rtdb.firebaseio.com", projectId: "limons-premium", storageBucket: "limons-premium.firebasestorage.app", messagingSenderId: "9549849500", appId: "1:9549849500:web:936589028b99dfcdbede59", measurementId: "G-XTDYV0RHBJ" }; 
    // -----------------------------------------------------------------

    // Nişan (Icon) URL-ləri
    const TICK_ICON = 'https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314188/tick_bpkpy1.png';
    const PREMIUM_ICON = 'https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314187/premium_rtcvax.png';
    const PREMIUM_TICK_ICON = 'https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314187/premium-tick_lls2xj.png';

    // Nişanlar üçün V9 tətbiqlərini başlanğıclamaq
    const tickAppV9 = initializeAppV9(tickFirebaseConfig, "tickAppV9");
    const premiumAppV9 = initializeAppV9(premiumFirebaseConfig, "premiumAppV9");
    const tickDbV9 = getDatabaseV9(tickAppV9);
    const premiumDbV9 = getDatabaseV9(premiumAppV9);
    // V9 üçün əlavə DB-lər (Real-Time dinləmə üçün lazım olacaq)
    const userAppV9 = initializeAppV9(userFirebaseConfig, "userAppV9");
    const followAppV9 = initializeAppV9(followFirebaseConfig, "followAppV9");
    const followingAppV9 = initializeAppV9(followingFirebaseConfig, "followingAppV9");
    const userDbV9 = getDatabaseV9(userAppV9);
    const followDbV9 = getDatabaseV9(followAppV9);
    const followingDbV9 = getDatabaseV9(followingAppV9);


    let postsApp, videosApp, postsCommentsApp, snapCommentsApp, userApp, followApp, followingApp;
    let postsDb, videosDb, postsCommentsDb, snapCommentsDb, userDb, followDb, followingDb;

    const profileContainer = document.getElementById("profile-container");
    const postsContainer = document.getElementById("posts-grid");
    const noPostsMessage = document.getElementById("no-posts");
    const editButton = document.getElementById("edit-button");

    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = (urlParams.get("user") || "anonim").trim();
    const showOnlyMyPosts = urlParams.get("myPosts") === "true";
    const isEditMode = urlParams.get("redakte") === "true";

    let likeCache = {};
    let commentCountCache = {};
    let postDataCache = {};
    let deletePostId = null;

    // Profil məlumatlarını real-time saxlamaq üçün obyektlər
    let userProfileData = null; 
    let followerCountCache = 0;
    let followingCountCache = 0;
    let postsCountCache = 0;
    let currentIconUrl = '';
    
    // Yalnız cari istifadəçinin postlarının id-lərini saxlayır
    let myPostIds = []; 

    function initializeFirebaseApps() {
        // NOTE: Bu funksiya V8 compat versiyalarını başlanğıcladır
        // Sizin kodu dəyişmirəm, çünki postları V8 API ilə yükləyirsiniz
        postsApp = firebase.initializeApp(postsFirebaseConfig, "postsApp");
        videosApp = firebase.initializeApp(videosFirebaseConfig, "videosApp");
        postsCommentsApp = firebase.initializeApp(postsCommentsFirebaseConfig, "postsCommentsApp");
        snapCommentsApp = firebase.initializeApp(snapCommentsFirebaseConfig, "snapCommentsApp");
        userApp = firebase.initializeApp(userFirebaseConfig, "userApp");
        followApp = firebase.initializeApp(followFirebaseConfig, "followApp");
        followingApp = firebase.initializeApp(followingFirebaseConfig, "followingApp");

        postsDb = postsApp.database();
        videosDb = videosApp.database();
        postsCommentsDb = postsCommentsApp.database();
        snapCommentsDb = snapCommentsApp.database();
        userDb = userApp.database();
        followDb = followApp.database();
        followingDb = followingApp.database();
    }
    // Mətn təmizləmə funksiyaları əvvəlki kimi qalır
        function getContentFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            let content = urlParams.get('user');
            
            if (!content) {
                return "";
            }
            
            if (content.startsWith('@')) {
                content = content.substring(1); 
            }
            
            return content;
        }

        // Qlobal dəyişənlər
        const qrContent = getContentFromUrl(); 
        const qrModal = document.getElementById('qr-modal');
        const closeButton = document.querySelector('.close-button');
        const qrIcon = document.getElementById('qr-icon');
        const qrDataText = document.getElementById('qr-data-text');
        
        // --- QR Kod Modalını İdarə Edən Əsas Funksiyalar ---

        // QR kod modalını açır, QR yaradır və URL-i dəyişir
        function openQrModal(isBackAction = false) {
            qrDataText.textContent = "QR Məzmunu (Təmiz): " + qrContent;
            qrModal.style.display = "flex";
            
            // URL-i yalnız ikona klikləndikdə (və ya səhifə yeniləndikdə) dəyişdiririk. 
            // `isBackAction` true olduqda dəyişiklik etmirik.
            if (!isBackAction) {
                const url = new URL(window.location.href);
                if (url.searchParams.get('qr') !== 'true') {
                    url.searchParams.set('qr', 'true');
                    // URL-i history-ə əlavə et, istifadəçi geri gələ bilsin
                    window.history.pushState({ qr: true }, '', url.href);
                }
            }

            // Əvvəlki QR kodu sil
            document.getElementById("qrcode").innerHTML = "";
            
            // Yeni QR kodu yarat
            new QRCode(document.getElementById("qrcode"), {
                text: qrContent,
                width: 200,
                height: 200,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        }

        // QR kod modalını bağlayır
        function closeQrModal() {
            qrModal.style.display = "none";
        }


        // --- Hadisə Dinləyiciləri (Event Listeners) ---

        // 1. İkona Klikləmə Hadisəsi: QR kodu açır və URL-i dəyişdirir
        qrIcon.onclick = function() {
            // URL-də qr=true olmasa da, klikləyəndə onu əlavə edib modalı açır
            openQrModal(); 
        }

        // 2. Kapatma düyməsi və Kənar Klik: Sadəcə modalı bağlayır
        closeButton.onclick = function() {
            // URL-i geri dəyişdirməyi brauzerin özünə (popstate) buraxırıq. 
            // Sadəcə modalı bağlayanda bir addım geri getməliyik.
            if (new URLSearchParams(window.location.search).has('qr')) {
                 window.history.back();
            } else {
                 closeQrModal();
            }
        }

        window.onclick = function(event) {
            if (event.target == qrModal) {
                 if (new URLSearchParams(window.location.search).has('qr')) {
                     window.history.back();
                } else {
                     closeQrModal();
                }
            }
        }

        // 3. ƏN VACİB HİSSƏ: Brauzerin Geri/İrəli Düyməsi Hadisəsi
        window.addEventListener('popstate', function(event) {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Əgər URL-də `qr=true` varsa (yəni irəli gedilibsə və ya geri gedilsə belə qalıbsa)
            if (urlParams.get('qr') === 'true') {
                openQrModal(true); // Modal qalsın/açılsın (URL dəyişikliyi etmədən)
            } else {
                closeQrModal(); // URL-də `qr=true` yoxdursa, modal bağlansın
            }
        });

        // 4. Səhifə yüklənərkən yoxlama
        // Əgər səhifə yüklənəndə (məsələn, link paylaşılanda) URL-də `qr=true` varsa, avtomatik açılsın
        if (new URLSearchParams(window.location.search).get('qr') === 'true') {
            openQrModal(true);
        }


    /**
     * Profil başlığını (ad, ikon, saylar) yeniləmək üçün ƏSAS funksiya
     * Artıq global kəşləri (cache) istifadə edir.
     */
    function renderProfileHeader(userData, followerCount, followingCount, postsCount, iconUrl) {
        // userProfileData əsas mənbədir, lakin initial load üçün userData qəbul edir.
        const finalUserData = userProfileData || userData; 
        
        if (!finalUserData) return;

        try {
            const userInfo = JSON.parse(finalUserData);
            const [name, nickname, profilePic, , fullId] = userInfo;
            
            const shortId = fullId ? `#${String(fullId).slice(-6)}` : 'N/A';
            
            // Ləqəbi "@" ilə təmizləyib/əlavə edirik
            let cleanNickname = (nickname || 'Anonim').replace('@', '');
            cleanNickname = cleanNickname ? `@${cleanNickname}` : '@Anonim'; 
            
            // Top bar nickname'i yerləşdirmək
            const topBarNicknameEl = document.getElementById('top-bar-nickname');
            if (topBarNicknameEl) {
                topBarNicknameEl.textContent = cleanNickname;
            }

            // Əsas profil məlumatları
            document.getElementById('profile-pic').src = profilePic || "https://placehold.co/120x120/000000/fff?text=?";
            document.getElementById('profile-main-name').textContent = name || nickname.replace('@', '') || 'Anonim';
            document.getElementById('profile-id').textContent = `ID: ${shortId}`;
            
            // Real-time yenilənəcək saylar
            document.getElementById('posts-count').textContent = postsCount;
            document.getElementById('followers-count').textContent = followerCount;
            document.getElementById('following-count').textContent = followingCount;
            
            // Nişanları göstərmək
            const badgeDisplayLarge = document.getElementById('badge-icon-display-large');
            if (iconUrl) {
                badgeDisplayLarge.innerHTML = `<img src="${iconUrl}" alt="Status İkonu" class="status-icon-large">`;
                badgeDisplayLarge.style.opacity = 1; 
            } else {
                badgeDisplayLarge.innerHTML = '';
                badgeDisplayLarge.style.opacity = 0; 
            }

            // Statistika klik funksiyaları (əvvəlki kimi)
            const updateUrl = (param, value) => {
                const newParams = new URLSearchParams(window.location.search);
                newParams.delete('settings');
                newParams.delete('kayd');
                newParams.delete('follow');
                newParams.delete('following');
                newParams.delete('redakte');
                if (value) newParams.set(param, value);
                return `?${newParams.toString()}`;
            };

            document.getElementById('settings-btn').href = updateUrl('settings', 'true');
            document.getElementById('save-btn').href = updateUrl('saved', 'true');
            document.getElementById('followers-stat').onclick = () => window.location.href = updateUrl('follow', 'true');
            document.getElementById('following-stat').onclick = () => window.location.href = updateUrl('following', 'true');
            
            editButton.onclick = () => {
                const currentUrl = new URL(window.location.href);
                if (currentUrl.searchParams.get('redakte') === 'true') {
                    currentUrl.searchParams.delete('redakte');
                } else {
                    currentUrl.searchParams.set('redakte', 'true');
                }
                window.location.href = currentUrl.toString();
            };
            
            if (isEditMode) {
                editButton.textContent = "Redaktə et";
                document.getElementById('settings-btn').style.display = 'none'; 
            } else {
                editButton.textContent = "Redaktə et";
            }
            
            profileContainer.style.display = "flex";

        } catch (e) {
            console.error("Profil məlumatı parse edilərkən xəta:", e);
        }
    }
    
    // Digər köməkçi funksiyalar (renderPost, confirmYes/No, renderAllPosts) əvvəlki kimi qalır...

    function renderPost(postId, data) {
        if (!data) return null;

        const postEl = document.createElement("div");
        postEl.className = "post";
        postEl.id = "post_" + postId;

        // Media (şəkil/video)
        let mediaElement = null;
        if (data.image) {
            const image = document.createElement("img");
            image.className = "post-image";
            image.src = (data.image || "").replace(/\\/g, '').trim();
            image.addEventListener('load', () => refreshMasonry());
            mediaElement = image;
        } else if (data.video) {
            const video = document.createElement("video");
            video.className = "post-video";
            video.controls = false;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsinline = true;
            video.src = (data.video || "").replace(/\\/g, '').trim();
            video.addEventListener('loadedmetadata', () => refreshMasonry());
            mediaElement = video;
        }
        if (mediaElement) postEl.appendChild(mediaElement);

        
        // --- LONG-PRESS DELETE LOGIC ---
        const cleanNickname = (data.nickname || "").replace('@', '');
        const cleanCurrentUser = currentUser.replace('@', '');
        const isMyPost = cleanNickname === cleanCurrentUser;
        
        if (isMyPost) {
            let pressTimer = null;
            const LONG_PRESS_TIME = 700; // 700ms uzun basma vaxtı

            const startPress = (e) => {
                if(pressTimer) return;
                
                pressTimer = setTimeout(() => {
                    deletePostId = postId;
                    document.getElementById("confirmDialog").style.display = "flex";
                    
                    postEl.classList.add('long-pressed'); 
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }, LONG_PRESS_TIME);
            };

            const endPress = () => {
                clearTimeout(pressTimer);
                pressTimer = null;
                postEl.style.opacity = 1; 
            };
            
            // Mouse events (Desktop)
            postEl.addEventListener('mousedown', startPress);
            postEl.addEventListener('mouseup', endPress);
            postEl.addEventListener('mouseleave', endPress);

            // Touch events (Mobile)
            postEl.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) return endPress(); 
                postEl.style.opacity = 0.85; 
                startPress(e);
            });
            postEl.addEventListener('touchend', endPress);
            postEl.addEventListener('touchcancel', endPress);

            // Uzun basma olubsa, normal click-in işə düşməsinin qarşısını al
            postEl.addEventListener('click', (e) => {
                if (postEl.classList.contains('long-pressed')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    postEl.classList.remove('long-pressed'); 
                    return false;
                }
            });
        }
        // --- END LONG-PRESS DELETE LOGIC ---


        const postFooter = document.createElement("div");
        // postFooter.className = "post-footer";
        
        // --- 1. LIKE AND COMMENT COUNTS (Bəyənmə və Şərh Sayları) ---
        const postStats = document.createElement("div");
        postStats.className = "post-stats";
        postStats.id = `stats_${postId}`;
        
        // // Like Count
        // const likeCount = likeCache[postId] ? Object.keys(likeCache[postId]).length : 0;
        // const likeEl = document.createElement("div");
        // likeEl.className = "stat-item like";
        // likeEl.innerHTML = `<span class="material-icons">favorite</span><span id="like_count_${postId}">${likeCount}</span>`; 
        // likeEl.title = "Bəyənmə sayı";
        // postStats.appendChild(likeEl);

        // // Comment Count
        // const commentCount = commentCountCache[postId] || 0;
        // const commentEl = document.createElement("div");
        // commentEl.className = "stat-item comment";
        // commentEl.innerHTML = `<span class="material-icons">comment</span><span id="comment_count_${postId}">${commentCount}</span>`; 
        // commentEl.title = "Şərh sayı";
        // postStats.appendChild(commentEl);
        
        // postFooter.appendChild(postStats); // Stats solda
        
        // postEl.appendChild(postFooter);
        return postEl;
    }

    document.getElementById("confirmYes").addEventListener("click", () => {
        if (deletePostId) {
            const post = postDataCache[deletePostId];
            if (post && post.sourceDb) {
                const dbRefPath = post.sourceDb === postsDb ? "posts" : "reels";
                const commentsDb = post.sourceDb === postsDb ? postsCommentsDb : snapCommentsDb;
                
                // Postu, like-ları və şərhləri silirik
                post.sourceDb.ref(`${dbRefPath}/${deletePostId}`).remove();
                post.sourceDb.ref(`likes/${deletePostId}`).remove();
                commentsDb.ref(`comments/${deletePostId}`).remove();
            }
            document.getElementById("confirmDialog").style.display = "none";
            
            // Postu HTML-dən sil
            document.getElementById("post_" + deletePostId)?.remove();
            
            // Post sayı kəşini və profili yenilə
            postsCountCache = Math.max(0, postsCountCache - 1);
            renderProfileHeader(null, followerCountCache, followingCountCache, postsCountCache, currentIconUrl);
            
            deletePostId = null;
            refreshMasonry();
        }
    });

    document.getElementById("confirmNo").addEventListener("click", () => {
        document.getElementById("confirmDialog").style.display = "none";
        deletePostId = null;
    });

    function renderAllPosts(postIds) {
        postsContainer.innerHTML = "";
        if (postIds.length === 0) {
                noPostsMessage.style.display = "flex";
                postsContainer.style.display = "none";
        } else {
            noPostsMessage.style.display = "none";
            postsContainer.style.display = "block";
            postIds.forEach(postId => {
                const data = postDataCache[postId];
                const postEl = renderPost(postId, data);
                if (postEl) postsContainer.appendChild(postEl);
            });
        }
        refreshMasonry();
    }

    /**
     * Bəyənmə (Like) saylarını real-vaxtda yeniləyir.
     */
    function updateLikeCounts() {
        Object.keys(likeCache).forEach(postId => {
            const count = likeCache[postId] ? Object.keys(likeCache[postId]).length : 0;
            const countEl = document.getElementById(`like_count_${postId}`);
            if (countEl) {
                countEl.textContent = count;
            }
        });
    }
    
    /**
     * Şərh (Comment) saylarını real-vaxtda yeniləyir.
     */
    function updateCommentCounts() {
        Object.keys(commentCountCache).forEach(postId => {
            const count = commentCountCache[postId] || 0;
            const countEl = document.getElementById(`comment_count_${postId}`);
            if (countEl) {
                countEl.textContent = count;
            }
        });
    }

    function refreshMasonry() {
        // Masonry layout üçün kiçik trick
        postsContainer.style.visibility = 'hidden';
        setTimeout(() => { postsContainer.style.visibility = 'visible'; }, 20);
    }
    
    // --- YENİ REAL-TIME DİNLƏYİCİLƏR (V9) ---
    async function setupRealTimeProfileListeners(cleanCurrentUser) {
        
        // 1. İstifadəçi Məlumatlarını dinləmək
        onValueV9(refV9(userDbV9, `Users/${cleanCurrentUser}`), (snapshot) => {
            userProfileData = snapshot.val();
            // Profil başlığını yenilə
            renderProfileHeader(userProfileData, followerCountCache, followingCountCache, postsCountCache, currentIconUrl);
        });

        // 2. İzləyicilərin sayını dinləmək (Follower Count)
        onValueV9(refV9(followDbV9, cleanCurrentUser), (snapshot) => {
            const followData = snapshot.val() || { follow: 0 };
            followerCountCache = followData.follow || 0;
            // Profil başlığını yenilə
            renderProfileHeader(userProfileData, followerCountCache, followingCountCache, postsCountCache, currentIconUrl);
        });

        // 3. İzlənənlərin sayını dinləmək (Following Count)
        onValueV9(refV9(followingDbV9, cleanCurrentUser), (snapshot) => {
            const followingData = snapshot.val() || { following: 0 };
            followingCountCache = followingData.following || 0;
            // Profil başlığını yenilə
            renderProfileHeader(userProfileData, followerCountCache, followingCountCache, postsCountCache, currentIconUrl);
        });

        // 4. Tick Nişanını dinləmək
        const tickRef = refV9(tickDbV9, 'tick');
        onValueV9(tickRef, (snapshot) => {
            const statusMap = snapshot.val() || {};
            const isTick = statusMap[cleanCurrentUser] === '+';
            
            // Premium statusunu yoxla
            const isPremium = currentIconUrl === PREMIUM_ICON || currentIconUrl === PREMIUM_TICK_ICON;
            
            let newIconUrl = '';
            if (isTick && isPremium) newIconUrl = PREMIUM_TICK_ICON;
            else if (isTick) newIconUrl = TICK_ICON;
            else if (isPremium) newIconUrl = PREMIUM_ICON;
            
            if (newIconUrl !== currentIconUrl) {
                currentIconUrl = newIconUrl;
                renderProfileHeader(userProfileData, followerCountCache, followingCountCache, postsCountCache, currentIconUrl);
            }
        });

        // 5. Premium Nişanını dinləmək
        const premiumRef = refV9(premiumDbV9, 'premium');
        onValueV9(premiumRef, (snapshot) => {
            const statusMap = snapshot.val() || {};
            const isPremium = statusMap[cleanCurrentUser] === '+';

            // Tick statusunu yoxla (Nişanın hansı DB-də olduğunu bilmək üçün)
            const isTick = currentIconUrl === TICK_ICON || currentIconUrl === PREMIUM_TICK_ICON;

            let newIconUrl = '';
            if (isTick && isPremium) newIconUrl = PREMIUM_TICK_ICON;
            else if (isTick) newIconUrl = TICK_ICON;
            else if (isPremium) newIconUrl = PREMIUM_ICON;

            if (newIconUrl !== currentIconUrl) {
                currentIconUrl = newIconUrl;
                renderProfileHeader(userProfileData, followerCountCache, followingCountCache, postsCountCache, currentIconUrl);
            }
        });

        // 6. Post siyahılarını dinləmək (Post/Reel əlavə ediləndə/silinəndə)
        
        // Postlar
        postsDb.ref("posts").on("value", (snapshot) => {
            snapshot.forEach(s => { 
                const data = JSON.parse(s.val());
                if ((data.nickname || "").replace('@', '') === cleanCurrentUser) {
                    postDataCache[s.key] = {...data, sourceDb: postsDb};
                } else {
                    delete postDataCache[s.key]; // Başqa istifadəçinin postu silinir
                }
            });
            updateMyPostsAndRender();
        });

        // Reels
        videosDb.ref("reels").on("value", (snapshot) => {
            snapshot.forEach(s => { 
                const data = JSON.parse(s.val());
                if ((data.nickname || "").replace('@', '') === cleanCurrentUser) {
                    postDataCache[s.key] = {...data, sourceDb: videosDb};
                } else {
                    delete postDataCache[s.key]; // Başqa istifadəçinin postu silinir
                }
            });
            updateMyPostsAndRender();
        });
    }

    function updateMyPostsAndRender() {
        const cleanCurrentUser = currentUser.replace('@', '');
        
        // Yalnız cari istifadəçiyə aid postları yenidən filtrlə və zamanına görə sırala
        myPostIds = Object.keys(postDataCache).filter(id => {
            const p = postDataCache[id];
            return (p.nickname || "").replace('@', '') === cleanCurrentUser;
        }).sort((a,b) => (postDataCache[b].time || 0) - (postDataCache[a].time || 0));

        postsCountCache = myPostIds.length;
        
        // Sayları və postları yenilə
        renderProfileHeader(userProfileData, followerCountCache, followingCountCache, postsCountCache, currentIconUrl);
        renderAllPosts(myPostIds);
    }

    // --- MÖVCUD V8 REAL-TIME DİNLƏYİCİLƏR (Likes/Comments) ---
    function setupLiveListeners() {
        const allDbRefs = [
            // Post/Reel Like Saylarını dinləmək (Likes)
            { db: postsDb, path: "likes" }, { db: videosDb, path: "likes" },
            // Post/Snap Comment Saylarını dinləmək (Comments)
            { db: postsCommentsDb, path: "comments" }, { db: snapCommentsDb, path: "comments" }
        ];
        
        allDbRefs.forEach(refInfo => {
            // V8 API-dən istifadə edirsiniz (Firebase Realtime DB-nin V8-dəki `.on("value")` metodu)
            refInfo.db.ref(refInfo.path).on("value", (snapshot) => {
                const data = snapshot.val() || {};
                if (refInfo.path === "likes") {
                    // Likes kəşini birləşdir
                    Object.assign(likeCache, data);
                    updateLikeCounts(); // Sayları yenilə
                } else if (refInfo.path === "comments") {
                    // Comment saylarını hesablayıb kəşə yaz
                    Object.keys(data).forEach(postId => {
                        commentCountCache[postId] = Object.keys(data[postId] || {}).length;
                    });
                    updateCommentCounts(); // Sayları yenilə
                }
            });
        });
    }

    initializeFirebaseApps();

    if (showOnlyMyPosts && currentUser !== "anonim") {
        const cleanCurrentUser = currentUser.replace('@', '');
        
        // Nişan statuslarını **ilkin** yoxlamaq üçün promise
        const badgeCheckPromise = (async () => {
            try {
                const [isTick, isPremium] = await Promise.all([
                    checkNicknameStatus(tickDbV9, 'tick', cleanCurrentUser),
                    checkNicknameStatus(premiumDbV9, 'premium', cleanCurrentUser)
                ]);

                if (isTick && isPremium) return PREMIUM_TICK_ICON;
                if (isTick) return TICK_ICON;
                if (isPremium) return PREMIUM_ICON;
                return '';
            } catch (e) {
                console.error("Nişan yoxlanışı xətası:", e);
                return '';
            }
        })();


        // --- İLKİN YÜKLƏNMƏ (V8 `.once()` ilə) ---
        Promise.all([
            postsDb.ref("posts").once("value"),
            videosDb.ref("reels").once("value"),
            postsCommentsDb.ref("comments").once("value"),
            snapCommentsDb.ref("comments").once("value"),
            postsDb.ref("likes").once("value"),
            videosDb.ref("likes").once("value"),
            userDb.ref(`Users/${cleanCurrentUser}`).once("value"),
            followDb.ref(cleanCurrentUser).once("value"),
            followingDb.ref(cleanCurrentUser).once("value"),
            badgeCheckPromise
        ]).then(([
            postsSnap, reelsSnap, 
            commentsPostsSnap, commentsSnapsSnap, 
            postLikesSnap, reelLikesSnap,
            userSnap, followSnap, followingSnap,
            iconUrl
        ]) => {
            // Kəşləri ilkin dəyərlərlə doldur
            postDataCache = {};
            postsSnap.forEach(s => { 
                try { postDataCache[s.key] = {...JSON.parse(s.val()), sourceDb: postsDb}; } catch(e){} 
            });
            reelsSnap.forEach(s => { 
                try { postDataCache[s.key] = {...JSON.parse(s.val()), sourceDb: videosDb}; } catch(e){}
            });
            
            commentCountCache = {};
            const commentsPosts = commentsPostsSnap.val() || {};
            const commentsSnaps = commentsSnapsSnap.val() || {};
            Object.keys(commentsPosts).forEach(pid => { commentCountCache[pid] = Object.keys(commentsPosts[pid] || {}).length; });
            Object.keys(commentsSnaps).forEach(pid => { commentCountCache[pid] = Object.keys(commentsSnaps[pid] || {}).length; });
            
            likeCache = { ...postLikesSnap.val(), ...reelLikesSnap.val() };
            
            // Global kəşləri təyin et
            userProfileData = userSnap.val();
            followerCountCache = (followSnap.val()?.follow || 0);
            followingCountCache = (followingSnap.val()?.following || 0);
            currentIconUrl = iconUrl;
            
            // Postları filtrlə, sırala və kəşə yaz
            updateMyPostsAndRender();
            
            // Profil başlıqlarını ilkin render etmək
            renderProfileHeader(userProfileData, followerCountCache, followingCountCache, postsCountCache, currentIconUrl);
            
            // Loaderi gizlət
            document.getElementById("loader").style.display = "none";
            
            // REAL-TIME DİNLƏYİCİLƏRİ BAŞLAT
            setupLiveListeners(); // V8 (Likes/Comments)
            setupRealTimeProfileListeners(cleanCurrentUser); // V9 (Profile/Follows/Icons)

        }).catch(error => {
            console.error("Məlumatlar yüklənərkən xəta baş verdi:", error);
            document.getElementById("loader").style.display = "none";
            noPostsMessage.style.display = "flex";
            noPostsMessage.querySelector('span:last-child').textContent = "Məlumat yüklənərkən xəta baş verdi.";
        });

    } else {
        document.getElementById("loader").style.display = "none";
        noPostsMessage.style.display = "flex";
        noPostsMessage.querySelector('span:last-child').textContent = "";
    }
