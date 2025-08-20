 // ---- Firebase apps initialization ----
        const postsFirebaseConfig = {
            apiKey: "AIzaSyC_wr_ji3crAVEmRwbHmJ0YJfx46B_as2w",
            authDomain: "pasyakaaz.firebaseapp.com",
            projectId: "pasyakaaz",
            storageBucket: "pasyakaaz.appspot.com",
            messagingSenderId: "289629756800",
            appId: "1:289629756800:web:f7a6f00fcce2b1eb28b565"
        };
        const videosFirebaseConfig = {
            apiKey: "AIzaSyC6yWCYGtOkJoTOfZRoO8HGo-L_NKR9p5k",
            authDomain: "pasyak-reels.firebaseapp.com",
            databaseURL: "https://pasyak-reels-default-rtdb.firebaseio.com",
            projectId: "pasyak-reels",
            storageBucket: "pasyak-reels.firebasestorage.app",
            messagingSenderId: "635054499590",
            appId: "1:635054499590:web:7b1e9bc84f4b752317e087",
            measurementId: "G-FW0KJDLF4B"
        };
        const commentsFirebaseConfig = {
            apiKey: "AIzaSyCqiOFuq6usZTZ4zsfd8LcCUdj1hP2j5cQ",
            authDomain: "reply-eb654.firebaseapp.com",
            databaseURL: "https://reply-eb654-default-rtdb.firebaseio.com",
            projectId: "reply-eb654",
            storageBucket: "reply-eb654.firebasestorage.app",
            messagingSenderId: "292801573334",
            appId: "1:292801573334:web:2486813d8fe45865d0f477"
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

        let postsApp, videosApp, commentsApp, tickApp, premiumApp;
        let postsDb, videosDb, commentsDb, tickDb, premiumDb;

        const postsContainer = document.getElementById("posts-grid");
        const noPostsMessage = document.getElementById("no-posts");

        const urlParams = new URLSearchParams(window.location.search);
        const currentUser = (urlParams.get("user") || "anonim").trim();
        const showOnlyMyPosts = urlParams.get("myPosts") === "true";

        let likeCache = {};
        let commentCountCache = {};
        let postDataCache = {};
        let tickUsers = {};
        let premiumUsers = {};

        function initializeFirebaseApps() {
            postsApp = firebase.initializeApp(postsFirebaseConfig, "postsApp");
            videosApp = firebase.initializeApp(videosFirebaseConfig, "videosApp");
            commentsApp = firebase.initializeApp(commentsFirebaseConfig, "commentsApp");
            tickApp = firebase.initializeApp(tickFirebaseConfig, "tickApp");
            premiumApp = firebase.initializeApp(premiumFirebaseConfig, "premiumApp");

            postsDb = postsApp.database();
            videosDb = videosApp.database();
            commentsDb = commentsApp.database();
            tickDb = tickApp.database();
            premiumDb = premiumApp.database();
        }

        function getStatusBadge(nickname = "") {
            const cleanNickname = (nickname || "").startsWith('@') ? nickname.substring(1) : nickname;
            const isTick = tickUsers[cleanNickname] === "+";
            const isPremium = premiumUsers[cleanNickname] === "+";
            if (isTick && isPremium) return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium-tick_ne5yjz.png";
            if (isTick) return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/tik_tiozjv.png";
            if (isPremium) return "https://res.com/dhski1gkx/image/upload/v1754247890/premium_aomgkl.png";
            return null;
        }

        function createPostElement(postId, data) {
            let postEl = document.createElement("div");
            postEl.className = "post";
            postEl.id = "post_" + postId;
            postEl.dataset.time = data.time;

            if (data.image || data.video) {
                const badge = document.createElement("div");
                badge.className = "post-type-badge";
                badge.textContent = data.video ? "Snap" : "Post";
                postEl.appendChild(badge);
            }

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
                video.autoplay = false;
                video.loop = true;
                video.muted = true;
                video.playsinline = true;
                video.preload = "none";
                video.dataset.src = (data.video || "").replace(/\\/g, '').trim();
                video.addEventListener('loadedmetadata', () => refreshMasonry());
                postEl.appendChild(video);
                setupVideoObserver();
            }

            if (data.text) {
                const text = document.createElement("div");
                text.className = "post-text";
                text.textContent = data.text;
                postEl.appendChild(text);
            }

            const postFooter = document.createElement("div");
            postFooter.className = "post-footer";
            
            // Like count display
            const likeCount = likeCache[postId] ? (likeCache[postId].count || Object.keys(likeCache[postId].users || {}).length) : 0;
            const likeDisplay = document.createElement("div");
            likeDisplay.className = "like-display";
            likeDisplay.innerHTML = `<span class="material-icons">favorite</span><span class="like-count">${likeCount}</span>`;
            postFooter.appendChild(likeDisplay);

            // Comment count display (only for videos)
            if (data.video) {
                const commentBtn = document.createElement("button");
                commentBtn.className = "comment-button";
                const commentCount = commentCountCache[postId] || 0;
                commentBtn.innerHTML = `<span class="material-icons">comment</span><span class="comment-count">${commentCount}</span>`;
                postFooter.appendChild(commentBtn);
            }

            postEl.appendChild(postFooter);
            return postEl;
        }

        function renderAllPosts() {
            postsContainer.innerHTML = "";
            let postIds = Object.keys(postDataCache || {});
            const cleanCurrent = currentUser.startsWith('@') ? currentUser.substring(1) : currentUser;

            postIds = postIds.filter(id => {
                const p = postDataCache[id] || {};
                const nick = (p.nickname || "").startsWith('@') ? p.nickname.substring(1) : (p.nickname || "");
                return nick === cleanCurrent;
            });
            
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
                    const postEl = createPostElement(postId, data);
                    if (postEl) postsContainer.appendChild(postEl);
                });
            }
            refreshMasonry();
            setupVideoObserver();
        }

        function updateLikeCounts() {
            Object.keys(postDataCache).forEach(postId => {
                const postElement = document.getElementById(`post_${postId}`);
                if (postElement) {
                    const postLikes = likeCache[postId];
                    let currentLikeCount = 0;
                    if (postLikes && postLikes.users) {
                        currentLikeCount = postLikes.count || Object.keys(postLikes.users).length;
                    } else if (postLikes) {
                        currentLikeCount = Object.keys(postLikes).length;
                    }

                    const likeCountElement = postElement.querySelector('.like-count');
                    if (likeCountElement) {
                        likeCountElement.textContent = currentLikeCount;
                    }
                }
            });
        }

        function updateCommentCounts() {
            Object.keys(postDataCache).forEach(postId => {
                const postElement = document.getElementById(`post_${postId}`);
                const postData = postDataCache[postId];
                if (postElement && postData && postData.video) {
                    const commentCountElement = postElement.querySelector('.comment-count');
                    if (commentCountElement) {
                        commentCountElement.textContent = commentCountCache[postId] || 0;
                    }
                }
            });
        }

        function refreshMasonry() {
            postsContainer.style.visibility = 'hidden';
            setTimeout(() => { postsContainer.style.visibility = 'visible'; }, 20);
        }

        let videoObserver;
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
                        } else {
                           const video = entry.target;
                           video.pause();
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

            commentsDb.ref("comments").on("value", (snapshot) => {
                commentCountCache = {};
                const commentsData = snapshot.val() || {};
                Object.keys(commentsData).forEach(postId => {
                    const commentsForPost = commentsData[postId];
                    if (commentsForPost) {
                        commentCountCache[postId] = Object.keys(commentsForPost).length;
                    }
                });
                updateCommentCounts();
            });
        }

        // --- Initial Load Logic ---
        initializeFirebaseApps();
        const cleanCurrentUser = currentUser.startsWith('@') ? currentUser.substring(1) : currentUser;
        
        if (showOnlyMyPosts && cleanCurrentUser === "huseynoff") {
            Promise.all([
                postsDb.ref("posts").once("value"),
                videosDb.ref("reels").once("value"),
                commentsDb.ref("comments").once("value"),
                postsDb.ref("likes").once("value"),
                videosDb.ref("likes").once("value"),
                tickDb.ref("tick").once("value"),
                premiumDb.ref("premium").once("value")
            ]).then(([postsSnap, reelsSnap, commentsSnap, postLikesSnap, reelLikesSnap, tickSnap, premiumSnap]) => {
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
                
                const allComments = commentsSnap.val() || {};
                Object.keys(allComments).forEach(postId => {
                    commentCountCache[postId] = Object.keys(allComments[postId] || {}).length;
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
                console.error("Məlumatlar yüklənərkən ilkin xəta baş verdi:", error);
                document.getElementById("loader").style.display = "none";
                postsContainer.style.display = "none";
                noPosts.style.display = "flex";
                noPosts.querySelector('span:last-child').textContent = "Məlumat yüklənərkən xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.";
            });

        } else {
            document.getElementById("loader").style.display = "none";
            postsContainer.style.display = "none";
            noPostsMessage.style.display = "flex";
        }
