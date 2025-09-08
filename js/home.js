// Postlar və bəyənmələr üçün Firebase konfiqurasiyası (pasyakaaz proyektindən)
        const postsFirebaseConfig = {
            apiKey: "AIzaSyBub_6Amz990ee-1ug5KXQNPsjI1HtS5x0",
            authDomain: "posts-974de.firebaseapp.com",
            projectId: "posts-974de",
            storageBucket: "posts-974de.firebasestorage.app",
            messagingSenderId: "40810761225",
            appId: "1:40810761225:web:fb9937042afd554f44bcd8"
        };

        // Şərhlər və şərh bəyənmələri üçün Firebase konfiqurasiyası (gonline-1880b proyektindən)
        const commentsFirebaseConfig = {
            apiKey: "AIzaSyDZ36LJP0iA-X5Ivt9OrR0GOL7Sa6p5KuU",
            authDomain: "comment-posts-2ac08.firebaseapp.com",
            projectId: "comment-posts-2ac08",
            storageBucket: "comment-posts-2ac08.firebasestorage.app",
            messagingSenderId: "32018634007",
            appId: "1:32018634007:web:8d6895501c5a678a901352"
        };

        // GIF-lər üçün Firebase konfiqurasiyası
        const gifFirebaseConfig = {
            apiKey: "AIzaSyAhlu3_n59ESLxV6k8Ll4scIRK45CPS4z8",
            authDomain: "gif-s-a9eca.firebaseapp.com",
            databaseURL: "https://gif-s-a9eca-default-rtdb.firebaseio.com",
            projectId: "gif-s-a9eca",
            storageBucket: "gif-s-a9eca.firebasestorage.app",
            messagingSenderId: "684950243730",
            appId: "1:684950243730:web:44d8c3251d10b807ee594b"
        };
        
        // Yeni: Qeyd edilmiş postlar üçün Firebase konfiqurasiyası
        const savedPostsFirebaseConfig = {
            apiKey: "AIzaSyBzlIzk5xg0Wf4i-jOWXxOfPhm6mZ0fuco",
            authDomain: "post-save-1fcd7.firebaseapp.com",
            databaseURL: "https://post-save-1fcd7-default-rtdb.firebaseio.com",
            projectId: "post-save-1fcd7",
            storageBucket: "post-save-1fcd7.firebasestorage.app",
            messagingSenderId: "243734688763",
            appId: "1:243734688763:web:8a0ccc25dbf1ff2dad915e",
            measurementId: "G-V6BEP937Q8"
        };


        // Ayrı Firebase tətbiplərini ilkinləşdir
        const postsApp = firebase.initializeApp(postsFirebaseConfig, "postsApp");
        const commentsApp = firebase.initializeApp(commentsFirebaseConfig, "commentsApp");
        const gifApp = firebase.initializeApp(gifFirebaseConfig, "gifApp"); // GIF tətbiqini ilkinləşdir
        const savedPostsApp = firebase.initializeApp(savedPostsFirebaseConfig, "savedPostsApp"); // Yeni: Qeyd edilmiş postlar tətbiqi

        const db = postsApp.database(); // Bu, postlar və bəyənmələr üçün istifadə ediləcək
        const commentsDb = commentsApp.database(); // Bu, şərhlər və şərh bəyənmələri üçün istifadə ediləcək
        const gifDb = gifApp.database(); // Bu, GIF-lər üçün istifadə ediləcək
        const savedPostsDb = savedPostsApp.database(); // Yeni: Qeyd edilmiş postlar üçün istifadə ediləcək

        const postsContainer = document.getElementById("posts");
        const noSavedPostsMessage = document.getElementById("no-saved-posts-message"); // Yeni: Qeyd yoxdur mesajı elementi
        const urlParams = new URLSearchParams(window.location.search);
        const currentUser = urlParams.get("user") || "@?";
        let currentUserProfilePic = urlParams.get("profile");
        const currentUserName = urlParams.get("name") || "";

        let likeCache = {};
        let postCache = {};
        let commentsCache = {};
        let commentLikesCache = {};
        let deletePostId = null;
        let dataLoaded = { posts: false, likes: false, tick: false, premium: false, users: false, following: false, stories: false, storyLikes: false, storyReadStatusFromFirebase: false, storyViews: false, comments: false, commentLikes: false, userFollows: false, userFollowing: false, gifs: false, savedPosts: false }; // savedPosts əlavə edildi
        let initialLoadDone = false;
        let activeCommentPostId = null;
        let replyingToCommentId = null;
        let replyingToCommentAuthor = null;
        // Postların sıralamasını qeyd etmək üçün dəyişən
        let postOrder = [];

        // Yeni əlavələr
        let deletingComment = null; // Silinəcək şərhi izləmək üçün
        let deletingCommentIsReply = false; // Silinəcək şərhin cavab olub olmadığını izləmək üçün
        let deletingParentCommentId = null; // Əgər cavab silinirsə, əsas şərhin ID-si
        
        let savedPostsCache = {}; // Yeni: Yadda saxlanılan postları saxlamaq üçün cache
        let savedPostsByUserCache = {}; // Yeni: Cari istifadəçi tərəfindən yadda saxlanılan postları saxlamaq üçün cache


        const tickFirebaseConfig = {
            apiKey: "AIzaSyD1T6HPDf2hbRvEscgIcZDy1Sxy43Hhc4k",
            authDomain: "limon-tick.firebaseapp.com",
            projectId: "limon-tick",
            storageBucket: "limon-tick.firebasestorage.app",
            messagingSenderId: "842530234373",
            appId: "1:842530234373:web:e28cdfe0ff4e0f5e22fc6c",
            measurementId: "G-QYJCF6SVH9"
        };
        const premiumFirebaseConfig = {
            apiKey: "AIzaSyAmvp9zNgLRT1LYGQ6RWI6vgRPAYVcvdYw",
            authDomain: "limon-premium.firebaseapp.com",
            projectId: "limon-premium",
            storageBucket: "limon-premium.firebasestorage.app",
            messagingSenderId: "124263926092",
            appId: "1:124263926092:web:f16175fd914b34099be7e9",
            measurementId: "G-FS7KK4770S"
        };
        const userFirebaseConfig = {
            apiKey: "AIzaSyB2DUu0hgiawkexdHOR4h6DZ9vijv5y-bQ",
            authDomain: "limon-user.firebaseapp.com",
            databaseURL: "https://limon-user-default-rtdb.firebaseio.com",
            projectId: "limon-user",
            storageBucket: "limon-user.firebasestorage.app",
            messagingSenderId: "567469231536",
            appId: "1:567469231536:web:9c7fcb1b36103adfb85a75",
        };
        
        // Yeni Firebase konfiqurasiyaları
        const followsFirebaseConfig = {
            apiKey: "AIzaSyBpkbzgOVBi3GQAzQPSVy7IiNWvZ59s3Y8",
            authDomain: "pasyak-follow.firebaseapp.com",
            projectId: "pasyak-follow",
            storageBucket: "pasyak-follow.firebasestorage.app",
            messagingSenderId: "543550446057",
            appId: "1:543550446057:web:e27fe3d5d4030639519378",
            measurementId: "G-FHP4YSSQD1"
        };
        
        const followingFirebaseConfig = {
            apiKey: "AIzaSyCx5eRzSQ1fjSfsLdTWMQJgi8DGm696UtE",
            authDomain: "pasyak-following-fd47e.firebaseapp.com",
            projectId: "pasyak-following-fd47e",
            storageBucket: "pasyak-following-fd47e.firebasestorage.app",
            messagingSenderId: "843465544263",
            appId: "1:843465544263:web:f5095e55df279bdbdbd762",
            measurementId: "G-B290TXF8TT"
        };

        const gonlineFirebaseConfig = {
            apiKey: "AIzaSyA8x2GSDNtmvo5CzHGwEXATfqCwuRUQzIk",
            authDomain: "story-d7363.firebaseapp.com",
            projectId: "story-d7363",
            storageBucket: "story-d7363.firebasestorage.app",
            messagingSenderId: "777806383281",
            appId: "1:777806383281:web:6fe8d99230c2e9107e3a90",
            measurementId: "G-EM4NKNSLLJ"
        };

        const tickApp = firebase.initializeApp(tickFirebaseConfig, "tickApp");
        const premiumApp = firebase.initializeApp(premiumFirebaseConfig, "premiumApp");
        const userApp = firebase.initializeApp(userFirebaseConfig, "userApp");
        // Yeni Firebase tətbiqlərinin ilkinləşdirilməsi
        const followsApp = firebase.initializeApp(followsFirebaseConfig, "followsApp");
        const followingApp = firebase.initializeApp(followingFirebaseConfig, "followingApp");
        const gonlineApp = firebase.initializeApp(gonlineFirebaseConfig, "gonlineApp");

        const tickDb = tickApp.database();
        const premiumDb = premiumApp.database();
        const userDb = userApp.database();
        const followsDb = followsApp.database(); // Follows databazası
        const followingDb = followingApp.database(); // Following databazası
        const gonlineDb = gonlineApp.database(); // Gonline databazası stories üçün

        let tickUsers = {};
        let premiumUsers = {};
        let allUsers = {};
        let followingUsersStories = []; // Storylərdə istifadə olunan followingUsers adını dəyişdiririk
        let userFollows = {}; // İstifadəçinin kim tərəfindən follow edildiyi
        let userFollowing = {}; // İstifadəçinin kimləri follow etdiyi
        let allStories = { images: {}, videos: {} };
        let activeStory = null;
        let activeStoryIndex = 0;
        let storyTimeout;
        let currentStoryUser = null;
        let storyLikesCache = {};
        let storyViewsCache = {};
        let currentStoryElement = null;
        let mediaLoadingTimeout;
        let firebaseStoryReadStatus = {};
        let mediaDuration;
        let progressStartTime = 0;
        let isPaused = false;
        let lastTouchTime = 0;
        let allGifs = {}; // GIF-ləri saxlamaq üçün obyekt

        // Reklamlar massivi
        const ads = [
            // {"image":"https://res.cloudinary.com/dhski1gkx/image/upload/v1756117214/ChatGPT_Image_25_A%C4%9Fu_2025_14_10_20_q1hc4u.png","text":"Reax -İctimaiyyəti birləşdirən, yerli dəyərləri qoruyan və insanları daha da yaxınlaşdıran platforma.","reklam_id":"6089303"},
            // Əlavə reklamlar buraya əlavə edilə bilər
            // {"image": "URL_TO_AD_IMAGE_2", "text": "Başqa Reklam Mətni", "reklam_id": "AD_ID_2"}
        ];
        let currentAdIndex = 0; // Hansı reklamın göstəriləcəyini izləmək üçün

        // Cari post filtrini izləmək üçün qlobal dəyişən
        let currentPostFilter = 'all'; // 'all', 'mine', 'saved'

        function hideLoaderIfReady() {
            // Yükləyiciyi gizlətmədən əvvəl əsas məlumatların yüklənib-yüklənmədiyini yoxla
            // İlkin göstərmə üçün postlar, bəyənmələr, istifadəçilər və izləmə məlumatları lazımdır
            if (dataLoaded.posts && dataLoaded.likes && dataLoaded.users && dataLoaded.userFollowing && dataLoaded.gifs && dataLoaded.savedPosts) {
                const loader = document.getElementById("loader");
                loader.style.opacity = 0;
                setTimeout(() => {
                    loader.style.display = "none";
                    document.getElementById("posts").style.display = "block";
                    // Yalnız bütün lazımi məlumatlar yükləndikdən sonra filter tətbiq et
                    filterPosts(currentPostFilter); 
                }, 500);
                
                // URL-də şərh parametri varsa, şərh overlayını aç
                if (urlParams.get('comment') === 'true' && urlParams.get('postId')) {
                    // Biz activeCommentPostId-ni daxili olaraq təyin etməliyik, hətta URL-də olmasa belə
                    activeCommentPostId = urlParams.get('postId');
                    openCommentOverlay(activeCommentPostId);
                }
            }
        }

        // Xəbərdarlıq mesajı göstərən funksiya
        function showAlertDialog(message) {
            const alertDialog = document.getElementById('alertDialog');
            // Check if the comment overlay is visible to decide which alertDialog to use
            if (commentOverlay.classList.contains('visible')) {
                const commentOverlayAlertDialog = document.querySelector('#comment-overlay #alertDialog');
                if (commentOverlayAlertDialog) {
                    commentOverlayAlertDialog.querySelector('#alertMessage').textContent = message;
                    commentOverlayAlertDialog.style.display = 'flex';
                }
            } else {
                document.getElementById('alertMessage').textContent = message;
                alertDialog.style.display = 'flex';
            }
        }

        document.getElementById('alertOk').onclick = () => {
            // Check if the comment overlay is visible to hide the correct alertDialog
            if (commentOverlay.classList.contains('visible')) {
                const commentOverlayAlertDialog = document.querySelector('#comment-overlay #alertDialog');
                if (commentOverlayAlertDialog) {
                    commentOverlayAlertDialog.style.display = 'none';
                }
            } else {
                document.getElementById('alertDialog').style.display = 'none';
            }
        };
        
        function getStatusBadge(nickname) {
            const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
            const isTick = tickUsers[cleanNickname] === "+";
            const isPremium = premiumUsers[cleanNickname] === "+";
            if (isTick && isPremium) {
                return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314187/premium-tick_lls2xj.png";
            } else if (isTick) {
                return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314188/tick_bpkpy1.png";
            } else if (isPremium) {
                return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314187/premium_rtcvax.png";
            }
            return null;
        }
        
        function getUserName(nickname) {
            const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
            if (allUsers[cleanNickname]) {
                try {
                    const userData = JSON.parse(allUsers[cleanNickname]);
                    return userData[1];
                } catch(e) {
                    console.error(`İstifadəçi məlumatları '${cleanNickname}' üçün parsing edilərkən xəta baş verdi`);
                }
            }
            // Cari istifadəçi üçün məlumatları hələ allUsers-də yoxdursa ehtiyat planı
            if (cleanNickname === currentUser.replace('@', '')) {
                return currentUserName;
            }
            return cleanNickname;
        }

        function getProfilePic(nickname) {
            const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
            if (allUsers[cleanNickname]) {
                try {
                    const userData = JSON.parse(allUsers[cleanNickname]);
                    return userData[2];
                } catch(e) {
                    console.error(`İstifadəçi məlumatları '${cleanNickname}' üçün parsing edilərkən xəta baş verdi`);
                }
            }
            // Cari istifadəçi üçün məlumatları hələ allUsers-də yoxdursa ehtiyat planı
            if (cleanNickname === currentUser.replace('@', '') && currentUserProfilePic) {
                return currentUserProfilePic;
            }
            return "https://res.cloudinary.com/dhski1gkx/image/upload/v1751823255/icon-7797704_640_iled3f.png";
        }

        function formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(minutes / (60 * 24)); // Düzəldilmiş gün hesablaması
            const months = Math.floor(days / 30);
            const years = Math.floor(months / 12);

            if (years > 0) return `${years} il əvvəl`;
            if (months > 0) return `${months} ay əvvəl`;
            if (days > 0) return `${days} gün əvvəl`;
            if (hours > 0) return `${hours} saat əvvəl`;
            if (minutes > 0) return `${minutes} dəq əvvəl`;
            return `${seconds} san əvvəl`;
        }

        // Reklam elementini yaradan funksiya
        function createAdElement(ad) {
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-container';
            adDiv.innerHTML = `
                 <img src="${ad.image}" alt="Reklam Şəkli" class="ad-image" onerror="this.onerror=null;this.src='';" />
                 <p class="ad-text">${ad.text}</p>
            `;
            return adDiv;
        }
        
        // Mətndəki haştagları linkə çevirən funksiya
        function formatTextWithHashtags(text) {
            const hashtagRegex = /(#\w+)/g;
            const parts = text.split(hashtagRegex);
            const fragment = document.createDocumentFragment();

            parts.forEach(part => {
                if (part.match(hashtagRegex)) {
                    const span = document.createElement('span');
                    span.className = 'hashtag';
                    span.textContent = part;
                    span.onclick = (e) => {
                        e.stopPropagation();
                        // Haştag üzərinə klikləndikdə nə olacağını burada təyin edə bilərsiniz
                        // Məsələn, haştag səhifəsinə yönləndirmə
                        console.log(`Hashtag clicked: ${part}`);
                        // window.location.href = `?hashtag=${part.substring(1)}`;
                    };
                    fragment.appendChild(span);
                } else {
                    fragment.appendChild(document.createTextNode(part));
                }
            });
            return fragment;
        }

        function renderPost(postId, data) {
            const postLikes = likeCache[postId] ? Object.keys(likeCache[postId]).length : 0;
            const isLikedByUser = likeCache[postId] && likeCache[postId][currentUser];
            const cleanCurrentUserNickname = currentUser.replace('@', '');

            // Yeni: Yer işarəsi (saved posts) məlumatı
            const postSavedCount = savedPostsCache[postId] ? Object.keys(savedPostsCache[postId]).length : 0;
            const isPostSavedByUser = savedPostsByUserCache[postId] && savedPostsByUserCache[postId][cleanCurrentUserNickname];


            const postEl = document.createElement("div");
            postEl.className = "post";
            postEl.id = "post_" + postId;

            const header = document.createElement("div");
            header.className = "post-header";

            const img = document.createElement("img");
            img.className = "profile-pic";
            img.src = getProfilePic(data.nickname);
            img.alt = data.nickname + " profil şəkli";

            const userBox = document.createElement("div");
            userBox.className = "username-box";

            const userNameDiv = document.createElement("div");
            userNameDiv.className = "userid";
            userNameDiv.textContent = 
    "@" + (getUserName(data.nickname) || data.user || "");


            const statusBadgeUrl = getStatusBadge(data.nickname);
            if (statusBadgeUrl) {
                const statusBadgeImg = document.createElement("img");
                statusBadgeImg.className = "status-badge";
                statusBadgeImg.src = statusBadgeUrl;
                statusBadgeImg.alt = "Status nişanı";
                userNameDiv.appendChild(statusBadgeImg);
            }

            const nickDiv = document.createElement("div");
            nickDiv.className = "nickname";
            const displayNickname = data.nickname.startsWith('@') ? data.nickname : `@${data.nickname}`;
            nickDiv.textContent = displayNickname;

            const userClickHandler = () => {
                 window.location.href = `?other_user=${data.nickname}`;
            };
            userNameDiv.addEventListener("click", userClickHandler);
            nickDiv.addEventListener("click", userClickHandler);
            img.addEventListener("click", userClickHandler);

            userBox.appendChild(userNameDiv);
            userBox.appendChild(nickDiv);
            header.appendChild(img);
            header.appendChild(userBox);

            // Takib etmə düyməsi
            const cleanPostOwnerNickname = data.nickname.replace('@', '');
            
            if (cleanPostOwnerNickname !== cleanCurrentUserNickname) {
                const followButton = document.createElement('button');
                followButton.className = 'follow-button';
                followButton.id = `follow-button-${cleanPostOwnerNickname}`;
                
                // Cari istifadəçinin bu post sahibini takib edib-etmədiyini yoxla
                const isFollowing = userFollowing[cleanCurrentUserNickname] && userFollowing[cleanCurrentUserNickname][`@${cleanPostOwnerNickname}`] === '"+"';
                
                if (isFollowing) {
                    followButton.classList.add('unfollow');
                    followButton.textContent = 'İzlədiyin';
                } else {
                    followButton.classList.add('follow');
                    followButton.textContent = 'Takib et';
                }

                followButton.addEventListener('click', () => toggleFollow(cleanPostOwnerNickname));
                header.appendChild(followButton);
            }

            postEl.appendChild(header);

            if (data.text) {
                const text = document.createElement("div");
                text.className = "post-text";
                text.appendChild(formatTextWithHashtags(data.text)); // Haştagları formatla
                postEl.appendChild(text);
            }

            if (data.image) {
                const image = document.createElement("img");
                image.className = "post-image";
                image.src = data.image.replace(/\\/g, '').trim();
                image.alt = "Post şəkli";
                postEl.appendChild(image);
            }

            const footer = document.createElement("div");
            footer.className = "post-footer";
            
            const postActionsLeft = document.createElement("div"); // Yeni: Sol düymə qrupunu saxlamaq üçün div
            postActionsLeft.className = "post-actions-left";

            const likeBtn = document.createElement("button");
            likeBtn.className = "like-button";
            if (isLikedByUser) likeBtn.classList.add("liked");
            likeBtn.innerHTML = `
                <span class="material-icons">${isLikedByUser ? 'favorite' : 'favorite_border'}</span>
                <span class="like-count">${postLikes}</span>
            `;
            likeBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                const likeRef = db.ref(`likes/${postId}/${currentUser}`); // Post bəyənmələri üçün 'db' istifadə et
                likeRef.once("value").then(snap => {
                    const isCurrentlyLiked = snap.exists();
                    if (isCurrentlyLiked) {
                        likeRef.remove();
                    } else {
                        likeRef.set(true);
                    }
                });
            });
            postActionsLeft.appendChild(likeBtn); // Sol qrupa əlavə et

            // Şərh Düyməsi
            const commentCount = commentsCache[postId] ? Object.keys(commentsCache[postId]).length : 0;
            const commentBtn = document.createElement("button");
            commentBtn.className = "comment-button";
            commentBtn.innerHTML = `
                <span class="material-icons">chat_bubble_outline</span>
                <span class="comment-count">${commentCount}</span>
            `;
            commentBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                openCommentOverlay(postId);
            });
            postActionsLeft.appendChild(commentBtn); // Sol qrupa əlavə et

            footer.appendChild(postActionsLeft); // Sol qrupu footere əlavə et

            // Yeni: Yer işarəsi (Bookmark) düyməsi
            const bookmarkBtn = document.createElement("button");
            bookmarkBtn.className = "bookmark-button";
            if (isPostSavedByUser) bookmarkBtn.classList.add("saved"); // İstifadəçi yadda saxlayıbsa sarı rəng et
            bookmarkBtn.innerHTML = `
                <span class="material-icons">${isPostSavedByUser ? 'bookmark' : 'bookmark_border'}</span>
                <span class="bookmark-count">${postSavedCount > 0 ? postSavedCount : ''}</span>
            `;
            bookmarkBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                toggleSavePost(postId);
            });
            footer.appendChild(bookmarkBtn); // Sağa əlavə et (margin-left: auto ilə hizalanacaq)


            if (data.nickname.replace('@', '') === currentUser.replace('@', '')) {
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-button";
                deleteBtn.innerHTML = `
                    <span class="material-icons">delete</span>
                    
                `;
                deleteBtn.addEventListener("click", () => {
                    deletePostId = postId;
                    document.getElementById("confirmDialog").style.display = "flex";
                });
                footer.appendChild(deleteBtn);
            }

            postEl.appendChild(footer);

            const likedUsersSummary = document.createElement("div");
            likedUsersSummary.className = "liked-users-summary";
            const likedUsersList = document.createElement("div");
            likedUsersList.className = "liked-users-list";

            function updateLikedUsersSummary() {
                const users = Object.keys(likeCache[postId] || {});
                if (users.length === 0) {
                    likedUsersSummary.textContent = "";
                    likedUsersList.style.display = "none";
                } else if (users.length <= 2) {
                    const summaryHtml = users.map(u => `<span onclick="window.location.href='?other_user=${u}'">${getUserName(u)}</span>`).join(", ") + " bəyəndi";
                    likedUsersSummary.innerHTML = summaryHtml;
                    likedUsersList.style.display = "none";
                } else {
                    const firstTwo = users.slice(0, 2).map(u => `<span onclick="window.location.href='?other_user=${u}'">${getUserName(u)}</span>`).join(", ");
                    likedUsersSummary.innerHTML = `${firstTwo} bəyəndi <span class="liked-users-more">... (kliklə)</span>`;
                    likedUsersList.style.display = "none";
                    likedUsersList.innerHTML = "";
                    users.slice(2).forEach(u => {
                        const div = document.createElement("div");
                        div.textContent = getUserName(u);
                        div.onclick = () => {
                            window.location.href = `?other_user=${u}`;
                        };
                        likedUsersList.appendChild(div);
                    });
                    likedUsersSummary.querySelector(".liked-users-more").onclick = (e) => {
                        e.stopPropagation();
                        likedUsersList.style.display = (likedUsersList.style.display === "none" || likedUsersList.style.display === "") ? "block" : "none";
                        likedUsersSummary.querySelector(".liked-users-more").textContent = (likedUsersList.style.display === "block") ? "(bağla)" : "... (kliklə)";
                    };
                }
            }

            updateLikedUsersSummary();
            postEl.appendChild(likedUsersSummary);
            postEl.appendChild(likedUsersList);
            
            const timeDiv = document.createElement("div");
            timeDiv.className = "post-time";
            timeDiv.textContent = data.time;
            postEl.appendChild(timeDiv);

            return postEl;
        }

        document.getElementById("confirmYes").onclick = () => {
            if (deletePostId) {
                // Post silinməsi üçün 'db' istifadə et
                db.ref("posts/" + deletePostId).remove(); 
                // Post bəyənmələrinin silinməsi üçün 'db' istifadə et
                db.ref("likes/" + deletePostId).remove(); 
                // Şərhlərin silinməsi üçün 'commentsDb' istifadə et
                commentsDb.ref("comments/" + deletePostId).remove(); 
                // Yeni: Qeyd edilmiş postların silinməsi
                savedPostsDb.ref("savedPosts/" + deletePostId).remove();
                document.getElementById("confirmDialog").style.display = "none";
                deletePostId = null;
            }
        };

        document.getElementById("confirmNo").onclick = () => {
            document.getElementById("confirmDialog").style.display = "none";
            deletePostId = null;
        };

        // Şərh silmə təsdiq dialoqu üçün funksiyalar
        document.getElementById("confirmDeleteCommentYes").onclick = () => {
            if (activeCommentPostId && deletingComment) {
                let commentRef;
                if (deletingCommentIsReply && deletingParentCommentId) {
                    commentRef = commentsDb.ref(`comments/${activeCommentPostId}/${deletingParentCommentId}/replies/${deletingComment}`);
                } else {
                    commentRef = commentsDb.ref(`comments/${activeCommentPostId}/${deletingComment}`);
                }
                
                commentRef.remove()
                    .then(() => {
                        console.log("Şərh uğurla silindi.");
                        // Əgər üst səviyyə şərh silinirsə, onun bəyənmələrini də sil
                        if (!deletingCommentIsReply) {
                            commentsDb.ref(`commentLikes/${deletingComment}`).remove();
                        }
                    })
                    .catch(error => {
                        console.error("Şərh silinərkən xəta:", error);
                        showAlertDialog("Şərh silinərkən xəta baş verdi.");
                    })
                    .finally(() => {
                        document.getElementById("confirmDeleteCommentDialog").style.display = "none";
                        // Also remove the visual 'deleting' class from the comment item
                        const commentElement = document.getElementById(`${deletingCommentIsReply ? 'reply_' : 'comment_'}${deletingComment}`);
                        if (commentElement) {
                            commentElement.classList.remove('deleting');
                        }
                        deletingComment = null;
                        deletingCommentIsReply = false;
                        deletingParentCommentId = null;
                    });
            }
        };

        document.getElementById("confirmDeleteCommentNo").onclick = () => {
            document.getElementById("confirmDeleteCommentDialog").style.display = "none";
            // Also remove the visual 'deleting' class from the comment item
            const commentElement = document.getElementById(`${deletingCommentIsReply ? 'reply_' : 'comment_'}${deletingComment}`);
            if (commentElement) {
                commentElement.classList.remove('deleting');
            }
            deletingComment = null;
            deletingCommentIsReply = false;
            deletingParentCommentId = null;
        };

        function updateLikeInfo(postId) {
            const postEl = document.getElementById("post_" + postId);
            if (!postEl) return;

            const likeBtn = postEl.querySelector(".like-button");
            const likeCountSpan = likeBtn.querySelector(".like-count");
            const likedUsersSummary = postEl.querySelector(".liked-users-summary");
            const likedUsersList = postEl.querySelector(".liked-users-list");

            const postLikes = likeCache[postId] ? Object.keys(likeCache[postId]).length : 0;
            const isLikedByUser = likeCache[postId] && likeCache[postId][currentUser];

            likeCountSpan.textContent = postLikes;
            if (isLikedByUser) {
                likeBtn.classList.add("liked");
                likeBtn.querySelector(".material-icons").textContent = "favorite";
            } else {
                likeBtn.classList.remove("liked");
                likeBtn.querySelector(".material-icons").textContent = "favorite_border";
            }
            
            const users = Object.keys(likeCache[postId] || {});
            if (users.length === 0) {
                likedUsersSummary.textContent = "";
                likedUsersList.style.display = "none";
            } else if (users.length <= 2) {
                const summaryHtml = users.map(u => `<span onclick="window.location.href='?other_user=${u}'">${getUserName(u)}</span>`).join(", ") + " bəyəndi";
                likedUsersSummary.innerHTML = summaryHtml;
                likedUsersList.style.display = "none";
            } else {
                const firstTwo = users.slice(0, 2).map(u => `<span onclick="window.location.href='?other_user=${u}'">${getUserName(u)}</span>`).join(", ");
                likedUsersSummary.innerHTML = `${firstTwo} bəyəndi <span class="liked-users-more">... (kliklə)</span>`;
                likedUsersList.style.display = "none";
                likedUsersList.innerHTML = "";
                users.slice(2).forEach(u => {
                    const div = document.createElement("div");
                    div.textContent = getUserName(u);
                    div.onclick = () => {
                        window.location.href = `?other_user=${u}`;
                    };
                    likedUsersList.appendChild(div);
                });
                likedUsersSummary.querySelector(".liked-users-more").onclick = (e) => {
                    e.stopPropagation();
                    likedUsersList.style.display = (likedUsersList.style.display === "none" || likedUsersList.style.display === "") ? "block" : "none";
                    likedUsersSummary.querySelector(".liked-users-more").textContent = (likedUsersList.style.display === "block") ? "(bağla)" : "... (kliklə)";
                };
            }
        }

        function updateCommentCount(postId) {
            const postEl = document.getElementById("post_" + postId);
            if (!postEl) return;
            const commentCountSpan = postEl.querySelector(".comment-button .comment-count");
            if (commentCountSpan) {
                const count = commentsCache[postId] ? Object.keys(commentsCache[postId]).length : 0;
                commentCountSpan.textContent = count;
            }
        }

        // Yeni: Bookmark düyməsinin sayını və statusunu yeniləmək üçün funksiya
        function updateBookmarkInfo(postId) {
            const postEl = document.getElementById("post_" + postId);
            if (!postEl) return;

            const bookmarkBtn = postEl.querySelector(".bookmark-button");
            const bookmarkCountSpan = bookmarkBtn.querySelector(".bookmark-count");
            const cleanCurrentUserNickname = currentUser.replace('@', '');

            const postSavedCount = savedPostsCache[postId] ? Object.keys(savedPostsCache[postId]).length : 0;
            const isPostSavedByUser = savedPostsByUserCache[postId] && savedPostsByUserCache[postId][cleanCurrentUserNickname];

            bookmarkCountSpan.textContent = postSavedCount > 0 ? postSavedCount : '';
            if (isPostSavedByUser) {
                bookmarkBtn.classList.add("saved");
                bookmarkBtn.querySelector(".material-icons").textContent = "bookmark";
            } else {
                bookmarkBtn.classList.remove("saved");
                bookmarkBtn.querySelector(".material-icons").textContent = "bookmark_border";
            }
        }
        
        function updateProfileInFirebase(nickname, newProfilePicUrl) {
            // Profil Firebase postlarında yenilə
            db.ref("posts").once("value", (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const postId = childSnapshot.key;
                    let postData;
                    try {
                        postData = JSON.parse(childSnapshot.val());
                    } catch (e) {
                        console.error("Məlumat JSON formatında deyil:", childSnapshot.val());
                        return;
                    }
                    if (postData.nickname.replace('@', '') === nickname.replace('@', '')) {
                        if (postData.profile !== newProfilePicUrl) {
                            postData.profile = newProfilePicUrl;
                            db.ref("posts/" + postId).set(JSON.stringify(postData)).then(() => {
                                console.log(`Post ${postId} istifadəçi ${nickname} üçün yeniləndi.`);
                            }).catch(error => {
                                console.error(`Post ${postId} üçün profil şəkli yenilənərkən xəta:`, error);
                            });
                        }
                    }
                });
            });
            // Həmçinin Firebase şərhlərində yeni profil şəkli ilə şərhləri yenilə
            commentsDb.ref("comments").once("value", (snapshot) => {
                snapshot.forEach((postCommentsSnapshot) => {
                    const postId = postCommentsSnapshot.key;
                    postCommentsSnapshot.forEach((commentSnapshot) => {
                        const commentId = commentSnapshot.key;
                        const commentData = commentSnapshot.val();
                        if (commentData.nickname.replace('@', '') === nickname.replace('@', '')) {
                            if (commentData.profilePic !== newProfilePicUrl) {
                                commentsDb.ref(`comments/${postId}/${commentId}/profilePic`).set(newProfilePicUrl).then(() => {
                                    console.log(`Şərh ${commentId} istifadəçi ${nickname} üçün yeni profil şəkli ilə yeniləndi.`);
                                }).catch(error => {
                                    console.error(`Şərh ${commentId} üçün profil şəkli yenilənərkən xəta:`, error);
                                });
                            }
                        }
                        // Cavabları yoxla
                        if (commentData.replies) {
                            for (const replyId in commentData.replies) {
                                const replyData = commentData.replies[replyId];
                                if (replyData.nickname.replace('@', '') === nickname.replace('@', '')) {
                                    if (replyData.profilePic !== newProfilePicUrl) {
                                        commentsDb.ref(`comments/${postId}/${commentId}/replies/${replyId}/profilePic`).set(newProfilePicUrl).then(() => {
                                            console.log(`Cavab ${replyId} istifadəçi ${nickname} üçün yeni profil şəkli ilə yeniləndi.`);
                                        }).catch(error => {
                                            console.error(`Cavab ${replyId} üçün profil şəkli yenilənərkən xəta:`, error);
                                        });
                                    }
                                }
                            }
                        }
                    });
                });
            });
        }
        
        if (currentUser && currentUserProfilePic) {
            updateProfileInFirebase(currentUser, currentUserProfilePic);
        }

        function renderStories() {
            const storiesContainer = document.getElementById("stories-container");
            storiesContainer.innerHTML = "";
            
            const allStoryUsers = new Set();
            const ownNickname = currentUser.replace('@', '');
            
            if (currentUser !== "@anonim") {
                allStoryUsers.add(ownNickname);
            }
            
            followingUsersStories.forEach(user => allStoryUsers.add(user.replace('@', '')));
            
            const allStoryUsernames = new Set([...Object.keys(allStories.images), ...Object.keys(allStories.videos)]);
            allStoryUsernames.forEach(username => allStoryUsers.add(username));
            
            const orderedStoryUsers = Array.from(allStoryUsers);
            const storyItems = [];
            
            orderedStoryUsers.forEach(nickname => {
                const isOwn = nickname === ownNickname;
                const storiesForUser = (allStories.images[nickname] || []).concat(allStories.videos[nickname] || []).sort((a,b) => b.timestamp - a.timestamp);
                const hasStory = storiesForUser.length > 0;
                const isRead = firebaseStoryReadStatus[nickname] === true;
                
                const storyItem = document.createElement("div");
                storyItem.className = "story-item";
                storyItem.dataset.user = nickname;
                
                const img = document.createElement("img");
                img.className = `story-profile-pic ${hasStory ? (isRead ? 'story-read' : 'has-story') : 'no-story'}`;
                img.src = getProfilePic(nickname);
                img.alt = nickname + " story";
                img.onerror = function() {
                    this.src = "https://placehold.co/60x60/333333/FFFFFF?text=📸";
                };
                
                const usernameDiv = document.createElement("div");
                usernameDiv.className = "story-username";
                usernameDiv.textContent = getUserName(nickname);
                
                storyItem.appendChild(img);
                storyItem.appendChild(usernameDiv);
                
                if (isOwn) {
                    const addButton = document.createElement("div");
                    addButton.className = "story-add-button";
                    addButton.textContent = "+";
                    addButton.onclick = (e) => {
                        e.stopPropagation();
                        window.location.href = `?user=${currentUser}&add_story=true`; 
                    };
                    storyItem.appendChild(addButton);
                }
                
                storyItem.onclick = () => {
                    if (isOwn) {
                         const hasOwnStory = storiesForUser.length > 0;
                         if (hasOwnStory) {
                             showStoryViewer(nickname);
                         } else {
                             window.location.href = `?user=${currentUser}&add_story=true`;
                         }
                    } else if (storiesForUser.length > 0) {
                        showStoryViewer(nickname);
                    } else {
                         window.location.href = `?other_user=@${nickname}`;
                    }
                };
                
                storyItems.push({ element: storyItem, hasStory: hasStory, isOwn: isOwn, isRead: isRead, lastUpdate: storiesForUser[0]?.timestamp || 0 });
            });
            
            storyItems.sort((a, b) => {
                if (a.isOwn && !b.isOwn) return -1;
                if (!a.isOwn && b.isOwn) return 1;
                if (a.hasStory && !b.hasStory) return -1;
                if (a.isRead && !b.isRead) return 1;
                if (!a.isRead && b.isRead) return -1;
                return b.lastUpdate - a.lastUpdate;
            });

            storyItems.forEach(item => storiesContainer.appendChild(item.element));
        }
        
        function showStoryViewer(nickname) {
            currentStoryUser = nickname;
            // Dəyişiklik: storiesForUser massivindəki hər bir story-nin Firebase yolunu qeyd etmək üçün
            // `isImage` və `isVideo` xüsusiyyətlərini də istifadə edirik.
            const storiesForUser = (allStories.images[nickname] || []).map(s => ({...s, type: 'posts'}))
                                    .concat((allStories.videos[nickname] || []).map(s => ({...s, type: 'snap'})))
                                    .sort((a,b) => b.timestamp - a.timestamp);

            if (storiesForUser.length === 0) {
                closeStoryViewer();
                return;
            }
            
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('story', 'true');
            currentUrl.searchParams.set('user', currentUser);
            
            const newUrl = currentUrl.origin + currentUrl.pathname + '?' + currentUrl.searchParams.toString();
            history.pushState(null, '', newUrl);

            activeStory = storiesForUser;
            activeStoryIndex = 0;
            const storyViewer = document.getElementById("story-viewer");
            storyViewer.style.display = "flex";
            storyViewer.classList.add('visible');
            document.body.style.overflow = "hidden";
            
            const storyDeleteBtn = storyViewer.querySelector('.delete-btn');
            storyDeleteBtn.onclick = () => {
                if (currentStoryUser && activeStory && activeStory[activeStoryIndex]) {
                    const story = activeStory[activeStoryIndex];
                    // Dəyişiklik: Story-nin tipini `story.type` xüsusiyyətindən alın
                    const storyTypePath = story.type; 
                    
                    console.log(`Story silinir: Path = ${storyTypePath}/${story.storyId}`); // Debugging üçün
                    gonlineDb.ref(`${storyTypePath}/${story.storyId}`).remove()
                        .then(() => {
                            console.log(`Story '${story.storyId}' silindi.`);
                            // Story silindikdən sonra əlaqədar bəyənmə və baxışları da sil
                            gonlineDb.ref(`storyViews/${story.storyId}`).remove();
                            gonlineDb.ref(`likes/${story.storyId}`).remove();
                            // Həmçinin, `storyReadStatus`-u da sıfırla, əgər öz story-sidirsə
                            const cleanCurrentUser = currentUser.replace('@', '');
                            if (currentStoryUser.replace('@', '') === cleanCurrentUser) {
                                gonlineDb.ref(`storyReadStatus/${cleanCurrentUser}/${cleanCurrentUser}`).remove();
                            }
                            // Story silindikdən sonra görüntüləyicini bağla
                            closeStoryViewer();
                            // Storyləri yenidən render et ki, silinmiş story aradan qalxsın
                            renderStories();
                        })
                        .catch(error => {
                            console.error("Story silinərkən xəta:", error); // Error handling
                            showAlertDialog("Story silinərkən xəta baş verdi.");
                        });
                }
            };

            const isOwnStory = currentUser.replace('@', '') === currentStoryUser.replace('@', '');
            storyDeleteBtn.style.display = isOwnStory ? 'block' : 'none';
            
            const profilePicEl = storyViewer.querySelector(".story-header .story-profile-pic");
            const usernameEl = storyViewer.querySelector(".story-header .username");
            const headerClickHandler = () => {
                window.location.href = `?other_user=@${nickname}`;
            };
            profilePicEl.onclick = headerClickHandler;
            usernameEl.onclick = headerClickHandler;
            
            const storyStats = storyViewer.querySelector('.story-stats');
            const likeButton = storyViewer.querySelector('.story-like-button');
            
            if (isOwnStory) {
                storyStats.style.display = 'flex';
                likeButton.style.display = 'none';
            } else {
                storyStats.style.display = 'none';
                likeButton.style.display = 'block';
            }
            
            playStory(activeStoryIndex);
        }
        
        function toggleStoryLikesList() {
            pauseStory();
            const listContainer = document.getElementById('story-likes-list-container');
            const viewsContainer = document.getElementById('story-views-list-container');
            const story = activeStory[activeStoryIndex];
            const likes = storyLikesCache[story.storyId] || {};
            
            viewsContainer.classList.remove('show');
            
            if (listContainer.classList.contains('show')) {
                listContainer.classList.remove('show');
                resumeStory(); // Siyahı bağlandıqdan sonra story-ni davam etdir
            } else {
                listContainer.innerHTML = `<h4>Bəyənənlər</h4>`;
                const users = Object.keys(likes);
                if (users.length > 0) {
                    users.forEach(user => {
                        const userDiv = document.createElement('div');
                        userDiv.className = 'liked-user-item';
                        userDiv.innerHTML = `
                            <img src="${getProfilePic(user)}" alt="${user} profil şəkli" />
                            <span>${getUserName(user)}</span>
                        `;
                        listContainer.appendChild(userDiv);
                    });
                     // Əlavə: 5-dən çox istifadəçi varsa, sürüşdürmə mesajı əlavə et
                    if (users.length > 5) {
                        listContainer.innerHTML += `<p style="text-align: center; color: #bbb; margin-top: 10px; font-size: 0.8rem;">Aşağı sürüşdürərək daha çoxunu görün.</p>`;
                    }
                } else {
                    listContainer.innerHTML += `<p style="text-align: center; color: #aaa; margin-top: 10px;">Heç kim bəyənməyib.</p>`;
                }
                listContainer.classList.add('show');
            }
        }
        
        function toggleStoryViewsList() {
            pauseStory();
            const listContainer = document.getElementById('story-views-list-container');
            const likesContainer = document.getElementById('story-likes-list-container');
            const story = activeStory[activeStoryIndex];
            const views = storyViewsCache[story.storyId] || {};
            
            likesContainer.classList.remove('show');

            if (listContainer.classList.contains('show')) {
                listContainer.classList.remove('show');
                resumeStory(); // Siyahı bağlandıqdan sonra story-ni davam etdir
            } else {
                listContainer.innerHTML = `<h4>Baxışlar</h4>`;
                const users = Object.keys(views);
                if (users.length > 0) {
                    users.forEach(user => {
                        const userDiv = document.createElement('div');
                        userDiv.className = 'viewed-user-item';
                        userDiv.innerHTML = `
                            <img src="${getProfilePic(user)}" alt="${user} profil şəkli" />
                            <span>${getUserName(user)}</span>
                        `;
                        listContainer.appendChild(userDiv);
                    });
                    // Əlavə: 5-dən çox istifadəçi varsa, sürüşdürmə mesajı əlavə et
                    if (users.length > 5) {
                        listContainer.innerHTML += `<p style="text-align: center; color: #bbb; margin-top: 10px; font-size: 0.8rem;">Aşağı sürüşdürərək daha çoxunu görün.</p>`;
                    }
                } else {
                    listContainer.innerHTML += `<p style="text-align: center; color: #aaa; margin-top: 10px;">Heç kim baxmayıb.</p>`;
                }
                listContainer.classList.add('show');
            }
        }
        
        function playStory(index) {
            clearTimeout(storyTimeout);
            clearTimeout(mediaLoadingTimeout);
            isPaused = false;
            document.getElementById("story-loading-indicator").style.display = "none";
            document.getElementById('story-likes-list-container').classList.remove('show');
            document.getElementById('story-views-list-container').classList.remove('show');
            
            const pauseBtn = document.querySelector('.pause-story-button');
            if (pauseBtn) {
                pauseBtn.textContent = 'pause_circle_filled';
            }

            if (currentStoryElement && currentStoryElement.tagName === 'VIDEO') {
                currentStoryElement.pause();
                currentStoryElement.currentTime = 0;
            }

            if (index < 0 || index >= activeStory.length) {
                if (currentStoryUser) {
                    markStoryAsRead(currentStoryUser);
                }
                closeStoryViewer();
                return;
            }
            
            const isOwnStory = currentUser.replace('@', '') === currentStoryUser.replace('@', '');
            if (!isOwnStory) {
                const storyToView = activeStory[index];
                gonlineDb.ref(`storyViews/${storyToView.storyId}/${currentUser.replace('@', '')}`).set(true);
            }

            activeStoryIndex = index;
            const story = activeStory[index];
            
            const viewer = document.getElementById("story-viewer");
            const profilePicEl = viewer.querySelector(".story-header .story-profile-pic");
            const usernameEl = viewer.querySelector(".story-header .username");
            const timeEl = viewer.querySelector(".story-header .time");
            const textEl = viewer.querySelector(".story-footer .story-text");
            const likeButton = viewer.querySelector(".story-footer .story-like-button");
            const storyStats = viewer.querySelector(".story-stats");
            const likeCountEl = viewer.querySelector(".story-stats .like-count");
            const viewCountEl = viewer.querySelector(".story-stats .view-count");

            profilePicEl.src = getProfilePic(story.nickname);
            profilePicEl.onerror = function() {
                this.src = "https://placehold.co/35x35/333333/FFFFFF?text=📸";
            };
            usernameEl.textContent = getUserName(story.nickname);
            timeEl.textContent = story.time;
            textEl.textContent = story.text || "";
            
            
            if (isOwnStory) {
                storyStats.style.display = 'flex';
                likeButton.style.display = 'none';
                const likeCount = storyLikesCache[story.storyId] ? Object.keys(storyLikesCache[story.storyId]).length : 0;
                if (likeCountEl) likeCountEl.textContent = likeCount;
                const viewCount = storyViewsCache[story.storyId] ? Object.keys(storyViewsCache[story.storyId]).length : 0;
                if (viewCountEl) viewCountEl.textContent = viewCount;
            } else {
                storyStats.style.display = 'none';
                likeButton.style.display = 'block';
                const isLiked = storyLikesCache[story.storyId] && storyLikesCache[story.storyId][currentUser.replace('@', '')];
                if (isLiked) {
                    likeButton.classList.add("liked");
                    likeButton.textContent = "favorite";
                } else {
                    likeButton.classList.remove("liked");
                    likeButton.textContent = "favorite_border";
                }
            }
            
            currentStoryElement = null;
            
            const mediaContainer = document.getElementById("story-media-container");
            mediaContainer.innerHTML = '';
            
            const progressBar = document.querySelector("#story-viewer .story-progress-bar");
            progressBar.innerHTML = '';
            for (let i = 0; i < activeStory.length; i++) {
                const segment = document.createElement('div');
                segment.className = 'story-progress-segment';
                const fill = document.createElement('div');
                fill.className = 'story-progress-fill';
                segment.appendChild(fill);
                progressBar.appendChild(segment);
            }
            const segments = progressBar.querySelectorAll('.story-progress-fill');
            segments.forEach((fill, i) => {
                if (i < activeStoryIndex) {
                    fill.style.transition = 'none';
                    fill.style.width = '100%';
                } else {
                    fill.style.transition = 'none';
                    fill.style.width = '0%';
                }
            });

            // Tap/klik jestləri üçün hadisə dinləyiciləri əlavə et
            let touchStartX = 0;
            let longPressTimer;

            mediaContainer.onmousedown = mediaContainer.ontouchstart = (e) => {
                e.preventDefault();
                touchStartX = (e.touches ? e.touches[0] : e).clientX;
                lastTouchTime = Date.now();
                longPressTimer = setTimeout(pauseStory, 300); // 300ms saxlamaq üçün fasilə
            };
            
            mediaContainer.onmouseup = mediaContainer.ontouchend = (e) => {
                clearTimeout(longPressTimer);
                const touchEndX = (e.changedTouches ? e.changedTouches[0] : e).clientX;
                const touchEndTime = Date.now();
                const screenWidth = window.innerWidth;
                
                if (touchEndTime - lastTouchTime < 300) {
                    // Tap/qısa basma
                    if (touchEndX < screenWidth / 2) {
                        prevStory();
                    } else {
                        nextStory();
                    }
                } else if (isPaused) {
                    // Əvvəllər uzun basma ilə dayandırılıbsa davam et
                    resumeStory();
                }
            };
            
            mediaContainer.onmousemove = mediaContainer.ontouchmove = (e) => {
                // Əhəmiyyətli bir hərəkət baş verərsə, uzun basmanı ləğv et
                const currentX = (e.touches ? e.touches[0] : e).clientX;
                if (Math.abs(currentX - touchStartX) > 10) {
                    clearTimeout(longPressTimer);
                }
            };

            if (story.image) {
                const img = document.createElement("img");
                img.src = story.image;
                img.onerror = function() {
                    console.error("Story şəkli yüklənərkən xəta:", this.src);
                    nextStory();
                };
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                
                mediaDuration = 5000;
                mediaContainer.appendChild(img);
                currentStoryElement = img;

                mediaLoadingTimeout = setTimeout(() => {
                    document.getElementById("story-loading-indicator").style.display = "block";
                }, 300);

                img.onload = () => {
                    clearTimeout(mediaLoadingTimeout);
                    document.getElementById("story-loading-indicator").style.display = "none";
                    startProgress(mediaDuration);
                };
            } 
            else if (story.video) {
                const video = document.createElement("video");
                video.src = story.video;
                video.autoplay = true;
                video.muted = false;
                video.setAttribute('webkit-playsinline', 'webkit-playsinline');
                video.setAttribute('playsinline', 'playsinline');
                video.controls = false;
                video.loop = false;
                
                video.style.maxWidth = '100%';
                video.style.maxHeight = '100%';
                video.objectFit = 'contain';
                
                mediaContainer.appendChild(video);
                currentStoryElement = video;

                mediaLoadingTimeout = setTimeout(() => {
                    document.getElementById("story-loading-indicator").style.display = "block";
                }, 300);
                
                video.onloadedmetadata = () => {
                    clearTimeout(mediaLoadingTimeout);
                    document.getElementById("story-loading-indicator").style.display = "none";
                    mediaDuration = video.duration * 1000;
                    startProgress(mediaDuration);
                };

                video.ontimeupdate = () => {
                     if (mediaDuration > 0 && !isPaused) {
                         const currentTime = video.currentTime * 1000;
                         const percentage = (currentTime / mediaDuration) * 100;
                         const currentSegment = document.querySelectorAll("#story-viewer .story-progress-fill")[activeStoryIndex];
                         if (currentSegment) {
                             currentSegment.style.transition = 'none';
                             currentSegment.style.width = percentage + '%';
                         }
                     }
                };

                video.onended = nextStory;
                video.onerror = function() {
                    console.error("Story videosu yüklənərkən xəta:", this.src);
                    nextStory();
                };
            }
        }
        
        function startProgress(duration) {
            isPaused = false;
            const pauseBtn = document.querySelector('.pause-story-button');
            if (pauseBtn) {
                 pauseBtn.textContent = 'pause_circle_filled';
            }
            const currentSegment = document.querySelectorAll("#story-viewer .story-progress-fill")[activeStoryIndex];
            if (currentSegment) {
                currentSegment.style.transition = 'none';
                currentSegment.style.width = '0%';
                progressStartTime = Date.now();
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        currentSegment.style.transition = `width ${duration / 1000}s linear`;
                        currentSegment.style.width = "100%";
                        storyTimeout = setTimeout(nextStory, duration);
                    });
                });
            }
            if (currentStoryElement && currentStoryElement.tagName === 'VIDEO') {
                currentStoryElement.play();
            }
        }

        function togglePauseStory() {
            if (isPaused) {
                resumeStory();
            } else {
                pauseStory();
            }
        }

        function pauseStory() {
            if (isPaused) return;
            isPaused = true;
            clearTimeout(storyTimeout);
            const pauseBtn = document.querySelector('.pause-story-button');
            if (pauseBtn) {
                pauseBtn.textContent = 'play_circle_filled';
            }
            const currentSegment = document.querySelectorAll("#story-viewer .story-progress-fill")[activeStoryIndex];
            if (currentSegment) {
                const elapsedTime = Date.now() - progressStartTime;
                const percentage = (elapsedTime / mediaDuration) * 100;
                currentSegment.style.transition = 'none';
                currentSegment.style.width = percentage + '%';
            }
            
            if (currentStoryElement && currentStoryElement.tagName === 'VIDEO') {
                currentStoryElement.pause();
            }
        }

        function resumeStory() {
            if (!isPaused) return;
            isPaused = false;
            const pauseBtn = document.querySelector('.pause-story-button');
            if (pauseBtn) {
                pauseBtn.textContent = 'pause_circle_filled';
            }
            const currentSegment = document.querySelectorAll("#story-viewer .story-progress-fill")[activeStoryIndex];
            if (currentSegment) {
                const currentWidth = parseFloat(getComputedStyle(currentSegment).width);
                const totalWidth = parseFloat(getComputedStyle(currentSegment.parentElement).width);
                const percentage = (currentWidth / totalWidth) * 100;
                
                const remainingDuration = ((100 - percentage) / 100) * mediaDuration;

                currentSegment.style.transition = `width ${remainingDuration / 1000}s linear`;
                currentSegment.style.width = "100%";
                progressStartTime = Date.now();
                storyTimeout = setTimeout(nextStory, remainingDuration);
            }
            
            if (currentStoryElement && currentStoryElement.tagName === 'VIDEO') {
                currentStoryElement.play();
            }
        }

        function nextStory() {
            if (isPaused) return;
            clearTimeout(storyTimeout);
            if (currentStoryElement && currentStoryElement.tagName === 'VIDEO') {
                currentStoryElement.pause();
            }
            if (activeStoryIndex < activeStory.length - 1) {
                playStory(activeStoryIndex + 1);
            } else {
                if (currentStoryUser) {
                    markStoryAsRead(currentStoryUser);
                }
                closeStoryViewer();
            }
        }

        function prevStory() {
            if (isPaused) return;
            clearTimeout(storyTimeout);
            if (currentStoryElement && currentStoryElement.tagName === 'VIDEO') {
                currentStoryElement.pause();
            }
            if (activeStoryIndex > 0) {
                playStory(activeStoryIndex - 1);
            } else {
                playStory(0);
            }
        }

        function closeStoryViewer() {
            clearTimeout(storyTimeout);
            clearTimeout(mediaLoadingTimeout);
            isPaused = false;
            document.getElementById("story-loading-indicator").style.display = "none";
            document.getElementById('story-likes-list-container').classList.remove('show');
            document.getElementById('story-views-list-container').classList.remove('show');
            
            const videoElement = document.querySelector("#story-viewer video");
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }

            const viewer = document.getElementById("story-viewer");
            viewer.classList.remove('visible');
            setTimeout(() => {
                viewer.style.display = "none";
                document.body.style.overflow = "auto";
            }, 300);

            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('story');

            const params = Array.from(currentUrl.searchParams.entries());
            let newSearch = '';
            if (params.length > 0) {
                newSearch = '?' + params.map(p => `${p[0]}=${p[0]}`).join('&');
            }
            
            const newUrl = currentUrl.origin + currentUrl.pathname + newSearch;

            history.pushState(null, '', newUrl);
            
            if (currentStoryUser && currentStoryUser !== currentUser.replace('@', '')) {
                markStoryAsRead(currentStoryUser);
            }

            currentStoryUser = null;
            activeStory = null;
            activeStoryIndex = 0;
            currentStoryElement = null;
        }
        
        function markStoryAsRead(nickname) {
            const cleanCurrentUser = currentUser.replace('@', '');
            const cleanNickname = nickname.replace('@', '');
            
            if (cleanCurrentUser === cleanNickname) {
                 console.log("Kendi story'sine bakis kaydedilmedi.");
                 return;
            }

            gonlineDb.ref(`storyReadStatus/${cleanCurrentUser}/${cleanNickname}`).set(true)
                .then(() => {
                    console.log(`Story '${nickname}' istifadəçisi tərəfindən '${currentUser}' tərəfindən oxunmuş olaraq qeyd edildi.`);
                })
                .catch(error => {
                    console.error("Story oxunmuş olaraq qeyd edilərkən Firebase-də xəta:", error);
                });
            
            firebaseStoryReadStatus[cleanNickname] = true;
            renderStories();
        }
        
        function toggleStoryLike(event) {
            if (event) {
                event.stopPropagation();
            }
            if (!activeStory || !activeStory[activeStoryIndex]) return;
            const story = activeStory[activeStoryIndex];
            const likeRef = gonlineDb.ref(`likes/${story.storyId}/${currentUser.replace('@', '')}`);
            likeRef.once('value').then(snap => {
                const isLiked = snap.exists();
                if (isLiked) {
                    likeRef.remove();
                } else {
                    likeRef.set(true);
                }
            });
        }
        
        gonlineDb.ref('likes').on('value', (snap) => {
            storyLikesCache = snap.val() || {};
            dataLoaded.storyLikes = true;
            if (activeStory && activeStory[activeStoryIndex]) {
                const story = activeStory[activeStoryIndex];
                const isOwnStory = currentUser.replace('@', '') === currentStoryUser.replace('@', '');
                
                if (isOwnStory) {
                    const likeCount = storyLikesCache[story.storyId] ? Object.keys(storyLikesCache[story.storyId]).length : 0;
                    const likeCountEl = document.querySelector('.story-stats .like-count');
                    if (likeCountEl) {
                        likeCountEl.textContent = likeCount;
                    }
                } else {
                     const isLiked = storyLikesCache[story.storyId] && storyLikesCache[story.storyId][currentUser.replace('@', '')];
                     const likeButton = document.querySelector(".story-like-button");
                     if (likeButton) {
                         if (isLiked) {
                              likeButton.classList.add("liked");
                              likeButton.textContent = "favorite";
                         } else {
                              likeButton.classList.remove("liked");
                              likeButton.textContent = "favorite_border";
                         }
                     }
                }
            }
            hideLoaderIfReady();
        });
        
        gonlineDb.ref('storyViews').on('value', (snap) => {
            storyViewsCache = snap.val() || {};
            dataLoaded.storyViews = true;
            if (activeStory && activeStory[activeStoryIndex]) {
                const story = activeStory[activeStoryIndex];
                const isOwnStory = currentUser.replace('@', '') === currentStoryUser.replace('@', '');
                
                if (isOwnStory) {
                    const viewCount = storyViewsCache[story.storyId] ? Object.keys(storyViewsCache[story.storyId]).length : 0;
                    const viewCountEl = document.querySelector('.story-stats .view-count');
                    if (viewCountEl) {
                        viewCountEl.textContent = viewCount;
                    }
                }
            }
            hideLoaderIfReady();
        });

        gonlineDb.ref('storyReadStatus/' + currentUser.replace('@', '')).on('value', (snapshot) => {
            firebaseStoryReadStatus = snapshot.val() || {};
            dataLoaded.storyReadStatusFromFirebase = true;
            renderStories();
            hideLoaderIfReady();
        });

        userDb.ref("Users").on("value", (snapshot) => {
            allUsers = snapshot.val() || {};
            dataLoaded.users = true;
            renderStories();
            // İstifadəçi məlumatları (adlar/şəkillər üçün) dəyişdikdə postları yenidən filtr et
            filterPosts(currentPostFilter); 
            hideLoaderIfReady();
        });
        
        // Storylər üçün izlənilən istifadəçilər (followingDb istifadə edərək)
        followingDb.ref(currentUser.replace('@', '')).on("value", (snapshot) => {
            const data = snapshot.val() || {};
            const keys = Object.keys(data).filter(key => data[key] === "+" || data[key] === '"+"');
            followingUsersStories = keys.map(key => key.startsWith('@') ? key : `@${key}`); // Ad dəyişdirildi
            dataLoaded.following = true;
            renderStories();
            hideLoaderIfReady();
        });
        
        gonlineDb.ref("posts").on("value", (snapshot) => {
            const stories = {};
            snapshot.forEach(child => {
                try {
                    const post = JSON.parse(child.val());
                    const postTime = new Date(post.time.replace(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/, '$2/$1/$3 $4:$5')).getTime();
                    const nickname = post.nickname.startsWith('@') ? post.nickname.substring(1) : post.nickname;
                    if (!stories[nickname]) stories[nickname] = [];
                    stories[nickname].push({...post, storyId: child.key, timestamp: postTime, isImage: true}); // isImage xüsiyyəti əlavə edildi
                } catch(e) {
                    console.error("Story (postlar) məlumatı oxunarkən xəta:", e);
                }
            });
            allStories.images = stories;
            dataLoaded.stories = true;
            renderStories();
            hideLoaderIfReady();
        });
        
        gonlineDb.ref("snap").on("value", (snapshot) => {
            const stories = {};
            snapshot.forEach(child => {
                try {
                    const post = JSON.parse(child.val());
                    const postTime = new Date(post.time.replace(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/, '$2/$1/$3 $4:$5')).getTime();
                    const nickname = post.nickname.startsWith('@') ? post.nickname.substring(1) : post.nickname;
                    if (!stories[nickname]) stories[nickname] = [];
                    stories[nickname].push({...post, storyId: child.key, timestamp: postTime, isVideo: true}); // isVideo xüsiyyəti əlavə edildi
                } catch(e) {
                    console.error("Story (snap) məlumatı oxunarkən xəta:", e);
                }
            });
            allStories.videos = stories;
            dataLoaded.stories = true;
            renderStories();
            hideLoaderIfReady();
        });

        gonlineDb.ref("posts").on("child_added", (snap) => {
            if (initialLoadDone) {
                try {
                    const postData = JSON.parse(snap.val());
                    const nickname = postData.nickname.startsWith('@') ? postData.nickname.substring(1) : postData.nickname;
                    const cleanCurrentUser = currentUser.replace('@', '');

                    if (nickname === cleanCurrentUser) {
                        gonlineDb.ref(`storyReadStatus/${cleanCurrentUser}/${cleanCurrentUser}`).remove()
                            .then(() => {
                                console.log(`Öz story oxuma statusu '${cleanCurrentUser}' üçün sıfırlandı.`);
                            })
                            .catch(error => {
                                console.error("Öz story oxuma statusu sıfırlanarkən xəta:", error);
                            });
                    }
                } catch (e) {
                    console.error("Postlardan yeni story məlumatı parsing edilərkən xəta (child_added):", e);
                }
            }
        });

        gonlineDb.ref("snap").on("child_added", (snap) => {
            if (initialLoadDone) {
                try {
                    const postData = JSON.parse(snap.val());
                    const nickname = postData.nickname.startsWith('@') ? postData.nickname.substring(1) : postData.nickname;
                    const cleanCurrentUser = currentUser.replace('@', '');

                    if (nickname === cleanCurrentUser) {
                        gonlineDb.ref(`storyReadStatus/${cleanCurrentUser}/${cleanCurrentUser}`).remove()
                            .then(() => {
                                console.log(`Öz story oxuma statusu '${cleanCurrentUser}' üçün sıfırlandı.`);
                            })
                            .catch(error => {
                                console.error("Öz story oxuma statusu sıfırlanarkən xəta:", error);
                            });
                    }
                } catch (e) {
                    console.error("Snapdan yeni story məlumatı parsing edilərkən xəta (child_added):", e);
                }
            }
        });

        // Child removed listener for stories (posts branch)
        gonlineDb.ref("posts").on("child_removed", (snap) => {
            if (initialLoadDone) {
                const storyId = snap.key;
                // Remove the story from allStories.images cache
                for (const nickname in allStories.images) {
                    allStories.images[nickname] = allStories.images[nickname].filter(story => story.storyId !== storyId);
                    if (allStories.images[nickname].length === 0) {
                        delete allStories.images[nickname];
                    }
                }
                renderStories(); // Re-render stories to reflect the deletion
            }
        });

        // Child removed listener for stories (snap branch)
        gonlineDb.ref("snap").on("child_removed", (snap) => {
            if (initialLoadDone) {
                const storyId = snap.key;
                // Remove the story from allStories.videos cache
                for (const nickname in allStories.videos) {
                    allStories.videos[nickname] = allStories.videos[nickname].filter(story => story.storyId !== storyId);
                    if (allStories.videos[nickname].length === 0) {
                        delete allStories.videos[nickname];
                    }
                }
                renderStories(); // Re-render stories to reflect the deletion
            }
        });


        db.ref("likes").on("value", (likesSnap) => { // Post bəyənmələri üçün 'db' istifadə et
            likeCache = likesSnap.val() || {};
            dataLoaded.likes = true;
            // Bəyənmə saylarını yeniləmək üçün postları yenidən filtr et
            filterPosts(currentPostFilter);
            hideLoaderIfReady();
        });

        // Şərhlər üçün dinləyici (commentsDb istifadə edərək)
        commentsDb.ref("comments").on("value", (snapshot) => {
            commentsCache = snapshot.val() || {};
            dataLoaded.comments = true;
            // Postlardakı şərh saylarını yenilə
            // Şərhlər post sıralamasına təsir etməməlidir
            // Şərh overlayı bir post üçün açıqdırsa, onun şərhlərini yenidən render et
            if (activeCommentPostId) {
                renderComments(activeCommentPostId);
            }
            hideLoaderIfReady();
        });

        // Şərh bəyənmələri üçün dinləyici (commentsDb istifadə edərək)
        commentsDb.ref("commentLikes").on("value", (snapshot) => {
            commentLikesCache = snapshot.val() || {};
            dataLoaded.commentLikes = true;
            if (activeCommentPostId) {
                renderComments(activeCommentPostId);
            }
            hideLoaderIfReady();
        });

        // GIF-lər üçün dinləyici
        gifDb.ref("gif").on("value", (snapshot) => {
            allGifs = snapshot.val() || {};
            dataLoaded.gifs = true;
            // renderGifList(); // GIF-ləri yüklədikdən sonra siyahını render et
            hideLoaderIfReady();
        });

        tickDb.ref("tick").on("value", (snapshot) => {
            tickUsers = snapshot.val() || {};
            dataLoaded.tick = true;
            // Tick statusunu yeniləmək üçün postları yenidən filtr et
            filterPosts(currentPostFilter);
            hideLoaderIfReady();
        });

        premiumDb.ref("premium").on("value", (snapshot) => {
            premiumUsers = snapshot.val() || {};
            dataLoaded.premium = true;
            // Premium statusunu yeniləmək üçün postları yenidən filtr et
            filterPosts(currentPostFilter);
            hideLoaderIfReady();
        });

        // FOLLOWS DATABAZASINA QULAQ ASIR (Kim məni takib edir)
        followsDb.ref().on("value", (snapshot) => {
            userFollows = snapshot.val() || {};
            dataLoaded.userFollows = true;
            // Takip statusları dəyişdikdə postları yenidən render etmək üçün
            // İzləmə statusu dəyişdikdə postları yenidən filtr et
            filterPosts(currentPostFilter);
            hideLoaderIfReady();
        });

        // FOLLOWING DATABAZASINA QULAQ ASIR (Mən kimləri takib edirəm)
        followingDb.ref().on("value", (snapshot) => {
            userFollowing = snapshot.val() || {};
            dataLoaded.userFollowing = true;
            // Takip statusları dəyişdikdə postları yenidən render etmək üçün
            // İzləmə statusu dəyişdikdə postları yenidən filtr et
            filterPosts(currentPostFilter);
            hideLoaderIfReady();
        });
        
        // Yeni: Yadda saxlanılan postlar üçün dinləyici
        savedPostsDb.ref("savedPosts").on("value", (snapshot) => {
            savedPostsCache = snapshot.val() || {};
            dataLoaded.savedPosts = true;
            // Cari istifadəçinin hansı postları yadda saxladığını yeniləyin
            const cleanCurrentUserNickname = currentUser.replace('@', '');
            savedPostsByUserCache = {};
            for (const postId in savedPostsCache) {
                if (savedPostsCache[postId] && savedPostsCache[postId][cleanCurrentUserNickname]) {
                    if (!savedPostsByUserCache[postId]) {
                        savedPostsByUserCache[postId] = {};
                    }
                    savedPostsByUserCache[postId][cleanCurrentUserNickname] = true;
                }
            }
            filterPosts(currentPostFilter); // Postları yenidən render etmək üçün
            hideLoaderIfReady();
        });


        // Postların ilkin yüklənməsi
        db.ref("posts").once("value").then(snapshot => { // Postların ilkin yüklənməsi üçün 'db' istifadə et
            const allPosts = snapshot.val() || {};
            for (const postId in allPosts) {
                try {
                    const postData = JSON.parse(allPosts[postId]);
                    postCache[postId] = { id: postId, data: postData }; // Orijinal formatı saxla
                } catch (e) {
                    console.error("İlk post məlumatı oxunarkən xəta:", e);
                }
            }
            dataLoaded.posts = true;
            initialLoadDone = true;
            hideLoaderIfReady();

            db.ref("posts").on("child_added", (snap) => { // Postlarda child_added üçün 'db' istifadə et
                if (initialLoadDone) {
                    const postId = snap.key;
                    if (!postCache[postId]) {
                        try {
                            const postData = JSON.parse(snap.val());
                            postCache[postId] = { id: postId, data: postData }; // Orijinal formatı saxla
                            // Yeni post əlavə edildikdə postları yenidən filtr et
                            filterPosts(currentPostFilter, true); // Yeni postlar üçün random sırala
                        } catch (e) {
                            console.error("Yeni post əlavə edilərkən xəta:", postId, e);
                        }
                    }
                }
            });

            db.ref("posts").on("child_changed", (snap) => { // Postlarda child_changed üçün 'db' istifadə et
                const postId = snap.key;
                try {
                    const postData = JSON.parse(snap.val());
                    postCache[postId] = { id: postId, data: postData }; // Orijinal formatı saxla
                    // Post dəyişdirildikdə postları yenidən filtr et
                    // Değişiklikler yorum sayısını etkileyecek, ancak post sırasını etkilememeli.
                    // Bu yüzden `shouldRandomize = false` olarak geçiyoruz.
                    filterPosts(currentPostFilter, false); 
                } catch (e) {
                    console.error("Post dəyişdirilərkən xəta:", postId, e);
                }
            });

            db.ref("posts").on("child_removed", (snap) => { // Postlarda child_removed üçün 'db' istifadə et
                const postId = snap.key;
                delete postCache[postId];
                // Post silindikdə postları yenidən filtr et
                filterPosts(currentPostFilter);
            });

        }).catch(error => {
            console.error("İlk post məlumatları yüklənərkən xəta:", error);
            dataLoaded.posts = true;
            initialLoadDone = true;
            hideLoaderIfReady();
        });

        // Postları filtrləmək və göstərmək üçün funksiya
        function filterPosts(filterType, shouldRandomize = false) {
            currentPostFilter = filterType; // Qlobal filter statusunu yenilə

            const allFilterButtons = document.querySelectorAll('#post-navigation-bar button');
            allFilterButtons.forEach(button => button.classList.remove('active'));

            if (filterType === 'mine') {
                document.getElementById('my-posts-button').classList.add('active');
            } else if (filterType === 'all') {
                document.getElementById('all-posts-button').classList.add('active');
            } else if (filterType === 'saved') { // Yeni: Qeydlərim düyməsi
                document.getElementById('saved-posts-button').classList.add('active');
            }
            
            let filteredPostsArray = [];

            const cleanCurrentUserNickname = currentUser.replace('@', '');
            const myFollowing = userFollowing[cleanCurrentUserNickname] || {};

            for (const postId in postCache) {
                const post = postCache[postId];
                const cleanPostOwnerNickname = post.data.nickname.replace('@', '');

                let shouldAdd = false;
                if (filterType === 'all') {
                    shouldAdd = true;
                } else if (filterType === 'mine') {
                    shouldAdd = (cleanPostOwnerNickname === cleanCurrentUserNickname);
                } else if (filterType === 'saved') { // Yeni: Yadda saxlanılan postları göstər
                    shouldAdd = savedPostsByUserCache[postId] && savedPostsByUserCache[postId][cleanCurrentUserNickname];
                }

                if (shouldAdd) {
                    filteredPostsArray.push(post);
                }
            }

            // --- Dəyişiklik burada başlayır: Postları təsadüfi sırala ---
            // Şərhlər əlavə edildikdə post sıralamasını dəyişməmək üçün əlavə məntiq
            if (shouldRandomize || postOrder.length === 0 || filterType !== currentPostFilter) {
                 // Yalnız ilkin yükləmədə və ya yeni bir post əlavə edildikdə random sırala
                 // və ya filter növü dəyişdikdə
                for (let i = filteredPostsArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [filteredPostsArray[i], filteredPostsArray[j]] = [filteredPostsArray[j], filteredPostsArray[i]];
                }
                postOrder = filteredPostsArray.map(post => post.id); // Yeni sıralamanı saxla
            } else {
                // Əks halda, əvvəlki sıralamanı qoruyun, lakin silinmiş postları təmizləyin
                const newFilteredPosts = [];
                const currentPostIds = new Set(filteredPostsArray.map(p => p.id));
                postOrder = postOrder.filter(id => currentPostIds.has(id));

                postOrder.forEach(id => {
                    const post = filteredPostsArray.find(p => p.id === id);
                    if (post) {
                        newFilteredPosts.push(post);
                    }
                });
                // Yeni əlavə olunmuş postları mövcud sıralamanın sonuna əlavə et
                filteredPostsArray.forEach(post => {
                    if (!postOrder.includes(post.id)) {
                        newFilteredPosts.push(post);
                    }
                }
                );
                filteredPostsArray = newFilteredPosts;
                postOrder = filteredPostsArray.map(post => post.id); // Yenilənmiş sıralamanı saxla
            }
            // --- Dəyişiklik burada bitir ---
            
            postsContainer.innerHTML = ''; // Cari postları təmizlə

            if (filterType === 'saved' && filteredPostsArray.length === 0) {
                postsContainer.style.display = 'none'; // Post konteynerini gizlət
                noSavedPostsMessage.style.display = 'block'; // Mesajı göstər
            } else {
                postsContainer.style.display = 'block'; // Post konteynerini göstər
                noSavedPostsMessage.style.display = 'none'; // Mesajı gizlət
                let postCount = 0; // Reklamları saymaq üçün əlavə sayğac

                filteredPostsArray.forEach(post => {
                    postsContainer.appendChild(renderPost(post.id, post.data));
                    postCount++;

                    // Hər 7 postdan bir reklam göstər
                    if (ads.length > 0 && postCount % 7 === 0) {
                        const currentAd = ads[currentAdIndex];
                        postsContainer.appendChild(createAdElement(currentAd));
                        currentAdIndex = (currentAdIndex + 1) % ads.length; // Növbəti reklama keç
                    }
                });
            }
        }

        // Yeni naviqasiya düymələrinə hadisə dinləyiciləri əlavə et
        document.getElementById('my-posts-button').addEventListener('click', () => filterPosts('mine', true)); // Hər dəfə kliklənəndə random sırala
        document.getElementById('all-posts-button').addEventListener('click', () => filterPosts('all', true)); // Hər dəfə kliklənəndə random sırala
        document.getElementById('saved-posts-button').addEventListener('click', () => filterPosts('saved', true)); // Yeni: Qeydlərim düyməsi üçün hadisə dinləyicisi


        // Şərh funksionalı
        const commentOverlay = document.getElementById('comment-overlay');
        const commentsList = document.getElementById('comments-list');
        const commentInput = document.getElementById('comment-input');
        const sendCommentButton = document.getElementById('send-comment-button');
        const gifButton = document.getElementById('gif-button');
        const gifListContainer = document.getElementById('gif-list-container');
        const gifCarousel = document.getElementById('gif-carousel');

        function openCommentOverlay(postId) {
            activeCommentPostId = postId; // Post ID-sinin daxili izlənməsi
            
            // URL-i yalnız &comment=true əlavə etmək üçün yenilə
            const currentUrl = new URL(window.location.href);
            const newSearchParams = new URLSearchParams(currentUrl.search);
            newSearchParams.set('comment', 'true');
            newSearchParams.delete('postId'); // Əvvəllər orada idisə, postId-nin silindiyinə əmin ol

            const newUrl = currentUrl.origin + currentUrl.pathname + '?' + newSearchParams.toString();
            history.pushState(null, '', newUrl);

            commentOverlay.style.display = 'flex';
            // Animasiyanı işə sal
            requestAnimationFrame(() => {
                commentOverlay.classList.add('visible');
                document.body.style.overflow = 'hidden'; // Overlay açıq olduqda body-nin scroll-unu dayandır
            });
            
            commentInput.value = ''; // Giriş sahəsini təmizlə
            replyingToCommentId = null; // Cavab statusunu sıfırla
            replyingToCommentAuthor = null;
            commentInput.placeholder = 'Şərh yazın...'; // Placeholder-i sıfırla
            sendCommentButton.disabled = true; // Göndər düyməsini əvvəlcədən deaktiv et
            gifListContainer.style.display = 'none'; // GIF siyahısını gizlət

            // Daxili olaraq izlənilən activeCommentPostId istifadə edərək şərhləri render et
            renderComments(activeCommentPostId);
        }

        function closeCommentOverlay() {
            commentOverlay.classList.remove('visible');
            
            // URL-dən 'comment' və 'postId' sil
            const currentUrl = new URL(window.location.href);
            const newSearchParams = new URLSearchParams(currentUrl.search);
            newSearchParams.delete('comment');
            newSearchParams.delete('postId'); // Həmçinin hər hansı köhnə URL-də varsa, postId-nin silindiyinə əmin ol

            const newUrl = currentUrl.origin + currentUrl.pathname + '?' + newSearchParams.toString();
            history.pushState(null, '', newUrl);

            setTimeout(() => {
                commentOverlay.style.display = 'none';
                document.body.style.overflow = 'auto'; // Body-nin scroll-unu yenidən aktiv et
                activeCommentPostId = null; // Daxili postId izlənməsini sıfırla
                replyingToCommentId = null;
                replyingToCommentAuthor = null;
                commentInput.value = '';
                commentInput.placeholder = 'Şərh yazın...';
                sendCommentButton.disabled = true;
                gifListContainer.style.display = 'none'; // GIF siyahısını bağla
            }, 300);
        }

        function renderComments(postId) {
            commentsList.innerHTML = '';
            if (!postId) {
                // Aktiv postId yoxdursa, şərhlər siyahısını təmizlə və geri dön
                console.warn("Şərhləri göstərmək üçün aktiv post ID yoxdur.");
                return;
            }
            const commentsForPost = commentsCache[postId] || {};
            
            // Şərhləri zaman damğasına görə sırala
            const sortedCommentIds = Object.keys(commentsForPost).sort((a, b) => {
                return commentsForPost[a].timestamp - commentsForPost[b].timestamp;
            });

            sortedCommentIds.forEach(commentId => {
                const commentData = commentsForPost[commentId];
                commentsList.appendChild(createCommentElement(postId, commentId, commentData));
            });
            commentsList.scrollTop = commentsList.scrollHeight; // Ən aşağıya sürüşdür
        }

        function createCommentElement(postId, commentId, commentData, isReply = false, parentCommentId = null) {
            const wrapperElement = document.createElement('div');
            wrapperElement.className = isReply ? 'reply-item' : 'comment-item';
            wrapperElement.id = `${isReply ? 'reply_' : 'comment_'}${commentId}`;
            // Mənim şərhimdirsə uzun basma üçün event əlavə et
            const cleanNickname = commentData.nickname.replace('@', '');
            const cleanCurrentUserNickname = currentUser.replace('@', '');

            if (cleanNickname === cleanCurrentUserNickname) {
                let pressTimer;

                const startPress = (e) => {
                    // e.stopPropagation(); // Moved to be conditionally applied if needed, but not here
                    pressTimer = setTimeout(() => {
                        deletingComment = commentId;
                        deletingCommentIsReply = isReply;
                        deletingParentCommentId = parentCommentId;
                        document.getElementById("confirmDeleteCommentDialog").style.display = "flex";
                        wrapperElement.classList.add('deleting'); // Add visual feedback immediately
                    }, 500); // 0.5 saniyə basılı saxlama
                };

                const cancelPress = () => {
                    clearTimeout(pressTimer);
                    // The 'deleting' class is removed in the finally block of the confirmDeleteCommentYes handler
                    // to ensure it stays during the dialog.
                    // wrapperElement.classList.remove('deleting'); 
                };

                wrapperElement.addEventListener('touchstart', startPress);
                wrapperElement.addEventListener('touchend', cancelPress);
                wrapperElement.addEventListener('touchmove', cancelPress);
                
                wrapperElement.addEventListener('mousedown', startPress);
                wrapperElement.addEventListener('mouseup', cancelPress);
                wrapperElement.addEventListener('mouseleave', cancelPress);
            }

            const profilePic = document.createElement('img');
            profilePic.className = 'profile-pic';
            profilePic.src = getProfilePic(commentData.nickname);
            profilePic.alt = commentData.nickname + ' profil şəkli';
            profilePic.onclick = () => window.location.href = `?other_user=${commentData.nickname}`;

            const contentContainer = document.createElement('div');
            contentContainer.className = isReply ? 'reply-content' : 'comment-content';

            const authorTime = document.createElement('div');
            authorTime.className = isReply ? 'reply-author-time' : 'comment-author-time';

            const author = document.createElement('span');
            author.className = isReply ? 'reply-author' : 'comment-author';
            author.textContent = getUserName(commentData.nickname);
            author.onclick = () => window.location.href = `?other_user=${commentData.nickname}`;

            const time = document.createElement('span');
            time.className = isReply ? 'reply-time' : 'comment-time';
            time.textContent = formatTimestamp(commentData.timestamp);

            authorTime.appendChild(author);
            authorTime.appendChild(time);

            const text = document.createElement('div');
            text.className = isReply ? 'reply-text' : 'comment-text';
            
            // Cavabdırsa və replyToNickname varsa, mətni formatla
            if (commentData.replyToNickname) {
                const replySpan = document.createElement('span');
                replySpan.style.color = '#4a90e2';
                replySpan.style.fontWeight = 'bold';
                replySpan.style.marginRight = '5px';
                replySpan.textContent = `@${getUserName(commentData.replyToNickname)}`;
                replySpan.onclick = (e) => {
                    e.stopPropagation();
                    window.location.href = `?other_user=${commentData.replyToNickname}`;
                };
                text.appendChild(replySpan);
            }

            // Mətn və ya GIF-i əlavə et
            if (commentData.isGif) {
                const gifImg = document.createElement('img');
                gifImg.src = commentData.text; // GIF URL-i burada saxlanılır
                gifImg.alt = "GIF";
                gifImg.style.maxWidth = '100%';
                gifImg.style.maxHeight = '150px';
                gifImg.style.borderRadius = '8px';
                gifImg.style.objectFit = 'contain';
                text.appendChild(gifImg);
            } else {
                text.appendChild(formatTextWithHashtags(commentData.text)); // Haştagları formatla
            }


            const actions = document.createElement('div');
            actions.className = 'comment-actions';

            // Şərhlər üçün bəyənmə düyməsi - YALNIZ üst səviyyə şərhlər üçün göstər (cavablar üçün yox)
            if (!isReply) {
                const likeCommentButton = document.createElement('span');
                likeCommentButton.className = 'like-comment-button';
                const commentLikes = commentLikesCache[commentId] ? Object.keys(commentLikesCache[commentId]).length : 0;
                const isLikedCommentByUser = commentLikesCache[commentId] && commentLikesCache[commentId][currentUser];
                if (isLikedCommentByUser) likeCommentButton.classList.add('liked');
                likeCommentButton.innerHTML = `
                    <span class="material-icons">${isLikedCommentByUser ? 'favorite' : 'favorite_border'}</span>
                    <span>${commentLikes > 0 ? commentLikes : ''}</span>
                `;
                likeCommentButton.onclick = (e) => {
                    e.stopPropagation();
                    toggleCommentLike(commentId);
                };
                actions.appendChild(likeCommentButton);
            }

            // Cavab düyməsi
            if (!isReply) { // Yalnız üst səviyyə şərhlər üçün cavab düyməsini göstər
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

            // Cavablar bölməsi (yalnız üst səviyyə şərhlər üçün)
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
                    replySection.style.display = 'none'; // Varsayılan olaraq gizli
                    
                    sortedReplyIds.forEach(replyId => {
                        const replyData = replies[replyId];
                        // Cavab elementləri yaradarkən isReply = true keçir
                        replySection.appendChild(createCommentElement(postId, replyId, replyData, true, commentId));
                    });
                    contentContainer.appendChild(replySection);
                }
            }

            return wrapperElement;
        }

        function initiateReply(commentId, authorNickname) {
            replyingToCommentId = commentId;
            replyingToCommentAuthor = authorNickname;
            commentInput.placeholder = `@${getUserName(authorNickname)}'a cavab yazın...`;
            commentInput.focus();
            gifListContainer.style.display = 'none'; // GIF siyahısını gizlət
        }

        commentInput.addEventListener('input', () => {
            sendCommentButton.disabled = commentInput.value.trim() === '';
        });

        sendCommentButton.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText === '' || !activeCommentPostId) return;

            const newComment = {
                nickname: currentUser,
                text: commentText,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                profilePic: getProfilePic(currentUser.replace('@', ''))
            };

            if (replyingToCommentId && replyingToCommentAuthor) {
                // Bu bir cavabdır
                newComment.replyToNickname = replyingToCommentAuthor;
                commentsDb.ref(`comments/${activeCommentPostId}/${replyingToCommentId}/replies`).push(newComment); // Cavablar üçün 'commentsDb' istifadə et
            } else {
                // Bu yeni üst səviyyə şərhidir
                commentsDb.ref(`comments/${activeCommentPostId}`).push(newComment); // Yeni şərhlər üçün 'commentsDb' istifadə et
            }

            commentInput.value = '';
            sendCommentButton.disabled = true;
            replyingToCommentId = null;
            replyingToCommentAuthor = null;
            commentInput.placeholder = 'Şərh yazın...';
            gifListContainer.style.display = 'none'; // Göndərdikdən sonra GIF siyahısını bağla
        });

        function toggleCommentLike(commentId) {
            const likeRef = commentsDb.ref(`commentLikes/${commentId}/${currentUser}`); // Şərh bəyənmələri üçün 'commentsDb' istifadə et
            likeRef.once('value').then(snap => {
                const isCurrentlyLiked = snap.exists();
                if (isCurrentlyLiked) {
                    likeRef.remove();
                } else {
                    likeRef.set(true);
                }
            });
        }
        
        // Şərh overlayını açmaq/bağlamaq üçün URL dəyişikliklərini idarə et
        window.addEventListener('popstate', () => {
            const currentUrlParams = new URLSearchParams(window.location.search);
            const isCommentOpenInUrl = currentUrlParams.get('comment') === 'true';
            // postIdInUrl artıq açılış üçün istifadə edilmir, sizin tələbinizə uyğun olaraq
            // const postIdInUrl = currentUrlParams.get('postId'); 

            if (isCommentOpenInUrl && !commentOverlay.classList.contains('visible')) {
                // Şərh parametri varsa, açmağa çalışın.
                // activeCommentPostId postun şərh düyməsinə basmaqla nə təyin edilibsə, o qalacaq.
                // Əgər istifadəçi yalnız `?comment=true` olan bir URL-ə keçərsə və əvvəlki postId təyin edilməyibsə, 
                // renderComments activeCommentPostId-ni yoxladığı üçün şərhlər siyahısı boş olacaq.
                openCommentOverlay(activeCommentPostId); 
            } else if (!isCommentOpenInUrl && commentOverlay.classList.contains('visible')) {
                closeCommentOverlay();
            }
        });

        // Yeni Takib etmə funksiyaları
        async function toggleFollow(targetNickname) {
            const cleanCurrentUserNickname = currentUser.replace('@', '');
            const cleanTargetNickname = targetNickname.replace('@', '');

            // Mən bu istifadəçini takib edirəm? (Following database)
            const myFollowingRef = followingDb.ref(`${cleanCurrentUserNickname}/@${cleanTargetNickname}`);
            const myFollowingSnap = await myFollowingRef.once('value');
            const isFollowing = myFollowingSnap.exists() && myFollowingSnap.val() === '"+"';

            // Bu istifadəçini takib edən mənəm? (Follows database)
            const targetFollowsRef = followsDb.ref(`${cleanTargetNickname}/@${cleanCurrentUserNickname}`);
            const targetFollowsSnap = await targetFollowsRef.once('value');
            const isFollowedByMe = targetFollowsSnap.exists() && targetFollowsSnap.val() === '"+"';

            // Following sayğacı
            const myFollowingCountRef = followingDb.ref(`${cleanCurrentUserNickname}/following`);
            // Follow sayğacı
            const targetFollowCountRef = followsDb.ref(`${cleanTargetNickname}/follow`);

            if (isFollowing || isFollowedByMe) {
                // Takibdən çıx
                await myFollowingRef.remove();
                await targetFollowsRef.remove();

                // Sayğacları azalt
                myFollowingCountRef.transaction((currentCount) => {
                    // currentCount undefined veya null ise 0 olarak kabul et
                    const count = typeof currentCount === 'number' ? currentCount : 0;
                    return count - 1;
                });
                // Düzəldilmişdir: unfollow edildikdə targetFollowCountRef də azalmalıdır
                targetFollowCountRef.transaction((currentCount) => { 
                    // currentCount undefined veya null ise 0 olarak kabul et
                    const count = typeof currentCount === 'number' ? currentCount : 0;
                    return count - 1;
                });
            } else {
                // Takib et
                await myFollowingRef.set('"+"');
                await targetFollowsRef.set('"+"');

                // Sayğacları artır
                myFollowingCountRef.transaction((currentCount) => {
                    // currentCount undefined veya null ise 0 olarak kabul et
                    const count = typeof currentCount === 'number' ? currentCount : 0;
                    return count + 1;
                });
                targetFollowCountRef.transaction((currentCount) => {
                    // currentCount undefined veya null ise 0 olarak kabul et
                    const count = typeof currentCount === 'number' ? currentCount : 0;
                    return count + 1;
                });
            }
        }

        // GIF funksiyaları
        function toggleGifList() {
            if (gifListContainer.style.display === 'flex') {
                gifListContainer.style.display = 'none';
                // RE-ENABLE INPUT
                commentInput.disabled = false; 
                sendCommentButton.disabled = commentInput.value.trim() === '';
            } else {
                gifListContainer.style.display = 'flex';
                // DISABLE INPUT
                commentInput.disabled = true;
                sendCommentButton.disabled = true;
                renderGifList(); // Siyahını hər açıldığında yenidən render et
            }
        }

        function renderGifList() {
            gifCarousel.innerHTML = ''; // Köhnə GIF-ləri təmizlə
            const gifKeys = Object.keys(allGifs);
            if (gifKeys.length === 0) {
                gifCarousel.innerHTML = '<p style="text-align: center; color: #aaa; padding: 10px;">GIF yoxdur.</p>';
                return;
            }

            gifKeys.forEach(gifId => {
                const gifUrl = allGifs[gifId];
                const gifItem = document.createElement('div');
                gifItem.className = 'gif-item';
                // Düzəliş: GIF URL-dəki əks-slashları təmizləyin
                const cleanedGifUrl = gifUrl.replace(/\\/g, ''); 
                gifItem.innerHTML = `<img src="${cleanedGifUrl}" alt="GIF" onerror="this.onerror=null;this.src='https://placehold.co/120x90/333/666?text=GIF+Not+Found';" />`;
                gifItem.onclick = () => selectGif(cleanedGifUrl); // Təmizlənmiş URL-i ötür
                gifCarousel.appendChild(gifItem);
            });
        }

        function selectGif(gifUrl) {
            if (!activeCommentPostId) {
                showAlertDialog("GIF göndərmək üçün aktiv post yoxdur.");
                return;
            }

            const newComment = {
                nickname: currentUser,
                text: gifUrl.replace(/\\/g, ''), // Düzəliş: GIF URL-dəki əks-slashları təmizləyin
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                profilePic: getProfilePic(currentUser.replace('@', '')),
                isGif: true // Bu şərhin bir GIF olduğunu göstərmək üçün
            };

            if (replyingToCommentId && replyingToCommentAuthor) {
                newComment.replyToNickname = replyingToCommentAuthor;
                commentsDb.ref(`comments/${activeCommentPostId}/${replyingToCommentId}/replies`).push(newComment);
            } else {
                commentsDb.ref(`comments/${activeCommentPostId}`).push(newComment);
            }

            commentInput.value = '';
            sendCommentButton.disabled = true;
            replyingToCommentId = null;
            replyingToCommentAuthor = null;
            commentInput.placeholder = 'Şərh yazın...';
            toggleGifList(); // GIF seçildikdən sonra siyahını bağla
            commentInput.disabled = false; // Şərh inputunu yenidən aktiv et
        }

        // GIF düyməsinə klikləmə hadisəsi
        gifButton.addEventListener('click', toggleGifList);

        // Yeni: Postu yadda saxlamaq/yaddaşdan çıxarmaq üçün funksiya
        function toggleSavePost(postId) {
            const cleanCurrentUserNickname = currentUser.replace('@', '');
            const savedPostRef = savedPostsDb.ref(`savedPosts/${postId}/${cleanCurrentUserNickname}`);

            savedPostRef.once("value").then(snap => {
                const isCurrentlySaved = snap.exists();
                if (isCurrentlySaved) {
                    savedPostRef.remove(); // Yaddaşdan çıxar
                } else {
                    savedPostRef.set(true); // Yadda saxla
                }
            });
        }
