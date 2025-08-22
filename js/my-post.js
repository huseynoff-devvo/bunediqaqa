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
        // Firebase config for comments on regular posts
        const postsCommentsFirebaseConfig = {
            apiKey: "AIzaSyBK05tqx2yk3wlNEmkb2V8iUIYP3MAsVVg",
            authDomain: "gonline-1880b.firebaseapp.com",
            databaseURL: "https://gonline-1880b-default-rtdb.firebaseio.com",
            projectId: "gonline-1880b",
            storageBucket: "gonline-1880b.firebasestorage.app",
            messagingSenderId: "988052893147",
            appId: "1:988052893147:web:01586a71f48bd3eae18bfe"
        };
        // NEW Firebase config for comments on snaps/reels
        const snapCommentsFirebaseConfig = {
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

        let postsApp, videosApp, postsCommentsApp, snapCommentsApp, tickApp, premiumApp;
        let postsDb, videosDb, postsCommentsDb, snapCommentsDb, tickDb, premiumDb;

        const postsContainer = document.getElementById("posts-grid");
        const noPostsMessage = document.getElementById("no-posts");

        const urlParams = new URLSearchParams(window.location.search);
        const currentUser = (urlParams.get("user") || "anonim").trim();
        const showOnlyMyPosts = urlParams.get("myPosts") === "true";

        let likeCache = {};
        let commentCountCache = {}; // Stores postId -> count
        let postDataCache = {};
        let deletePostId = null;
        let tickUsers = {};
        let premiumUsers = {};

        // Comment Overlay related globals
        let activeCommentPostId = null;
        let activeCommentsDbForOverlay = null; // Which Firebase DB is currently active for the overlay
        let activeCommentListener = null; // To manage Firebase listeners
        let activeCommentData = {}; // Stores comments for the currently open overlay
        let replyingToCommentId = null;
        let replyingToCommentAuthor = null;

        function initializeFirebaseApps() {
            postsApp = firebase.initializeApp(postsFirebaseConfig, "postsApp");
            videosApp = firebase.initializeApp(videosFirebaseConfig, "videosApp");
            postsCommentsApp = firebase.initializeApp(postsCommentsFirebaseConfig, "postsCommentsApp"); // For regular post comments
            snapCommentsApp = firebase.initializeApp(snapCommentsFirebaseConfig, "snapCommentsApp"); // For snap comments
            tickApp = firebase.initializeApp(tickFirebaseConfig, "tickApp");
            premiumApp = firebase.initializeApp(premiumFirebaseConfig, "premiumApp");

            postsDb = postsApp.database();
            videosDb = videosApp.database();
            postsCommentsDb = postsCommentsApp.database(); // For comments on regular posts
            snapCommentsDb = snapCommentsApp.database();   // For comments on snaps
            tickDb = tickApp.database();
            premiumDb = premiumApp.database();
        }

        function getStatusBadge(nickname = "") {
            const cleanNickname = (nickname || "").startsWith('@') ? nickname.substring(1) : nickname;
            const isTick = tickUsers[cleanNickname] === "+";
            const isPremium = premiumUsers[cleanNickname] === "+";
            if (isTick && isPremium) return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium-tick_ne5yjz.png";
            if (isTick) return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/tik_tiozjv.png";
            if (isPremium) return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium_aomgkl.png";
            return null;
        }

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
                badge.textContent = data.image ? "Post" : "Snap"; // Changed to display "Post" for images, "Snap" for videos
                postEl.appendChild(badge);
            }

            const header = document.createElement("div");
            header.className = "post-header";
            // Check if specific post is loaded to display header
            const urlPostId = urlParams.get('post_id');
            const urlSnapId = urlParams.get('snap_id');
            if (urlPostId === postId || urlSnapId === postId) { // Check if the current post matches the URL ID
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

            // Comment count display for ALL posts
            const commentBtn = document.createElement("button");
            commentBtn.className = "comment-button disabled"; // Add disabled class
            commentBtn.setAttribute('aria-disabled', 'true'); // Add aria-disabled for accessibility
            const commentCount = commentCountCache[postId] || 0;
            commentBtn.innerHTML = `<span class="material-icons">comment</span><span class="comment-count">${commentCount}</span>`;
            // Removed event listener to prevent interaction
            // commentBtn.addEventListener("click", (event) => {
            //     event.stopPropagation();
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

        document.getElementById("confirmYes").addEventListener("click", () => {
            if (deletePostId) {
                const post = postDataCache[deletePostId];
                if (post && post.sourceDb) {
                    if (post.sourceDb === postsDb) {
                        postsDb.ref("posts/" + deletePostId).remove();
                        postsDb.ref("likes/" + deletePostId).remove();
                        postsCommentsDb.ref("comments/" + deletePostId).remove(); // Delete comments from postsCommentsDb
                    } else if (post.sourceDb === videosDb) {
                        videosDb.ref("reels/" + deletePostId).remove();
                        videosDb.ref("likes/" + deletePostId).remove();
                        snapCommentsDb.ref("comments/" + deletePostId).remove(); // Delete comments from snapCommentsDb
                    }
                }
                document.getElementById("confirmDialog").style.display = "none";
                deletePostId = null;
                // Yeniləməni tetiklə
                renderAllPosts();
            }
        });

        document.getElementById("confirmNo").addEventListener("click", () => {
            document.getElementById("confirmDialog").style.display = "none";
            deletePostId = null;
        });

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
                    const postEl = renderPost(postId, data);
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

            // Live listener for comments on *regular posts* (from gonline-1880b)
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

            // Live listener for comments on *snaps/reels* (from reply-eb654)
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

        // --- Initial Load Logic ---
        initializeFirebaseApps();

        if (showOnlyMyPosts) {
            Promise.all([
                postsDb.ref("posts").once("value"),
                videosDb.ref("reels").once("value"),
                postsCommentsDb.ref("comments").once("value"), // Fetch initial comments data for posts
                snapCommentsDb.ref("comments").once("value"),  // Fetch initial comments data for snaps
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

                commentCountCache = {}; // Reset cache
                const allCommentsPosts = commentsSnapPosts.val() || {};
                Object.keys(allCommentsPosts).forEach(postId => {
                    commentCountCache[postId] = Object.keys(allCommentsPosts[postId] || {}).length;
                });
                const allCommentsSnaps = commentsSnapSnaps.val() || {};
                Object.keys(allCommentsSnaps).forEach(postId => {
                    // Overwrite/add snap comment counts. Assuming unique IDs between posts and snaps.
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
            document.getElementById("loader").style.display = "none";
            // postsContainer.style.display = "none";
            // noPostsMessage.style.display = "flex";
            // noPostsMessage.querySelector('span:last-child').textContent = "Profil səhifəsini görmək üçün `?myPosts=true` parametri istifadə olunmalıdır.";
        }

        // Comment functionality
        const commentOverlay = document.getElementById('comment-overlay');
        const commentsList = document.getElementById('comments-list');
        const commentInput = document.getElementById('comment-input');
        const sendCommentButton = document.getElementById('send-comment-button');

        function openCommentOverlay(postId, sourceDbForComments) {
            activeCommentPostId = postId;
            activeCommentsDbForOverlay = sourceDbForComments; // Store the correct DB instance

            // Removed URL update to prevent adding '&comment=true'
            // const currentUrl = new URL(window.location.href);
            // const newSearchParams = new URLSearchParams(currentUrl.search);
            // newSearchParams.set('comment', 'true');
            // newSearchParams.delete('postId'); 
            // const newUrl = currentUrl.origin + currentUrl.pathname + '?' + newSearchParams.toString();
            // history.pushState(null, '', newUrl);

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

            // Detach previous listener if any
            if (activeCommentListener) {
                activeCommentListener(); // Call the unsubscribe function
            }

            // Attach a new listener for the specific post and its comments DB
            activeCommentListener = activeCommentsDbForOverlay.ref(`comments/${postId}`).on("value", (snapshot) => {
                activeCommentData = snapshot.val() || {}; // Update active comment data
                renderComments(snapshot); // Render comments using the snapshot
            });
        }

        function closeCommentOverlay() {
            commentOverlay.classList.remove('visible');
            
            // Removed URL update to prevent removing '&comment=true'
            // const currentUrl = new URL(window.location.href);
            // const newSearchParams = new URLSearchParams(currentUrl.search);
            // newSearchParams.delete('comment');
            // newSearchParams.delete('postId'); 
            // const newUrl = currentUrl.origin + currentUrl.pathname + '?' + newSearchParams.toString();
            // history.pushState(null, '', newUrl);

            setTimeout(() => {
                commentOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';

                // Detach listener when closing overlay
                if (activeCommentListener) {
                    activeCommentListener();
                    activeCommentListener = null;
                }
                
                activeCommentPostId = null;
                activeCommentsDbForOverlay = null; // Reset active DB
                activeCommentData = {}; // Clear active comment data
                replyingToCommentId = null;
                replyingToCommentAuthor = null;
                commentInput.value = '';
                commentInput.placeholder = 'Şərh yazın...';
                sendCommentButton.disabled = true;
            }, 300);
        }

        function renderComments(snapshot) {
            commentsList.innerHTML = '';
            const commentsForPost = snapshot.val() || {}; // Use the snapshot data directly
            
            const sortedCommentIds = Object.keys(commentsForPost).sort((a, b) => {
                return commentsForPost[a].timestamp - commentsForPost[b].timestamp;
            });

            sortedCommentIds.forEach(commentId => {
                const commentData = commentsForPost[commentId];
                commentsList.appendChild(createCommentElement(commentId, commentData));
            });
            commentsList.scrollTop = commentsList.scrollHeight;
        }

        function createCommentElement(commentId, commentData, isReply = false) {
            const wrapperElement = document.createElement('div');
            wrapperElement.className = isReply ? 'reply-item' : 'comment-item';
            wrapperElement.id = `${isReply ? 'reply_' : 'comment_'}${commentId}`;

            const profilePic = document.createElement('img');
            profilePic.className = 'profile-pic';
            profilePic.src = commentData.profilePic || "https://placehold.co/35x35/333333/FFFFFF?text=📸";
            profilePic.alt = commentData.nickname + ' profile picture';
            profilePic.onclick = () => window.location.href = `?other_user=${commentData.nickname}`;

            const contentContainer = document.createElement('div');
            contentContainer.className = isReply ? 'reply-content' : 'comment-content';

            const authorTime = document.createElement('div');
            authorTime.className = isReply ? 'reply-author-time' : 'comment-author-time';

            const author = document.createElement('span');
            author.className = isReply ? 'reply-author' : 'comment-author';
            author.textContent = commentData.nickname; // Assuming nickname is the display name for comments
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

            // Like button for comments - ONLY show for top-level comments (not replies)
            // Comment likes are still assumed to be in postsCommentsDb (gonline-1880b)
            if (!isReply) {
                const likeCommentButton = document.createElement('span');
                likeCommentButton.className = 'like-comment-button';
                const commentLikes = postsCommentsDb.ref(`commentLikes/${commentId}/${currentUser}`); // Still using postsCommentsDb for comment likes
                let currentLikesCount = 0;
                let isLikedCommentByUser = false;

                // Fetch current likes for this comment
                commentLikes.once('value').then(snap => {
                    const likesUsers = snap.val() || {};
                    currentLikesCount = Object.keys(likesUsers).length;
                    isLikedCommentByUser = likesUsers[currentUser] === true;

                    likeCommentButton.innerHTML = `
                        <span class="material-icons">${isLikedCommentByUser ? 'favorite' : 'favorite_border'}</span>
                        <span>${currentLikesCount > 0 ? currentLikesCount : ''}</span>
                    `;
                    if (isLikedCommentByUser) likeCommentButton.classList.add('liked');
                });
                
                likeCommentButton.onclick = (e) => {
                    e.stopPropagation();
                    toggleCommentLike(commentId);
                };
                actions.appendChild(likeCommentButton);
            }

            // Reply button
            if (!isReply) { // Only show reply button for top-level comments
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

            // Replies section (only for top-level comments)
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
                    replySection.style.display = 'none'; // Hidden by default
                    
                    sortedReplyIds.forEach(replyId => {
                        const replyData = replies[replyId];
                        // Pass isReply = true when creating reply elements
                        replySection.appendChild(createCommentElement(replyId, replyData, true));
                    });
                    contentContainer.appendChild(replySection);
                }
            }

            return wrapperElement;
        }

        function initiateReply(commentId, authorNickname) {
            replyingToCommentId = commentId;
            replyingToCommentAuthor = authorNickname;
            commentInput.placeholder = `@${authorNickname}'a cavab yazın...`; // Use actual nickname for reply prompt
            commentInput.focus();
        }

        commentInput.addEventListener('input', () => {
            sendCommentButton.disabled = commentInput.value.trim() === '';
        });

        sendCommentButton.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText === '' || !activeCommentPostId || !activeCommentsDbForOverlay) return;

            const newComment = {
                nickname: currentUser.replace('@', ''), // Store clean nickname
                text: commentText,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                profilePic: "https://placehold.co/35x35/333333/FFFFFF?text=📸" // Placeholder, update if user has a real profile pic
            };

            if (replyingToCommentId && replyingToCommentAuthor) {
                // It's a reply
                newComment.replyToNickname = replyingToCommentAuthor.replace('@', ''); // Store clean nickname for replyTo
                activeCommentsDbForOverlay.ref(`comments/${activeCommentPostId}/${replyingToCommentId}/replies`).push(newComment);
            } else {
                // It's a new top-level comment
                activeCommentsDbForOverlay.ref(`comments/${activeCommentPostId}`).push(newComment);
            }

            commentInput.value = '';
            sendCommentButton.disabled = true;
            replyingToCommentId = null;
            replyingToCommentAuthor = null;
            commentInput.placeholder = 'Şərh yazın...';
        });

        function toggleCommentLike(commentId) {
            // Comment likes are still managed by postsCommentsDb (gonline-1880b)
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
        
        // Handle URL changes to open/close comment overlay
        window.addEventListener('popstate', () => {
            const currentUrlParams = new URLSearchParams(window.location.search);
            const isCommentOpenInUrl = currentUrlParams.get('comment') === 'true';
            
            if (isCommentOpenInUrl && !commentOverlay.classList.contains('visible')) {
                // If comment param is present, and overlay not open, try to open.
                // activeCommentPostId and activeCommentsDbForOverlay would need to be re-derived
                // if the user directly navigates to a URL with `?comment=true` and `post_id` or `snap_id`.
                // For now, this relies on activeCommentPostId being set by clicking a post.
                if (activeCommentPostId) {
                     // Determine correct sourceDbForComments based on activeCommentPostId's data type
                    const postData = postDataCache[activeCommentPostId];
                    const commentsSourceDb = postData && postData.sourceDb === postsDb ? postsCommentsDb : snapCommentsDb;
                    // Removed openCommentOverlay call
                    // openCommentOverlay(activeCommentPostId, commentsSourceDb);
                } else {
                    // If no activeCommentPostId, cannot open overlay, just close it if it was open.
                    // Or, if post_id/snap_id is present, try to fetch it.
                    const urlPostId = urlParams.get('post_id');
                    const urlSnapId = urlParams.get('snap_id');
                    const specificPostId = urlPostId || urlSnapId;

                    if (specificPostId) {
                        // Attempt to load the post's comments if ID is in URL
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
                                // Removed openCommentOverlay call
                                // openCommentOverlay(specificPostId, commentsSourceDb);
                            } else {
                                closeCommentOverlay(); // No post found for the ID in URL
                            }
                        }).catch(error => {
                            console.error("Failed to determine post type for comment overlay:", error);
                            closeCommentOverlay();
                        });
                    } else {
                        closeCommentOverlay();
                    }
                }
            } else if (!isCommentOpenInUrl && commentOverlay.classList.contains('visible')) {
                closeCommentOverlay();
            }
        });
