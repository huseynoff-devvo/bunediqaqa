// Firebase konfiqurasiyaları
    const firebaseConfigs = {
        users: {
            apiKey: "AIzaSyA6slU31pyfp7tljAB20Vui1gvptSPEv8M",
            authDomain: "limons-user-e43c0.firebaseapp.com",
            databaseURL: "https://limons-user-e43c0-default-rtdb.firebaseio.com",
            projectId: "limons-user-e43c0",
            storageBucket: "limons-user-e43c0.firebasestorage.app",
            messagingSenderId: "484283046830",
            appId: "1:484283046830:web:ad76e2d421b68f22fd063f"
        },
        ids: {
            apiKey: "AIzaSyD0uiBSdiQC2bPQssIgQf4kvQmMHDUsO5c",
            databaseURL: "https://pasyak-id-default-rtdb.firebaseio.com"
        },
        tick: {
            apiKey: "AIzaSyD1T6HPDf2hbRvEscgIcZDy1Sxy43Hhc4k",
            authDomain: "limon-tick.firebaseapp.com",
            projectId: "limon-tick",
            storageBucket: "limon-tick.firebasestorage.app",
            messagingSenderId: "842530234373",
            appId: "1:842530234373:web:e28cdfe0ff4e0f5e22fc6c",
            measurementId: "G-QYJCF6SVH9"
        },
        premium: {
           apiKey: "AIzaSyAmvp9zNgLRT1LYGQ6RWI6vgRPAYVcvdYw",
            authDomain: "limon-premium.firebaseapp.com",
            projectId: "limon-premium",
            storageBucket: "limon-premium.firebasestorage.app",
            messagingSenderId: "124263926092",
            appId: "1:124263926092:web:f16175fd914b34099be7e9",
            measurementId: "G-FS7KK4770S"
        },
        posts: {
            apiKey: "AIzaSyAjW7zigfYvSyF0DXt3ywu-1PqZDHFbKcc",
            authDomain: "limon-post.firebaseapp.com",
            databaseURL: "https://limon-post-default-rtdb.firebaseio.com",
            projectId: "limon-post",
            storageBucket: "limon-post.firebasestorage.app",
            messagingSenderId: "213746799645",
            appId: "1:213746799645:web:3a4eb82131dc2e1b1622f4"
        },
        postComments: {
            apiKey: "AIzaSyBin2WZ96znrq97fWwxQK5LrLRpVtmnMPU",
            authDomain: "limon-post-comment.firebaseapp.com",
            databaseURL: "https://limon-post-comment-default-rtdb.firebaseio.com",
            projectId: "limon-post-comment",
            storageBucket: "limon-post-comment.firebasestorage.app",
            messagingSenderId: "276602642114",
            appId: "1:276602642114:web:7c0608c003c5e0a254e55b"
        },
    };

    // Firebase tətbiqlərini başlatın
    const apps = {
        users: firebase.initializeApp(firebaseConfigs.users, "users"),
        ids: firebase.initializeApp(firebaseConfigs.ids, "ids"),
        tick: firebase.initializeApp(firebaseConfigs.tick, "tick"),
        premium: firebase.initializeApp(firebaseConfigs.premium, "premium"),
        posts: firebase.initializeApp(firebaseConfigs.posts, "posts"),
        postComments: firebase.initializeApp(firebaseConfigs.postComments, "postComments"),
    };

    // Verilənlər bazası referanslarını alın
    const db = {
        users: apps.users.database(),
        ids: apps.ids.database(),
        tick: apps.tick.database(),
        premium: apps.premium.database(),
        posts: apps.posts.database(),
        postComments: apps.postComments.database(),
    };

    let allUsers = [];
    let tickUsers = {};
    let premiumUsers = {};
    let allContentData = []; // Bütün postlar üçün yeni qlobal dəyişən
    let initialLoadComplete = false;
    let openedPostId = null; // Hal-hazırda açıq olan postun ID-si üçün dəyişən

    // Firebase-dən gələn xammal məlumatları üçün qlobal dəyişənlər (yalnız postlarla bağlı olanlar qaldı)
    let rawPostsFirebaseData = {};
    let rawLikesPostsFirebaseData = {};
    let rawCommentsPostsFirebaseData = {}; // post şərhləri üçün

    // Debounce funksiyası
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Status nişanının URL-ni qaytaran funksiya
    function getStatusBadgeUrl(nickname) {
        const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
        const isTick = tickUsers[cleanNickname] === "+";
        const isPremium = premiumUsers[cleanNickname] === "+";

        if (isTick && isPremium) {
            return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314187/premium-tick_lls2xj.png";
        } else if (isTick) {
            return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314188/tick_bpkpy1.png";
        } else if (isPremium) {
            return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314187/premium-tick_lls2xj.png";
        }
        return null;
    }

    // Bütün xammal məlumatlarını emal edib `allContentData` yaratmaq və render etmək üçün funksiya
    const processAndRenderContent = debounce(async () => {
        if (!initialLoadComplete) return; // İlkin məlumatlar yüklənməyibsə emal etmə

        const tempAllContentData = [];

        // Yalnız Postları emal et
        for (const postId in rawPostsFirebaseData) {
            try {
                const postString = rawPostsFirebaseData[postId];
                const post = JSON.parse(postString);
                const userProfile = allUsers.find(u => (u.nick.startsWith('@') ? u.nick.substring(1) : u.nick) === (post.nickname.startsWith('@') ? post.nickname.substring(1) : post.nickname));
                if (userProfile) {
                    const likeCount = rawLikesPostsFirebaseData[postId] ? Object.keys(rawLikesPostsFirebaseData[postId]).length : 0;
                    // Şərh sayını düzgün şəkildə hesablayın
                    const postComments = rawCommentsPostsFirebaseData[postId];
                    let totalCommentCount = 0;
                    if (postComments) {
                        for (const commentId in postComments) {
                            totalCommentCount++;
                            if (postComments[commentId].replies) {
                                totalCommentCount += Object.keys(postComments[commentId].replies).length;
                            }
                        }
                    }
                    
                    if (post.image) {
                        post.image = post.image.trim(); // Şəkil URL-ni təmizlə
                    }
                    tempAllContentData.push({ id: postId, type: 'post', ...post, likeCount, commentCount: totalCommentCount, userProfile });
                }
            } catch (e) {
                console.error("Post oxunmadı və ya parse edilə bilmədi:", postId, e);
            }
        }

        allContentData = tempAllContentData;
        allContentData.sort(() => Math.random() - 0.5); // Qarışdırın

        const currentSearchValue = document.getElementById("searchInput").value;
        displayFilteredUsers(currentSearchValue); // Mövcud axtarışa əsasən yenidən render et
        
        // Əgər URL-də ?post=true varsa, post modalını aç
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('post') === 'true' && openedPostId) {
            const postToOpen = allContentData.find(item => item.id === openedPostId);
            if (postToOpen) {
                openFullscreenModal(postToOpen, postToOpen.userProfile, false); // URL yenilənmədən aç
            }
        }
    }, 300); // 300ms gecikmə ilə debounce et

    // Məzmun elementini render edən funksiya (ümumi axın üçün)
    function renderContentItemForFeed(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'content-item';

        let mediaHtml = '';
        if (item.type === 'post' && item.image) {
            mediaHtml = `<img class="content-media" src="${item.image}" alt="Post Şəkili" onerror="this.src='https://placehold.co/180x180/333/fff?text=Şəkil+Yoxdur';">`;
        } else if (item.text) { // Sadece text postlar icin
            mediaHtml = `<div class="content-text-only">${item.text}</div>`;
        } else {
            mediaHtml = `<img class="content-media" src="https://placehold.co/180x180/333/fff?text=Məzmun+Yoxdur" alt="Məzmun Yoxdur">`;
        }
        
        itemDiv.innerHTML = `
            ${mediaHtml}
            <div class="content-stats">
                <span><span class="material-icons">favorite</span> ${item.likeCount}</span>
                <span><span class="material-icons">comment</span> ${item.commentCount}</span>
            </div>
        `;

        itemDiv.addEventListener('click', () => {
            openedPostId = item.id; // Açılan postun ID-sini qeyd et
            openFullscreenModal(item, item.userProfile, true); // URL-i yeniləyərək aç
        });

        return itemDiv;
    }

    // Tam ekran modalını açan funksiya
    function openFullscreenModal(item, userProfile, updateUrl = true) {
        const modal = document.getElementById('fullscreenModal');
        const modalContentWrapper = modal.querySelector('.modal-content-wrapper');
        const modalUserPic = document.getElementById('modalUserPic');
        const modalUsername = document.getElementById('modalUsername');
        const modalNickname = document.getElementById('modalNickname');

        modalContentWrapper.innerHTML = ''; // Köhnə məzmunu təmizlə

        // İstifadəçi məlumatlarını doldur
        modalUserPic.src = userProfile.img.trim();
        modalUserPic.alt = userProfile.nick;
        modalUsername.textContent = userProfile.name;
        modalNickname.textContent = `@${userProfile.nick}`;

        // Headerdəki istifadəçi adına klik hadisəsi
        modalUsername.onclick = () => {
            const url = new URL(window.location);
            url.searchParams.set('other', userProfile.nick);
            history.pushState({}, '', url);
            closeFullscreenModal(); // Modalı bağla
            document.getElementById('searchInput').value = userProfile.nick; // Axtarış sahəsini doldur
            displayFilteredUsers(userProfile.nick); // Axtarış nəticələrini göstər
        };

        let mediaElement;
        if (item.type === 'post' && item.image) {
            mediaElement = document.createElement('img');
            mediaElement.src = item.image;
            mediaElement.alt = "Post Şəkili";
            mediaElement.onerror = () => mediaElement.src = 'https://placehold.co/700x500/333/fff?text=Şəkil+Yoxdur';
        } else if (item.text) { // Sadece text postlar icin
            mediaElement = document.createElement('div');
            mediaElement.className = 'modal-text-content';
            mediaElement.textContent = item.text;
        } else {
            mediaElement = document.createElement('img');
            mediaElement.src = 'https://placehold.co/700x500/333/fff?text=Məzmun+Yoxdur';
            mediaElement.alt = "Məzmun Yoxdur";
        }
        modalContentWrapper.appendChild(mediaElement);

        modal.classList.add('open');

        // URL parametrini yeniləyin
        if (updateUrl) {
            const url = new URL(window.location);
            url.searchParams.set('post', 'true');
            url.searchParams.set('postId', item.id); // Post ID-ni də əlavə et
            history.pushState({}, '', url);
        }
    }

    // Tam ekran modalını bağlayan funksiya
    function closeFullscreenModal() {
        document.getElementById('fullscreenModal').classList.remove('open');
        const modalContentWrapper = document.getElementById('fullscreenModal').querySelector('.modal-content-wrapper');
        modalContentWrapper.innerHTML = ''; // Məzmunu təmizlə
        openedPostId = null; // Açılan postun ID-sini sıfırla

        // URL parametrini silin
        const url = new URL(window.location);
        url.searchParams.delete('post');
        url.searchParams.delete('postId'); // Post ID-ni də sil
        history.pushState({}, '', url);
    }
    
    // İstifadəçinin postlarını gətirən funksiya (yalnız axtarış nəticələri üçün)
    function fetchUserContent(nickname) { 
        const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
        
        const userContent = [];
        // Yalnız bu istifadəçiyə aid olan postları (videolar ləğv edildi) filtrele
        allContentData.forEach(item => {
            if (item.type === 'post' && item.userProfile && (item.userProfile.nick.startsWith('@') ? item.userProfile.nick.substring(1) : item.userProfile.nick) === cleanNickname) {
                userContent.push(item);
            }
        });
        
        return userContent.sort(() => Math.random() - 0.5); // Məzmunu qarışdır və qaytar
    }
    
    // Postlar bölməsini göstərən funksiya
    function renderPostsAndReelsSection(contentArray) {
        const postsAndReelsSection = document.getElementById('postsAndReelsSection');
        postsAndReelsSection.innerHTML = ''; // Köhnə məzmunu təmizlə
        if (contentArray.length === 0) {
            postsAndReelsSection.innerHTML = '<p style="text-align: center; color: #999;"></p>';
        } else {
            contentArray.forEach(item => {
                postsAndReelsSection.appendChild(renderContentItemForFeed(item));
            });
        }
        postsAndReelsSection.style.display = 'block'; /* Masonry layout için flex veya grid yerine block */
    }

    // İstifadəçini render edən funksiya (axtarış nəticələri üçün)
    function renderUserCard(user) {
        const cleanNickname = user.nick.startsWith('@') ? user.nick.substring(1) : user.nick;

        const userDiv = document.createElement('div');
        userDiv.className = 'user-card';
        const statusBadgeUrl = getStatusBadgeUrl(user.nick);
        const statusBadgeHtml = statusBadgeUrl ? `<img class="status-badge" src="${statusBadgeUrl}" alt="Status" />` : '';

        userDiv.innerHTML = `
            <div class="user-header">
                <img class="profile-pic" src="${user.img.trim()}" alt="${user.nick}" onerror="this.src='https://placehold.co/55x55/333/fff?text=Şəkil';">
                <div class="user-info">
                    <div class="username">
                        ${user.name}
                        ${statusBadgeHtml}
                    </div>
                    <div class="nickname">@${user.nick}</div>
                </div>
            </div>
        `;
        document.getElementById('searchResults').appendChild(userDiv);

        // URL-i dəyişdirmək üçün istifadəçi header-inə klik hadisəsi əlavə edin
        const userHeader = userDiv.querySelector('.user-header');
        userHeader.addEventListener('click', (event) => {
            event.stopPropagation();
            const url = new URL(window.location);
            url.searchParams.set('other', user.nick);
            history.pushState({}, '', url);
            document.getElementById('searchInput').value = user.nick; // Axtarış sahəsini doldur
            displayFilteredUsers(user.nick); // Axtarış nəticələrini göstər
        });
    }

    // Yükləmə fırlayıcısını göstər/gizlə
    function showLoading(state) {
        document.getElementById('loadingSpinner').style.display = state ? 'flex' : 'none';
    }

    // Axtarış nəticələri siyahısını göstər/gizlə
    function showSearchResults(state) {
        document.getElementById('searchResults').style.display = state ? 'block' : 'none';
    }

    // Axtarış nəticələri siyahısını təmizlə
    function clearSearchResults() {
        document.getElementById('searchResults').innerHTML = '';
    }

    // Axtarış açar sözünə görə istifadəçiləri filtrləyib göstər
    function displayFilteredUsers(keyword) {
        clearSearchResults();
        const postsAndReelsSection = document.getElementById('postsAndReelsSection');
        postsAndReelsSection.style.display = 'none'; // Əvvəlcə postsAndReelsSection-u gizlət

        if (keyword.trim() === '') {
            // Axtarış sahəsi boşdursa, bütün postları göstər
            showSearchResults(false);
            renderPostsAndReelsSection(allContentData); // Bütün məzmunu göstər
            return;
        }

        const filteredUsers = allUsers.filter(user => {
            return user.nick.toLowerCase().includes(keyword.toLowerCase()) ||
                   user.name.toLowerCase().includes(keyword.toLowerCase());
        });
        
        if (filteredUsers.length > 0) {
            filteredUsers.forEach(user => {
                renderUserCard(user);
            });
            showSearchResults(true);

            // Paylaşımları olan bütün axtarış nəticəsi istifadəçilərinin məzmununu yığ
            let combinedFilteredContent = [];
            filteredUsers.forEach(user => {
                const userContent = fetchUserContent(user.nick); // Artıq sadəcə postları gətirir
                combinedFilteredContent = combinedFilteredContent.concat(userContent);
            });
            // Təkrarlanmanı silin (əgər varsa, nadir hallarda ola bilər) və qarışdırın
            const uniqueCombinedContent = Array.from(new Set(combinedFilteredContent.map(item => item.id)))
                                          .map(id => combinedFilteredContent.find(item => item.id === id));
            uniqueCombinedContent.sort(() => Math.random() - 0.5);

            renderPostsAndReelsSection(uniqueCombinedContent);
        } else {
            showSearchResults(false);
            renderPostsAndReelsSection([]); // Axtarış nəticəsi yoxdursa, boş göstər
        }
    }

    // Bütün ilkin məlumatları gətirən asinxron funksiya
    async function loadInitialData() {
        showLoading(true);

        // Bütün ilkin məlumatları bir dəfəyə gətir (yalnız postlarla bağlı olanlar qaldı)
        const [
            usersSnapshot,
            tickSnapshot,
            premiumSnapshot,
            postsSnapshot,
            likesPostsSnapshot,
            commentsPostsSnapshot
        ] = await Promise.all([
            db.users.ref("Users").once("value"),
            db.tick.ref("tick").once("value"),
            db.premium.ref("premium").once("value"),
            db.posts.ref("posts").once("value"),
            db.posts.ref("likes").once("value"),
            db.postComments.ref("comments").once("value"),
        ]);

        // Qlobal dəyişənləri doldur
        const usersData = usersSnapshot.val();
        allUsers = [];
        for (let key in usersData) {
            try {
                const [name, nick, img] = JSON.parse(usersData[key]);
                allUsers.push({ name, nick, img });
            } catch (e) {
                console.error("İstifadəçi oxunmadı:", key);
            }
        }
        tickUsers = tickSnapshot.val() || {};
        premiumUsers = premiumSnapshot.val() || {};
        rawPostsFirebaseData = postsSnapshot.val() || {};
        rawLikesPostsFirebaseData = likesPostsSnapshot.val() || {};
        rawCommentsPostsFirebaseData = commentsPostsSnapshot.val() || {}; // post şərhləri üçün
        
        initialLoadComplete = true;
        processAndRenderContent(); // İlkin emal və render

        // URL parametrini ilkin axtarış üçün istifadə et
        const urlParams = new URLSearchParams(window.location.search);
        const otherUser = urlParams.get('other');
        const postParam = urlParams.get('post');
        const postIdParam = urlParams.get('postId');

        if (otherUser) {
            document.getElementById('searchInput').value = otherUser;
            displayFilteredUsers(otherUser);
        } else if (postParam === 'true' && postIdParam) {
            // URL-də ?post=true və postId varsa, həmin postu aç
            openedPostId = postIdParam; // Açılacaq postun ID-sini qeyd et
            const postToOpen = allContentData.find(item => item.id === postIdParam);
            if (postToOpen) {
                openFullscreenModal(postToOpen, postToOpen.userProfile, false); // URL yenilənmədən aç
            } else {
                renderPostsAndReelsSection(allContentData); // Post tapılmasa, bütün postları göstər
            }
        } else {
            // Axtarış yoxdursa və ya ?post=true yoxdursa, bütün postları göstər
            renderPostsAndReelsSection(allContentData);
        }

        showLoading(false);
    }
    
    // --- Real-time Dinləyicilər ---
    // Bu dinləyicilər xammal məlumatlarını yeniləyəcək və sonra debounced emal funksiyasını çağıracaq
    // Yalnız postlarla bağlı olanlar qaldı

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
        processAndRenderContent(); // İstifadəçi məlumatları dəyişdikdə emal və render
    });

    db.tick.ref("tick").on("value", snapshot => {
        tickUsers = snapshot.val() || {};
        processAndRenderContent(); // Tick məlumatları dəyişdikdə emal və render
    });

    db.premium.ref("premium").on("value", snapshot => {
        premiumUsers = snapshot.val() || {};
        processAndRenderContent(); // Premium məlumatları dəyişdikdə emal və render
    });

    // Xammal məlumatlarını yeniləyin, sonra debounced emalı çağırın (yalnız postlar üçün)
    db.posts.ref("posts").on("value", snapshot => {
        rawPostsFirebaseData = snapshot.val() || {};
        processAndRenderContent();
    });
    db.posts.ref("likes").on("value", snapshot => {
        rawLikesPostsFirebaseData = snapshot.val() || {};
        processAndRenderContent();
    });
    db.postComments.ref("comments").on("value", snapshot => {
        rawCommentsPostsFirebaseData = snapshot.val() || {};
        processAndRenderContent();
    });

    // Axtarış sahəsinin input hadisəsi
    document.getElementById("searchInput").addEventListener("input", e => {
        const value = e.target.value;
        displayFilteredUsers(value);
    });

    // Sənəd yükləndikdə ilkin məlumatları yükləyin
    document.addEventListener('DOMContentLoaded', loadInitialData);

    // İstifadəçi geri düyməsinə basdıqda URL dəyişikliklərini idarə et
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const postParam = urlParams.get('post');
        const postIdParam = urlParams.get('postId');

        if (postParam === 'true' && postIdParam) {
            // URL-də ?post=true varsa, postu aç
            openedPostId = postIdParam;
            const postToOpen = allContentData.find(item => item.id === postIdParam);
            if (postToOpen && !document.getElementById('fullscreenModal').classList.contains('open')) {
                openFullscreenModal(postToOpen, postToOpen.userProfile, false); // URL yenilənmədən aç
            }
        } else {
            // URL-də ?post=true yoxdursa, modalı bağla
            if (document.getElementById('fullscreenModal').classList.contains('open')) {
                closeFullscreenModal();
            }
        }

        const otherUser = urlParams.get('other');
        if (otherUser) {
            document.getElementById('searchInput').value = otherUser;
            displayFilteredUsers(otherUser);
        } else if (!postParam && !otherUser) { // Əgər heç bir parametr yoxdursa, axtarışı təmizlə
            document.getElementById('searchInput').value = '';
            displayFilteredUsers('');
        }
    });
