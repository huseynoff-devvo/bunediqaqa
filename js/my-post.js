// Firebase tətbiqlərinin ilkin təyin edilməsi
        const postsFirebaseConfig = {
            apiKey: "AIzaSyBub_6Amz990ee-1ug5KXQNPsjI1HtS5x0",
            authDomain: "posts-974de.firebaseapp.com",
            projectId: "posts-974de",
            storageBucket: "posts-974de.firebasestorage.app",
            messagingSenderId: "40810761225",
            appId: "1:40810761225:web:fb9937042afd554f44bcd8"
        };
        const videosFirebaseConfig = {
            apiKey: "AIzaSyAUFM05EuSmf7921yMyqpaZSP317Ok2ExE",
            authDomain: "videos-55ff4.firebaseapp.com",
            databaseURL: "https://videos-55ff4-default-rtdb.firebaseio.com",
            projectId: "videos-55ff4",
            storageBucket: "videos-55ff4.firebasestorage.app",
            messagingSenderId: "340555774700",
            appId: "1:340555774700:web:73a1717c95d65d71f303c9",
            measurementId: "G-3XWY4C8075"
        };
        // Normal postlar üçün şərhlər Firebase konfiqurasiyası
        const postsCommentsFirebaseConfig = {
            apiKey: "AIzaSyDZ36LJP0iA-X5Ivt9OrR0GOL7Sa6p5KuU",
            authDomain: "comment-posts-2ac08.firebaseapp.com",
            databaseURL: "https://comment-posts-2ac08-default-rtdb.firebaseio.com",
            projectId: "comment-posts-2ac08",
            storageBucket: "comment-posts-2ac08.firebasestorage.app",
            messagingSenderId: "32018634007",
            appId: "1:32018634007:web:8d6895501c5a678a901352"
        };
        // Snaps/reels üçün şərhlər Firebase konfiqurasiyası
        const snapCommentsFirebaseConfig = {
            apiKey: "AIzaSyDbosq-6S2vpxm7PmejRF6X3iFFk6rt78o",
            authDomain: "videos-comment.firebaseapp.com",
            databaseURL: "https://videos-comment-default-rtdb.firebaseio.com",
            projectId: "videos-comment",
            storageBucket: "videos-comment.firebasestorage.app",
            messagingSenderId: "1056870408654",
            appId: "1:1056870408654:web:4685500243ba3ff59fcb9f"
        };

        const tickFirebaseConfig = {
            apiKey: "AIzaSyA2RNLGS-qUkhq6zNGtoUMTXJ3jNTfuHoE",
            authDomain: "pasyak-tick.firebaseapp.com",
            databaseURL: "https://pasyak-tick-default-rtdb.firebaseio.com",
            projectId: "pasyak-tick",
            storageBucket: "pasyak-tick.firebasestorage.app",
            messagingSenderId: "379214418412",
            appId: "1:379214418412:web:904dc0357ecd31f54a70c9",
            measurementId: "G-DW00VF06NR"
        };
        const premiumFirebaseConfig = {
            apiKey: "AIzaSyByZEbmw0w1Q5U1LfOrFsjCpd9CXzwyHyc",
            authDomain: "pasyak-premium.firebaseapp.com",
            databaseURL: "https://pasyak-premium-default-rtdb.firebaseio.com",
            projectId: "pasyak-premium",
            storageBucket: "pasyak-premium.firebasestorage.app",
            messagingSenderId: "662922654975",
            appId: "1:662922654975:web:54b78968d4cccba65f88ca",
            measurementId: "G-QDTFGFYXKK"
        };

        let postsApp, videosApp, postsCommentsApp, snapCommentsApp, tickApp, premiumApp;
        let postsDb, videosDb, postsCommentsDb, snapCommentsDb, tickDb, premiumDb;

        const postsContainer = document.getElementById("posts-grid");
        const noPostsMessage = document.getElementById("no-posts");

        const urlParams = new URLSearchParams(window.location.search);
        const currentUser = (urlParams.get("user") || "anonim").trim();
        const showOnlyMyPosts = urlParams.get("myPosts") === "true";

        // Global cache obyektləri
        let likeCache = {}; // postId -> { count: N, users: { userId: true } }
        let commentCountCache = {}; // postId -> count
        let postDataCache = {}; // postId -> postData
        let deletePostId = null;
        let tickUsers = {}; // nickname -> "+"
        let premiumUsers = {}; // nickname -> "+"

        // Şərh overlay ilə bağlı qlobal dəyişənlər
        let activeCommentPostId = null;
        let activeCommentsDbForOverlay = null; // Hazırda overlay üçün aktiv olan Firebase DB
        let activeCommentListener = null; // Firebase dinləyicilərini idarə etmək üçün
        let replyingToCommentId = null;
        let replyingToCommentAuthor = null;

        // Elementlərə istinadlar
        const commentOverlay = document.getElementById('comment-overlay');
        const commentsList = document.getElementById('comments-list');
        const commentInput = document.getElementById('comment-input');
        const sendCommentButton = document.getElementById('send-comment-button');
        const closeCommentOverlayButton = document.querySelector('.close-comment-overlay');

        // Firebase tətbiqlərini ilkin təyin edir
        function initializeFirebaseApps() {
            postsApp = firebase.initializeApp(postsFirebaseConfig, "postsApp");
            videosApp = firebase.initializeApp(videosFirebaseConfig, "videosApp");
            postsCommentsApp = firebase.initializeApp(postsCommentsFirebaseConfig, "postsCommentsApp");
            snapCommentsApp = firebase.initializeApp(snapCommentsFirebaseConfig, "snapCommentsApp");
            tickApp = firebase.initializeApp(tickFirebaseConfig, "tickApp");
            premiumApp = firebase.initializeApp(premiumFirebaseConfig, "premiumApp");

            postsDb = postsApp.database();
            videosDb = videosApp.database();
            postsCommentsDb = postsCommentsApp.database();
            snapCommentsDb = snapCommentsApp.database();
            tickDb = tickApp.database();
            premiumDb = premiumApp.database();
        }

        // Status nişanını (tick/premium) qaytarır
        function getStatusBadge(nickname = "") {
            const cleanNickname = (nickname || "").startsWith('@') ? nickname.substring(1) : nickname;
            const isTick = tickUsers[cleanNickname] === "+";
            const isPremium = premiumUsers[cleanNickname] === "+";
            if (isTick && isPremium) return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium-tick_ne5yjz.png";
            if (isTick) return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/tik_tiozjv.png";
            if (isPremium) return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium_aomgkl.png";
            return null;
        }

        // Timestamp'ı oxunaqlı formata çevirir
        function formatTimestamp(timestamp) {
            if (!timestamp) return '';
            const date = new Date(timestamp);
            const now = new Date();
            const diffSeconds = Math.floor((now - date) / 1000);

            if (diffSeconds < 60) return `${diffSeconds} saniyə əvvəl`;
            const diffMinutes = Math.floor(diffSeconds / 60);
            if (diffMinutes < 60) return `${diffMinutes} dəqiqə əvvəl`;
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours} saat əvvəl`;
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays < 7) return `${diffDays} gün əvvəl`;
            
            return date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        // Post elementini yaradır və render edir
        function renderPost(postId, data) {
            if (!data) return null;
            if (showOnlyMyPosts) {
                const cleanCurrent = currentUser.startsWith('@') ? currentUser.substring(1) : currentUser;
                const postNick = (data.nickname || "").startsWith('@') ? data.nickname.substring(1) : (data.nickname || "");
                if (postNick !== cleanCurrent) return null;
            }

            const postEl = document.createElement("div");
            postEl.className = "post";
            postEl.id = "post_" + postId;
            
            if (data.image || data.video) {
                const badge = document.createElement("div");
                badge.className = "post-type-badge";
                badge.textContent = data.image ? "Post" : "Snap";
                postEl.appendChild(badge);
            }

            const header = document.createElement("div");
            header.className = "post-header";
            const urlPostId = urlParams.get('post_id');
            const urlSnapId = urlParams.get('snap_id');
            if (urlPostId === postId || urlSnapId === postId) {
                header.style.display = 'flex';
                header.style.alignItems = 'center';
                header.style.marginBottom = '10px';
                header.style.padding = '10px';
            }

            const img = document.createElement("img");
            img.className = "profile-pic";
            img.src = data.profile || "https://via.placeholder.com/36?text=?";
            const userBox = document.createElement("div");
            userBox.className = "username-box";
            const userId = document.createElement("div");
            userId.className = "userid";
            userId.textContent = data.user || "Anonim";
            const statusBadgeUrl = getStatusBadge(data.nickname || "");
            if (statusBadgeUrl) {
                const statusBadgeImg = document.createElement("img");
                statusBadgeImg.className = "status-badge";
                statusBadgeImg.src = statusBadgeUrl;
                userId.appendChild(statusBadgeImg);
            }
            const nickname = document.createElement("div");
            nickname.className = "nickname";
            const displayNickname = (data.nickname || "").startsWith('@') ? data.nickname : `@${(data.nickname || "").replace(/^@/, '')}`;
            nickname.textContent = displayNickname;
            userBox.appendChild(userId);
            userBox.appendChild(nickname);
            header.appendChild(img);
            header.appendChild(userBox);
            const cleanNickname = (data.nickname || "").startsWith('@') ? data.nickname.substring(1) : (data.nickname || "");
            const cleanCurrentUser = currentUser.startsWith('@') ? currentUser.substring(1) : currentUser;
            if (cleanNickname && cleanNickname === cleanCurrentUser) {
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-button material-icons";
                deleteBtn.textContent = "delete";
                deleteBtn.title = "Postu sil";
                deleteBtn.addEventListener("click", () => {
                    deletePostId = postId;
                    document.getElementById("confirmDialog").style.display = "block";
                });
                header.appendChild(deleteBtn);
            }
            postEl.appendChild(header);

            if (data.image) {
                const image = document.createElement("img");
                image.className = "post-image";
                image.src = (data.image || "").replace(/\\/g, '').trim();
                image.addEventListener('load', () => refreshMasonry());
                postEl.appendChild(image);
            } else if (data.video) {
                const video = document.createElement("video");
                video.className = "post-video";
                video.controls = false;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsinline = true;
                video.preload = "none";
                video.dataset.src = (data.video || "").replace(/\\/g, '').trim();
                video.addEventListener('loadedmetadata', () => refreshMasonry());
                postEl.appendChild(video);
            }

            if (data.text) {
                const text = document.createElement("div");
                text.className = "post-text";
                text.textContent = data.text;
                postEl.appendChild(text);
            }

            const postFooter = document.createElement("div");
            postFooter.className = "post-footer";
            
            let currentLikeCount = 0;
            let isLikedByUser = false;
            const postLikes = likeCache[postId];
            if (postLikes && postLikes.users) {
                currentLikeCount = postLikes.count || Object.keys(postLikes.users).length;
                isLikedByUser = postLikes.users[currentUser];
            } else if (postLikes) {
                currentLikeCount = Object.keys(postLikes).length;
                isLikedByUser = postLikes[currentUser];
            }

            const likeBtn = document.createElement("button");
            likeBtn.className = "like-button";
            if (isLikedByUser) likeBtn.classList.add("liked");
            likeBtn.innerHTML = `<span class="material-icons">favorite</span><span class="like-count">${currentLikeCount || 0}</span>`;
            likeBtn.addEventListener("click", () => {
                const likesRef = data.sourceDb.ref(`likes/${postId}`);
                likesRef.once("value").then(snap => {
                    const currentLikesData = snap.val();
                    if (currentLikesData && currentLikesData.users && currentLikesData.users[currentUser]) {
                        likesRef.child(`users/${currentUser}`).remove();
                        likesRef.child("count").transaction(currentCount => (currentCount || 0) - 1);
                    } else if (currentLikesData && currentLikesData[currentUser]) {
                        likesRef.child(currentUser).remove();
                    } else {
                        if (currentLikesData && currentLikesData.users) {
                             likesRef.child(`users/${currentUser}`).set(true);
                             likesRef.child("count").transaction(currentCount => (currentCount || 0) + 1);
                        } else {
                            likesRef.child(currentUser).set(true);
                        }
                    }
                });
            });
            postFooter.appendChild(likeBtn);

            // Bütün postlar üçün şərh sayını göstərir
            const commentBtn = document.createElement("button");
            // Şərh düyməsini deaktiv edir və sadəcə say göstərir
            commentBtn.className = "comment-button disabled"; 
            commentBtn.setAttribute('aria-disabled', 'true'); // Əlçatanlıq üçün əlavə edilib
            const commentCount = commentCountCache[postId] || 0;
            commentBtn.innerHTML = `<span class="material-icons">comment</span><span class="comment-count">${commentCount}</span>`;
            // commentBtn.addEventListener("click", (event) => { // Bu sətir deaktiv edilib
            //     event.stopPropagation();
            //     // Postun növünə uyğun şərh DB-ni təyin edir
            //     const commentsSourceDb = data.sourceDb === postsDb ? postsCommentsDb : snapCommentsDb;
            //     openCommentOverlay(postId, commentsSourceDb);
            // });
            postFooter.appendChild(commentBtn);

            if (cleanNickname && cleanNickname === cleanCurrentUser) {
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-button material-icons";
                deleteBtn.textContent = "delete";
                deleteBtn.title = "Postu sil";
                deleteBtn.addEventListener("click", () => {
                    deletePostId = postId;
                    document.getElementById("confirmDialog").style.display = "block";
                });
                postFooter.appendChild(deleteBtn);
            }
            postEl.appendChild(postFooter);
            return postEl;
        }

        // Post silinməsini təsdiq edir
        document.getElementById("confirmYes").addEventListener("click", () => {
            if (deletePostId) {
                const post = postDataCache[deletePostId];
                if (post && post.sourceDb) {
                    if (post.sourceDb === postsDb) {
                        postsDb.ref("posts/" + deletePostId).remove();
                        postsDb.ref("likes/" + deletePostId).remove();
                        postsCommentsDb.ref("comments/" + deletePostId).remove();
                    } else if (post.sourceDb === videosDb) {
                        videosDb.ref("reels/" + deletePostId).remove();
                        videosDb.ref("likes/" + deletePostId).remove();
                        snapCommentsDb.ref("comments/" + deletePostId).remove();
                    }
                }
                document.getElementById("confirmDialog").style.display = "none";
                deletePostId = null;
                renderAllPosts(); // Postları yeniləyir
            }
        });

        // Post silinməsini ləğv edir
        document.getElementById("confirmNo").addEventListener("click", () => {
            document.getElementById("confirmDialog").style.display = "none";
            deletePostId = null;
        });

        // Bütün postları render edir
        function renderAllPosts() {
            postsContainer.innerHTML = "";
            let postIds = Object.keys(postDataCache || {});
            const cleanCurrent = currentUser.startsWith('@') ? currentUser.substring(1) : currentUser;

            if (showOnlyMyPosts) {
                postIds = postIds.filter(id => {
                    const p = postDataCache[id] || {};
                    const nick = (p.nickname || "").startsWith('@') ? p.nickname.substring(1) : (p.nickname || "");
                    return nick === cleanCurrent;
                });
            }
            
            postIds.sort((a,b) => {
                const aData = postDataCache[a];
                const bData = postDataCache[b];
                const aT = aData && aData.time ? new Date(aData.time) : null;
                const bT = bData && bData.time ? new Date(bData.time) : null;
                if (aT && bT) return bT.getTime() - aT.getTime();
                return b.localeCompare(a);
            });

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
            setupVideoObserver();
        }

        // Bəyənmə saylarını yeniləyir
        function updateLikeCounts() {
            Object.keys(postDataCache).forEach(postId => {
                const postElement = document.getElementById(`post_${postId}`);
                if (postElement) {
                    const postLikes = likeCache[postId];
                    let currentLikeCount = 0;
                    let isLikedByUser = false;
                    
                    if (postLikes && postLikes.users) {
                        currentLikeCount = postLikes.count || Object.keys(postLikes.users).length;
                        isLikedByUser = postLikes.users[currentUser];
                    } else if (postLikes) {
                        currentLikeCount = Object.keys(postLikes).length;
                        isLikedByUser = postLikes[currentUser];
                    }

                    const likeCountElement = postElement.querySelector('.like-count');
                    const likeButtonElement = postElement.querySelector('.like-button');
                    if (likeCountElement) {
                        likeCountElement.textContent = currentLikeCount;
                    }
                    if (likeButtonElement) {
                        if (isLikedByUser) {
                            likeButtonElement.classList.add("liked");
                        } else {
                            likeButtonElement.classList.remove("liked");
                        }
                    }
                }
            });
        }

        // Şərh saylarını yeniləyir
        function updateCommentCounts() {
            Object.keys(postDataCache).forEach(postId => {
                const postElement = document.getElementById(`post_${postId}`);
                if (postElement) {
                    const commentCountElement = postElement.querySelector('.comment-count');
                    if (commentCountElement) {
                        commentCountElement.textContent = commentCountCache[postId] || 0;
                    }
                }
            });
        }

        // Masonry layoutunu yeniləyir
        function refreshMasonry() {
            postsContainer.style.visibility = 'hidden';
            setTimeout(() => { postsContainer.style.visibility = 'visible'; }, 20);
        }

        let videoObserver;
        // Video observerini qurur
        function setupVideoObserver() {
            if ('IntersectionObserver' in window) {
                if (videoObserver) {
                    videoObserver.disconnect();
                }
                videoObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const video = entry.target;
                            const src = video.dataset.src;
                            if (src && !video.src) {
                                video.src = src;
                                video.load();
                                video.play();
                            }
                            observer.unobserve(video);
                        }
                    });
                }, {
                    rootMargin: '100px 0px',
                    threshold: 0.1
                });

                document.querySelectorAll('.post-video').forEach(video => {
                    videoObserver.observe(video);
                });
            }
        }
        
        // Canlı dinləyiciləri qurur
        function setupLiveListeners() {
            postsDb.ref("likes").on("value", (snapshot) => {
                const likesData = snapshot.val() || {};
                Object.keys(likesData).forEach(postId => {
                    likeCache[postId] = likesData[postId];
                });
                updateLikeCounts();
            });

            videosDb.ref("likes").on("value", (snapshot) => {
                 const likesData = snapshot.val() || {};
                 Object.keys(likesData).forEach(postId => {
                    likeCache[postId] = likesData[postId];
                 });
                 updateLikeCounts();
            });

            // Normal postlar üçün şərhlər dinləyicisi (gonline-1880b-dən)
            postsCommentsDb.ref("comments").on("value", (snapshot) => {
                const commentsData = snapshot.val() || {};
                Object.keys(commentsData).forEach(postId => {
                    const commentsForPost = commentsData[postId];
                    if (commentsForPost) {
                        commentCountCache[postId] = Object.keys(commentsForPost).length;
                    }
                });
                updateCommentCounts();
            });

            // Snaps/reels üçün şərhlər dinləyicisi (reply-eb654-dən)
            snapCommentsDb.ref("comments").on("value", (snapshot) => {
                const commentsData = snapshot.val() || {};
                Object.keys(commentsData).forEach(postId => {
                    const commentsForSnap = commentsData[postId];
                    if (commentsForSnap) {
                        commentCountCache[postId] = Object.keys(commentsForSnap).length;
                    }
                });
                updateCommentCounts();
            });
        }

        // --- İlkin Yükləmə Məntiqi ---
        initializeFirebaseApps();

        if (showOnlyMyPosts) {
            document.getElementById("loader").querySelector("p").textContent = ""; // Loader mesajını yeniləyir

            Promise.all([
                postsDb.ref("posts").once("value"),
                videosDb.ref("reels").once("value"),
                postsCommentsDb.ref("comments").once("value"),
                snapCommentsDb.ref("comments").once("value"),
                postsDb.ref("likes").once("value"),
                videosDb.ref("likes").once("value"),
                tickDb.ref("tick").once("value"),
                premiumDb.ref("premium").once("value")
            ]).then(([postsSnap, reelsSnap, commentsSnapPosts, commentsSnapSnaps, postLikesSnap, reelLikesSnap, tickSnap, premiumSnap]) => {
                postDataCache = {};
                
                postsSnap.forEach(snap => {
                    try {
                        const data = (typeof snap.val() === "string") ? JSON.parse(snap.val()) : snap.val();
                        postDataCache[snap.key] = {...data, sourceDb: postsDb};
                    } catch (e) { console.warn("postsDb: Post yüklənərkən xəta:", snap.key, e); }
                });
                reelsSnap.forEach(snap => {
                     try {
                        const data = (typeof snap.val() === "string") ? JSON.parse(snap.val()) : snap.val();
                        postDataCache[snap.key] = {...data, sourceDb: videosDb};
                     } catch (e) { console.warn("videosDb: Video yüklənərkən xəta:", snap.key, e); }
                });

                commentCountCache = {};
                const allCommentsPosts = commentsSnapPosts.val() || {};
                Object.keys(allCommentsPosts).forEach(postId => {
                    commentCountCache[postId] = Object.keys(allCommentsPosts[postId] || {}).length;
                });
                const allCommentsSnaps = commentsSnapSnaps.val() || {};
                Object.keys(allCommentsSnaps).forEach(postId => {
                    commentCountCache[postId] = Object.keys(allCommentsSnaps[postId] || {}).length;
                });
                
                const allPostLikes = postLikesSnap.val() || {};
                Object.keys(allPostLikes).forEach(postId => { likeCache[postId] = allPostLikes[postId]; });
                const allReelLikes = reelLikesSnap.val() || {};
                Object.keys(allReelLikes).forEach(postId => { likeCache[postId] = allReelLikes[postId]; });

                tickUsers = tickSnap.val() || {};
                premiumUsers = premiumSnap.val() || {};

                renderAllPosts();
                
                document.getElementById("loader").style.display = "none";
                if (Object.keys(postDataCache).length > 0) {
                    postsContainer.style.display = "block";
                    noPostsMessage.style.display = "none";
                } else {
                    postsContainer.style.display = "none";
                    noPostsMessage.style.display = "flex";
                }
                
                setupLiveListeners();

            }).catch(error => {
                console.error("Məlumatlar yüklənərkən xəta baş verdi:", error);
                document.getElementById("loader").style.display = "none";
                postsContainer.style.display = "none";
                noPostsMessage.style.display = "flex";
                noPostsMessage.querySelector('span:last-child').textContent = "Məlumat yüklənərkən xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.";
            });

        } else {
            // Əgər myPosts=true parametri yoxdursa, boş səhifə göstərir
            document.getElementById("loader").style.display = "none";
            postsContainer.style.display = "none";
            noPostsMessage.style.display = "flex";
            noPostsMessage.querySelector('span:last-child').textContent = "Profil səhifəsini görmək üçün `?myPosts=true` parametri istifadə olunmalıdır.";
        }

        // Şərh overlayını açır
        function openCommentOverlay(postId, sourceDbForComments) {
            activeCommentPostId = postId;
            activeCommentsDbForOverlay = sourceDbForComments;

            commentOverlay.style.display = 'flex';
            requestAnimationFrame(() => {
                commentOverlay.classList.add('visible');
                document.body.style.overflow = 'hidden';
            });
            
            commentInput.value = '';
            replyingToCommentId = null;
            replyingToCommentAuthor = null;
            commentInput.placeholder = 'Şərh yazın...';
            sendCommentButton.disabled = true;

            if (activeCommentListener) {
                activeCommentListener();
            }

            activeCommentListener = activeCommentsDbForOverlay.ref(`comments/${postId}`).on("value", (snapshot) => {
                renderComments(snapshot);
            });
        }

        // Şərh overlayını bağlayır
        function closeCommentOverlay() {
            commentOverlay.classList.remove('visible');
            
            setTimeout(() => {
                commentOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';

                if (activeCommentListener) {
                    activeCommentListener();
                    activeCommentListener = null;
                }
                
                activeCommentPostId = null;
                activeCommentsDbForOverlay = null;
                replyingToCommentId = null;
                replyingToCommentAuthor = null;
                commentInput.value = '';
                commentInput.placeholder = 'Şərh yazın...';
                sendCommentButton.disabled = true;
            }, 300);
        }

        // Şərhləri render edir
        function renderComments(snapshot) {
            commentsList.innerHTML = '';
            const commentsForPost = snapshot.val() || {};
            
            const sortedCommentIds = Object.keys(commentsForPost).sort((a, b) => {
                return commentsForPost[a].timestamp - commentsForPost[b].timestamp;
            });

            sortedCommentIds.forEach(commentId => {
                const commentData = commentsForPost[commentId];
                commentsList.appendChild(createCommentElement(commentId, commentData));
            });
            commentsList.scrollTop = commentsList.scrollHeight;
        }

        // Şərh elementini yaradır
        function createCommentElement(commentId, commentData, isReply = false) {
            const wrapperElement = document.createElement('div');
            wrapperElement.className = isReply ? 'reply-item' : 'comment-item';
            wrapperElement.id = `${isReply ? 'reply_' : 'comment_'}${commentId}`;

            const profilePic = document.createElement('img');
            profilePic.className = 'profile-pic';
            profilePic.src = commentData.profilePic || "https://placehold.co/35x35/333333/FFFFFF?text=📸";
            profilePic.alt = commentData.nickname + ' profil şəkili';
            profilePic.onclick = () => window.location.href = `?other_user=${commentData.nickname}`;

            const contentContainer = document.createElement('div');
            contentContainer.className = isReply ? 'reply-content' : 'comment-content';

            const authorTime = document.createElement('div');
            authorTime.className = isReply ? 'reply-author-time' : 'comment-author-time';

            const author = document.createElement('span');
            author.className = isReply ? 'reply-author' : 'comment-author';
            author.textContent = commentData.nickname;
            author.onclick = () => window.location.href = `?other_user=${commentData.nickname}`;

            const time = document.createElement('span');
            time.className = isReply ? 'reply-time' : 'comment-time';
            time.textContent = formatTimestamp(commentData.timestamp);

            authorTime.appendChild(author);
            authorTime.appendChild(time);

            const text = document.createElement('div');
            text.className = isReply ? 'reply-text' : 'comment-text';
            
            if (commentData.replyToNickname) {
                const replySpan = document.createElement('span');
                replySpan.style.color = '#4a90e2';
                replySpan.style.fontWeight = 'bold';
                replySpan.style.marginRight = '5px';
                replySpan.textContent = `@${commentData.replyToNickname}`;
                replySpan.onclick = (e) => {
                    e.stopPropagation();
                    window.location.href = `?other_user=${commentData.replyToNickname}`;
                };
                text.appendChild(replySpan);
            }
            text.appendChild(document.createTextNode(commentData.text));


            const actions = document.createElement('div');
            actions.className = 'comment-actions';

            // Şərhlər üçün bəyənmə düyməsi (yalnız əsas şərhlər üçün)
            if (!isReply) {
                const likeCommentButton = document.createElement('span');
                likeCommentButton.className = 'like-comment-button';
                // Şərh bəyənmələrini postsCommentsDb-dən idarə edir
                const commentLikesRef = postsCommentsDb.ref(`commentLikes/${commentId}`);
                
                // Anlıq bəyənmə sayını dinləmək
                commentLikesRef.on('value', snap => {
                    const likesUsers = snap.val() || {};
                    const currentLikesCount = Object.keys(likesUsers).length;
                    const isLikedCommentByUser = likesUsers[currentUser] === true;

                    likeCommentButton.innerHTML = `
                        <span class="material-icons">${isLikedCommentByUser ? 'favorite' : 'favorite_border'}</span>
                        <span>${currentLikesCount > 0 ? currentLikesCount : ''}</span>
                    `;
                    if (isLikedCommentByUser) likeCommentButton.classList.add('liked');
                    else likeCommentButton.classList.remove('liked');
                });
                
                likeCommentButton.onclick = (e) => {
                    e.stopPropagation();
                    toggleCommentLike(commentId);
                };
                actions.appendChild(likeCommentButton);
            }

            // Cavab düyməsi (yalnız əsas şərhlər üçün)
            if (!isReply) {
                const replyButton = document.createElement('span');
                replyButton.className = 'reply-button';
                replyButton.textContent = 'Cavab ver';
                replyButton.onclick = (e) => {
                    e.stopPropagation();
                    initiateReply(commentId, commentData.nickname);
                };
                actions.appendChild(replyButton);
            }

            contentContainer.appendChild(authorTime);
            contentContainer.appendChild(text);
            contentContainer.appendChild(actions);

            wrapperElement.appendChild(profilePic);
            wrapperElement.appendChild(contentContainer);

            // Cavablar bölməsi (yalnız əsas şərhlər üçün)
            if (!isReply) {
                const replies = commentData.replies || {};
                const sortedReplyIds = Object.keys(replies).sort((a, b) => {
                    return replies[a].timestamp - replies[b].timestamp;
                });

                if (sortedReplyIds.length > 0) {
                    const replyToggle = document.createElement('span');
                    replyToggle.className = 'reply-toggle';
                    replyToggle.textContent = `${sortedReplyIds.length} cavaba baxın`;
                    replyToggle.onclick = () => {
                        const replySection = contentContainer.querySelector('.reply-section');
                        if (replySection.style.display === 'none' || replySection.style.display === '') {
                            replySection.style.display = 'block';
                            replyToggle.textContent = 'Cavabları gizlət';
                        } else {
                            replySection.style.display = 'none';
                            replyToggle.textContent = `${sortedReplyIds.length} cavaba baxın`;
                        }
                    };
                    contentContainer.appendChild(replyToggle);

                    const replySection = document.createElement('div');
                    replySection.className = 'reply-section';
                    replySection.style.display = 'none';
                    
                    sortedReplyIds.forEach(replyId => {
                        const replyData = replies[replyId];
                        replySection.appendChild(createCommentElement(replyId, replyData, true));
                    });
                    contentContainer.appendChild(replySection);
                }
            }

            return wrapperElement;
        }

        // Cavab vermə prosesini başlatır
        function initiateReply(commentId, authorNickname) {
            replyingToCommentId = commentId;
            replyingToCommentAuthor = authorNickname;
            commentInput.placeholder = `@${authorNickname}'a cavab yazın...`;
            commentInput.focus();
            adjustCommentInputHeight(); // Input hündürlüyünü tənzimləyir
        }

        // Şərh inputunun hündürlüyünü tənzimləyir
        function adjustCommentInputHeight() {
            commentInput.style.height = 'auto';
            commentInput.style.height = commentInput.scrollHeight + 'px';
        }

        // Şərh inputu dəyişəndə göndər düyməsini aktivləşdirir/deaktivləşdirir
        commentInput.addEventListener('input', () => {
            sendCommentButton.disabled = commentInput.value.trim() === '';
            adjustCommentInputHeight();
        });

        // Şərh göndər düyməsinin klik hadisəsi
        sendCommentButton.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText === '' || !activeCommentPostId || !activeCommentsDbForOverlay) return;

            const newComment = {
                nickname: currentUser.replace('@', ''),
                text: commentText,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                profilePic: "https://placehold.co/35x35/333333/FFFFFF?text=📸"
            };

            if (replyingToCommentId && replyingToCommentAuthor) {
                // Cavab göndərir
                newComment.replyToNickname = replyingToCommentAuthor.replace('@', '');
                activeCommentsDbForOverlay.ref(`comments/${activeCommentPostId}/${replyingToCommentId}/replies`).push(newComment);
            } else {
                // Yeni əsas şərh göndərir
                activeCommentsDbForOverlay.ref(`comments/${activeCommentPostId}`).push(newComment);
            }

            commentInput.value = '';
            sendCommentButton.disabled = true;
            replyingToCommentId = null;
            replyingToCommentAuthor = null;
            commentInput.placeholder = 'Şərh yazın...';
            adjustCommentInputHeight(); // Input hündürlüyünü sıfırlayır
        });

        // Şərh bəyənməsini dəyişir
        function toggleCommentLike(commentId) {
            const likeRef = postsCommentsDb.ref(`commentLikes/${commentId}/${currentUser}`);
            likeRef.once('value').then(snap => {
                const isCurrentlyLiked = snap.exists();
                if (isCurrentlyLiked) {
                    likeRef.remove();
                } else {
                    likeRef.set(true);
                }
            });
        }

        // Şərh overlayını bağlama düyməsi
        closeCommentOverlayButton.addEventListener('click', closeCommentOverlay);

        // URL dəyişikliklərini idarə edir (şərh overlayını açmaq/bağlamaq üçün)
        window.addEventListener('popstate', () => {
            const currentUrlParams = new URLSearchParams(window.location.search);
            const isCommentOpenInUrl = currentUrlParams.get('comment') === 'true';
            
            if (isCommentOpenInUrl && !commentOverlay.classList.contains('visible')) {
                // Əgər URL-də şərh parametri varsa və overlay açıq deyilsə
                const urlPostId = urlParams.get('post_id');
                const urlSnapId = urlParams.get('snap_id');
                const specificPostId = urlPostId || urlSnapId;

                if (specificPostId) {
                    // Postun şərhlərini yükləməyə cəhd edir
                    Promise.all([
                        postsDb.ref(`posts/${specificPostId}`).once('value'),
                        videosDb.ref(`reels/${specificPostId}`).once('value')
                    ]).then(([postSnap, reelSnap]) => {
                        let commentsSourceDb = null;
                        if (postSnap.exists()) {
                            commentsSourceDb = postsCommentsDb;
                        } else if (reelSnap.exists()) {
                            commentsSourceDb = snapCommentsDb;
                        }
                        if (commentsSourceDb) {
                            openCommentOverlay(specificPostId, commentsSourceDb);
                        } else {
                            closeCommentOverlay();
                        }
                    }).catch(error => {
                        console.error("Şərh overlayı üçün post növü müəyyən edilərkən xəta baş verdi:", error);
                        closeCommentOverlay();
                    });
                } else {
                    closeCommentOverlay();
                }
            } else if (!isCommentOpenInUrl && commentOverlay.classList.contains('visible')) {
                // Əgər URL-də şərh parametri yoxdursa və overlay açıqdırsa
                closeCommentOverlay();
            }
        });
