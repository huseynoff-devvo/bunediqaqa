// Firebase konfiqurasiyaları
    const firebaseConfigs = {
        users: {
            apiKey: "AIzaSyBHRY6yGGT9qHV8df1OJXtmbQ7QxWu69ps",
            databaseURL: "https://pasyak-user-default-rtdb.firebaseio.com"
        },
        ids: {
            apiKey: "AIzaSyD0uiBSdiQC2bPQssIgQf4kvQmMHDUsO5c",
            databaseURL: "https://pasyak-id-default-rtdb.firebaseio.com"
        },
        passwords: {
            apiKey: "AIzaSyC8nJ6jro4wDfJXnleItvDinFVCuI0OAvs",
            databaseURL: "https://pasyak-pass-default-rtdb.firebaseio.com"
        },
        banned: { // Banned funksiyası silindiyi üçün bu konfiqurasiya da istifadə edilməyəcək.
            apiKey: "AIzaSyD_wWa67YMLQI_F0Jidp09Ds_rNB1XB4Cs",
            databaseURL: "https://pasyak-grou-default-rtdb.firebaseio.com"
        },
        tick: {
            apiKey: "AIzaSyA2RNLGS-qUkhq6zNGtoUMTXJ3jNTfuHoE",
            databaseURL: "https://pasyak-tick-default-rtdb.firebaseio.com"
        },
        premium: {
            apiKey: "AIzaSyByZEbmw0w1Q5U1LfOrFsjCpd9CXzwyHyc",
            databaseURL: "https://pasyak-premium-default-rtdb.firebaseio.com"
        },
        // Yeni Firebase konfiqurasiyaları
        posts: {
            apiKey: "AIzaSyC_wr_ji3crAVEmRwbHmJ0YJfx46B_as2w",
            authDomain: "pasyakaaz.firebaseapp.com",
            databaseURL: "https://pasyakaaz-default-rtdb.firebaseio.com",
            projectId: "pasyakaaz",
            storageBucket: "pasyakaaz.firebasestorage.app",
            messagingSenderId: "289629756800",
            appId: "1:289629756800:web:f7a6f00fcce2b1eb28b565"
        },
        reels: {
            apiKey: "AIzaSyC6yWCYGtOkJoTOfZRoO8HGo-L_NKR9p5k",
            authDomain: "pasyak-reels.firebaseapp.com",
            databaseURL: "https://pasyak-reels-default-rtdb.firebaseio.com",
            projectId: "pasyak-reels",
            storageBucket: "pasyak-reels.firebasestorage.app",
            messagingSenderId: "635054499590",
            appId: "1:635054499590:web:7b1e9bc84f4b752317e087",
            measurementId: "G-FW0KJDLF4B"
        },
        postComments: {
            apiKey: "AIzaSyBK05tqx2yk3wlNEmkb2V8iUIYP3MAsVVg",
            authDomain: "gonline-1880b.firebaseapp.com",
            databaseURL: "https://gonline-1880b-default-rtdb.firebaseio.com",
            projectId: "gonline-1880b",
            storageBucket: "gonline-1880b.firebasestorage.app",
            messagingSenderId: "988052893147",
            appId: "1:988052893147:web:01586a71f48bd3eae18bfe"
        },
        reelComments: {
            apiKey: "AIzaSyCqiOFuq6usZTZ4zsfd8LcCUdj1hP2j5cQ",
            authDomain: "reply-eb654.firebaseapp.com",
            databaseURL: "https://reply-eb654-default-rtdb.firebaseio.com",
            projectId: "reply-eb654",
            storageBucket: "reply-eb654.firebasestorage.app",
            messagingSenderId: "292801573334",
            appId: "1:292801573334:web:2486813d8fe45865d0f477"
        }
    };

    // Firebase tətbiqlərini başlatın
    const apps = {
        users: firebase.initializeApp(firebaseConfigs.users, "users"),
        ids: firebase.initializeApp(firebaseConfigs.ids, "ids"),
        passwords: firebase.initializeApp(firebaseConfigs.passwords, "passwords"),
        // banned: firebase.initializeApp(firebaseConfigs.banned, "banned"), // Silindi
        tick: firebase.initializeApp(firebaseConfigs.tick, "tick"),
        premium: firebase.initializeApp(firebaseConfigs.premium, "premium"),
        // Yeni tətbiqləri başlatın
        posts: firebase.initializeApp(firebaseConfigs.posts, "posts"),
        reels: firebase.initializeApp(firebaseConfigs.reels, "reels"),
        postComments: firebase.initializeApp(firebaseConfigs.postComments, "postComments"),
        reelComments: firebase.initializeApp(firebaseConfigs.reelComments, "reelComments")
    };

    // Verilənlər bazası referanslarını alın
    const db = {
        users: apps.users.database(),
        ids: apps.ids.database(),
        passwords: apps.passwords.database(),
        // banned: apps.banned.database(), // Silindi
        tick: apps.tick.database(),
        premium: apps.premium.database(),
        // Yeni verilənlər bazası referansları
        posts: apps.posts.database(),
        reels: apps.reels.database(),
        postComments: apps.postComments.database(),
        reelComments: apps.reelComments.database()
    };

    let allUsers = [];
    // let bannedList = {}; // Silindi
    let tickUsers = {};
    let premiumUsers = {};
    let initialLoadComplete = false;

    // Toast mesajı göstərən funksiya (hələlik qalıb, gələcəkdə istifadə oluna bilər)
    function showToast(msg) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    // Təsdiq qutusu göstərən funksiya (hələlik qalıb, gələcəkdə istifadə oluna bilər)
    function showConfirm(msg, onYes) {
        const box = document.createElement("div");
        box.className = "confirm-box";
        box.innerHTML = `<div>${msg}</div>
            <div class="confirm-buttons">
                <button class="btn-yes">Bəli</button>
                <button class="btn-no">Xeyr</button>
            </div>`;
        document.body.appendChild(box);
        box.querySelector(".btn-yes").onclick = () => {
            onYes();
            box.remove();
        };
        box.querySelector(".btn-no").onclick = () => box.remove();
    }

    // Status nişanının URL-ni qaytaran funksiya
    function getStatusBadgeUrl(nickname) {
        const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
        const isTick = tickUsers[cleanNickname] === "+";
        const isPremium = premiumUsers[cleanNickname] === "+";

        if (isTick && isPremium) {
            return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium-tick_ne5yjz.png";
        } else if (isTick) {
            return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/tik_tiozjv.png";
        } else if (isPremium) {
            return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium_aomgkl.png";
        }
        return null;
    }

    // İstifadəçi postlarının sayını gətirən funksiya
    async function fetchPostCommentCount(postId) {
        try {
            const snapshot = await db.postComments.ref(`comments/${postId}`).once("value");
            const data = snapshot.val();
            return data ? Object.keys(data).length : 0;
        } catch (error) {
            console.error(`Post ${postId} üçün şərh sayı gətirilərkən xəta:`, error);
            return 0;
        }
    }

    // Video (reel) şərhlərinin sayını gətirən funksiya
    async function fetchReelCommentCount(reelId) {
        try {
            const snapshot = await db.reelComments.ref(`comments/${reelId}`).once("value");
            const data = snapshot.val();
            return data ? Object.keys(data).length : 0;
        } catch (error) {
            console.error(`Reel ${reelId} üçün şərh sayı gətirilərkən xəta:`, error);
            return 0;
        }
    }

    // İstifadəçinin postlarını gətirən funksiya
    async function fetchUserPosts(nickname) {
        const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
        const postsRef = db.posts.ref("posts");
        const likesRef = db.posts.ref("likes");
        
        const postsSnapshot = await postsRef.once("value");
        const allPostsData = postsSnapshot.val();

        const userPosts = [];
        if (allPostsData) {
            for (const postId in allPostsData) {
                try {
                    const postString = allPostsData[postId];
                    const post = JSON.parse(postString);
                    // Ləqəbi @ olmadan müqayisə edin
                    if (post.nickname && (post.nickname.startsWith('@') ? post.nickname.substring(1) : post.nickname) === cleanNickname) {
                        const likesSnapshot = await likesRef.child(postId).once("value");
                        const likesData = likesSnapshot.val();
                        const likeCount = likesData ? Object.keys(likesData).length : 0;
                        const commentCount = await fetchPostCommentCount(postId);
                        userPosts.push({ id: postId, type: 'post', ...post, likeCount, commentCount });
                    }
                } catch (e) {
                    console.error("Post oxunmadı və ya parse edilə bilmədi:", postId, e);
                }
            }
        }
        return userPosts;
    }

    // İstifadəçinin videolarını (reels) gətirən funksiya
    async function fetchUserReels(nickname) {
        const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
        const reelsRef = db.reels.ref("reels");
        const likesRef = db.reels.ref("likes");

        const reelsSnapshot = await reelsRef.once("value");
        const allReelsData = reelsSnapshot.val();

        const userReels = [];
        if (allReelsData) {
            for (const reelId in allReelsData) {
                try {
                    const reelString = allReelsData[reelId];
                    const reel = JSON.parse(reelString);
                     // Ləqəbi @ olmadan müqayisə edin
                    if (reel.nickname && (reel.nickname.startsWith('@') ? reel.nickname.substring(1) : reel.nickname) === cleanNickname) {
                        const likesSnapshot = await likesRef.child(reelId).child('users').once("value"); // Likes structure changed
                        const likesData = likesSnapshot.val();
                        const likeCount = likesData ? Object.keys(likesData).length : 0;
                        const commentCount = await fetchReelCommentCount(reelId);
                        userReels.push({ id: reelId, type: 'reel', ...reel, likeCount, commentCount });
                    }
                } catch (e) {
                    console.error("Video (reel) oxunmadı və ya parse edilə bilmədi:", reelId, e);
                }
            }
        }
        return userReels;
    }

    // Məzmun elementini render edən funksiya
    function renderContentItem(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'content-item';

        let mediaHtml = '';
        // Əgər şəkil və ya video varsa media göstər, yoxdursa mətn göstər
        if (item.type === 'post' && item.image) {
            mediaHtml = `<img class="content-media" src="${item.image}" alt="Post Şəkili">`;
        } else if (item.type === 'reel' && item.video) {
            mediaHtml = `<video class="content-media" src="${item.video}" autoplay loop muted playsinline></video>`;
        } else if (item.text) { /* Mətn postları üçün əlavə yoxlama */
            mediaHtml = `<div class="content-text-only">${item.text}</div>`;
        } else {
            // Default placeholder if no image, video or text
            mediaHtml = `<img class="content-media" src="https://placehold.co/160x160/333/fff?text=No+Media" alt="Media Yoxdur">`;
        }
        
        itemDiv.innerHTML = `
            ${mediaHtml}
            <div class="content-stats">
                <span><span class="material-icons">favorite</span> ${item.likeCount}</span>
                <span><span class="material-icons">comment</span> ${item.commentCount}</span>
            </div>
        `;
        return itemDiv;
    }

    // İstifadəçi məzmununu göstərən funksiya
    async function displayUserContent(nickname, contentContainer) {
        contentContainer.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div>'; // Yükləmə fırlayıcısı
        
        try {
            const posts = await fetchUserPosts(nickname);
            const reels = await fetchUserReels(nickname);
            
            const allContent = [...posts, ...reels];

            // Məzmunu qarışdırın
            allContent.sort(() => Math.random() - 0.5);

            contentContainer.innerHTML = ''; // Yükləmə fırlayıcısını silin
            if (allContent.length === 0) {
                contentContainer.innerHTML = '<p style="text-align: center; color: #999;">Bu istifadəçinin postu və ya videosu yoxdur.</p>';
            } else {
                const contentGrid = document.createElement('div');
                contentGrid.className = 'content-grid';
                allContent.forEach(item => {
                    contentGrid.appendChild(renderContentItem(item));
                });
                contentContainer.appendChild(contentGrid);
            }
        } catch (error) {
            console.error("İstifadəçi məzmunu gətirilərkən xəta:", error);
            contentContainer.innerHTML = '<p style="text-align: center; color: red;">Məzmun yüklənərkən xəta baş verdi.</p>';
        }
    }
    
    // İstifadəçini render edən funksiya
    function renderUser(name, nick, img) {
        const userDiv = document.createElement('div');
        userDiv.className = 'user';
        // const isBanned = bannedList[nick]; // Silindi
        const statusBadgeUrl = getStatusBadgeUrl(nick);
        const statusBadgeHtml = statusBadgeUrl ? `<img class="status-badge" src="${statusBadgeUrl}" alt="Status" />` : '';

        userDiv.innerHTML = `
            <div class="user-header">
                <img class="profile-pic" src="${img.trim()}" alt="${nick}">
                <div class="user-info">
                    <div class="username">
                        ${name}
                        ${statusBadgeHtml}
                    </div>
                    <div class="nickname">@${nick}</div>
                </div>
                <div class="actions" onclick="event.stopPropagation()">
                    <!-- Silmə və Bloklama ikonları silindi -->
                </div>
            </div>
            <button class="toggle-content-btn" data-target="content-for-${nick}">Postları və videoları göstər</button>
            <div class="user-content-section" id="content-for-${nick}">
                <!-- İstifadəçinin postları və videoları buraya yüklənəcək -->
            </div>
        `;
        document.getElementById('userList').appendChild(userDiv);

        // URL-i dəyişdirmək üçün bütün istifadəçi div-inə klik hadisəsi əlavə edin
        userDiv.addEventListener('click', () => {
            const url = new URL(window.location);
            url.searchParams.set('other', nick);
            history.pushState({}, '', url);
        });

        const toggleButton = userDiv.querySelector('.toggle-content-btn');
        const contentSection = userDiv.querySelector(`#content-for-${nick}`);
        
        // Düyməyə klikləmə hadisəsi əlavə edin
        toggleButton.onclick = async (event) => {
            event.stopPropagation(); // Parent div-ə (userDiv) klik hadisəsinin yayılmasının qarşısını alır
            if (contentSection.classList.contains('open')) {
                contentSection.classList.remove('open');
                contentSection.innerHTML = ''; // Məzmunu təmizləyin
                toggleButton.innerText = "Postları və videoları göstər";
            } else {
                contentSection.classList.add('open');
                toggleButton.innerText = "Gizlə";
                await displayUserContent(nick, contentSection);
            }
        };
    }

    // Yükləmə fırlayıcısını göstər/gizlə
    function showLoading(state) {
        document.getElementById('loadingSpinner').style.display = state ? 'flex' : 'none';
    }

    // İstifadəçi siyahısını göstər/gizlə
    function showUserList(state) {
        document.getElementById('userList').style.display = state ? 'block' : 'none';
    }

    // İstifadəçi siyahısını təmizlə
    function clearUserList() {
        document.getElementById('userList').innerHTML = '';
    }
    
    // Axtarış açar sözünə görə istifadəçiləri filtrləyib göstər
    function displayFilteredUsers(keyword) {
        const filtered = allUsers.filter(user =>
            user.nick.toLowerCase().includes(keyword.toLowerCase()) ||
            user.name.toLowerCase().includes(keyword.toLowerCase())
        );
        clearUserList();
        filtered.forEach(user => {
            renderUser(user.name, user.nick, user.img);
        });
    }

    // Hər hansı bir məlumat dəyişikliyindən sonra çağırıla bilən tək render funksiyası
    function render() {
        if (initialLoadComplete) {
            const currentSearchValue = document.getElementById("searchInput").value;
            displayFilteredUsers(currentSearchValue);
        }
    }

    // Ləqəbə görə ID gətirən funksiya (hələlik qalıb, gələcəkdə istifadə oluna bilər)
    async function getIdByNick(nick) {
        const snapshot = await db.ids.ref("id_info").once("value");
        const data = snapshot.val();
        for (let id in data) {
            try {
                const [savedNick] = JSON.parse(data[id]);
                if (savedNick === nick) return id;
            } catch (e) {
                console.error("ID məlumatı oxunmadı və ya parse edilə bilmədi:", id, e);
            }
        }
        return null;
    }

    // İstifadəçini silməyi təsdiqlə funksiyası silindi
    // Postu silən funksiya silindi
    // Videonu (reeli) silən funksiya silindi
    // Blok statusunu dəyişən funksiya silindi
    
    // Bütün ilkin məlumatları gətirən asinxron funksiya
    async function loadInitialData() {
        showLoading(true);

        const usersPromise = db.users.ref("Users").once("value", snapshot => {
            const data = snapshot.val();
            allUsers = [];
            for (let key in data) {
                try {
                    const [name, nick, img] = JSON.parse(data[key]);
                    allUsers.push({ name, nick, img });
                } catch (e) {
                    console.error("İstifadəçi oxunmadı:", key);
                }
            }
        });

        // const bannedPromise = db.banned.ref("banned").once("value", snapshot => { bannedList = snapshot.val() || {}; }); // Silindi

        const tickPromise = db.tick.ref("tick").once("value", snapshot => {
            tickUsers = snapshot.val() || {};
        });

        const premiumPromise = db.premium.ref("premium").once("value", snapshot => {
            premiumUsers = snapshot.val() || {};
        });
        
        // await Promise.all([usersPromise, bannedPromise, tickPromise, premiumPromise]); // bannedPromise silindi
        await Promise.all([usersPromise, tickPromise, premiumPromise]);
        
        initialLoadComplete = true;
        render(); // Bütün məlumatlar yükləndikdən sonra ilkin render
        showLoading(false);
        showUserList(true);
    }
    
    // --- Real-time Dinləyicilər ---
    // Bu dinləyicilər müvafiq qlobal dəyişəni yeniləyəcək və siyahını yenidən render edəcək
    db.users.ref("Users").on("value", snapshot => {
        const data = snapshot.val();
        allUsers = [];
        for (let key in data) {
            try {
                const [name, nick, img] = JSON.parse(data[key]);
                allUsers.push({ name, nick, img });
            } catch (e) {
                console.error("İstifadəçi oxunmadı:", key);
            }
        }
        render();
    });

    // db.banned.ref("banned").on("value", snapshot => { bannedList = snapshot.val() || {}; render(); }); // Silindi

    db.tick.ref("tick").on("value", snapshot => {
        tickUsers = snapshot.val() || {};
        render();
    });

    db.premium.ref("premium").on("value", snapshot => {
        premiumUsers = snapshot.val() || {};
        render();
    });

    // Axtarış sahəsinin input hadisəsi
    document.getElementById("searchInput").addEventListener("input", e => {
        const value = e.target.value;
        displayFilteredUsers(value);
    });

    // Sənəd yükləndikdə ilkin məlumatları yükləyin
    document.addEventListener('DOMContentLoaded', loadInitialData);
