// Firebase configuration for posts and likes (from pasyakaaz project)
        const postsFirebaseConfig = {
            apiKey: "AIzaSyC_wr_ji3crAVEmRwbHmJ0YFfx46B_as2w",
            authDomain: "pasyakaaz.firebaseapp.com",
            databaseURL: "https://pasyakaaz-default-rtdb.firebaseio.com", // Corrected databaseURL
            projectId: "pasyakaaz",
            storageBucket: "pasyakaaz.appspot.com",
            messagingSenderId: "289629756800",
            appId:  "1:289629756800:web:f7a6f00fcce2b1eb28b565"
        };

        // Firebase configuration for comments and comment likes (from gonline-1880b project)
        const commentsFirebaseConfig = {
            apiKey: "AIzaSyBK05tqx2yk3wlNEmkb2V8iUIYP3MAsVVg",
            authDomain: "gonline-1880b.firebaseapp.com",
            databaseURL: "https://gonline-1880b-default-rtdb.firebaseio.com",
            projectId: "gonline-1880b",
            storageBucket: "gonline-1880b.firebasestorage.app",
            messagingSenderId: "988052893147",
            appId: "1:988052893147:web:01586a71f48bd3eae18bfe"
        };

        // Initialize separate Firebase apps
        const postsApp = firebase.initializeApp(postsFirebaseConfig, "postsApp");
        const commentsApp = firebase.initializeApp(commentsFirebaseConfig, "commentsApp");

        const db = postsApp.database(); // This will be used for posts and likes
        const commentsDb = commentsApp.database(); // This will be used for comments and comment likes

        const postsContainer = document.getElementById("posts");
        const urlParams = new URLSearchParams(window.location.search);
        const currentUser = urlParams.get("user") || "@huseynoff";
        let currentUserProfilePic = urlParams.get("profile");
        const currentUserName = urlParams.get("name") || "Hikmet Huseynoff";

        let likeCache = {};
        let postCache = {};
        let commentsCache = {};
        let commentLikesCache = {};
        let deletePostId = null;
        let dataLoaded = { posts: false, likes: false, tick: false, premium: false, users: false, following: false, stories: false, storyLikes: false, storyReadStatusFromFirebase: false, storyViews: false, comments: false, commentLikes: false };
        let initialLoadDone = false;
        let activeCommentPostId = null;
        let replyingToCommentId = null;
        let replyingToCommentAuthor = null;

        const tickFirebaseConfig = {
            apiKey: "AIzaSyA2RNLGS-qUkh6zNGtoUMTXJ3jNTfuHoG",
            authDomain: "pasyak-tick.firebaseapp.com",
            databaseURL: "https://pasyak-tick-default-rtdb.firebaseio.com",
            projectId: "pasyak-tick",
            storageBucket: "pasyak-tick.firebasestorage.app",
            messagingSenderId: "379214418412",
            appId: "1:379214411637:web:c2c3532a1bda359aacbd1c",
            measurementId: "G-DW00VF06NR"
        };
        const premiumFirebaseConfig = {
            apiKey: "AIzaSyByZEbmw0w1Q5U1LfOrFsS_Cpd9CXzwyHyc",
            authDomain: "pasyak-premium.firebaseapp.com",
            databaseURL: "https://pasyak-premium-default-rtdb.firebaseio.com",
            projectId: "pasyak-premium",
            storageBucket: "pasyak-premium.appspot.com",
            messagingSenderId: "662922654975",
            appId: "1:662922654975:web:54b78968d4cccba65f88ca",
            measurementId: "G-QDTGFYXKK"
        };
        
        const userFirebaseConfig = {
            apiKey: "AIzaSyBHRY6yGGT9qHV8df1OJXtmbQ7QWu69ps",
            authDomain: "pasyak-user.firebaseapp.com",
            databaseURL: "https://pasyak-user-default-rtdb.firebaseio.com",
            projectId: "pasyak-user",
            storageBucket: "pasyak-user.firebasestorage.app",
            messagingSenderId: "898141218588",
            appId: "1:898141218588:web:f3477f39d96bceb2727cd9"
        };
        
        const followingFirebaseConfig = {
            apiKey: "AIzaSyBA0gfZVLCnGV2Hli6BjEbq08SmLzFkshg",
            authDomain: "pasyak-following.firebaseapp.com",
            databaseURL: "https://pasyak-following-default-rtdb.firebaseio.com",
            projectId: "pasyak-following",
            storageBucket: "pasyak-following.firebasestorage.app",
            messagingSenderId: "538884111637",
            appId: "1:538884111637:web:c2c3532a1bda359aacbd1c"
        };
        
        const gonlineFirebaseConfig = {
            apiKey: "AIzaSyBbLAI5r4b97OdNzNE230mMN0QhLBaJY2A",
            authDomain: "haha-e8466.firebaseapp.com",
            databaseURL: "https://haha-e8466-default-rtdb.firebaseio.com",
            projectId: "haha-e8466",
            storageBucket: "haha-e8466.firebasestorage.app",
            messagingSenderId: "999082137317",
            appId: "1:999082137317:web:4a8893fcdc501aea23a60c",
            measurementId: "G-4RDTRYNJ02"
        };

        const tickApp = firebase.initializeApp(tickFirebaseConfig, "tickApp");
        const premiumApp = firebase.initializeApp(premiumFirebaseConfig, "premiumApp");
        const userApp = firebase.initializeApp(userFirebaseConfig, "userApp");
        const followingApp = firebase.initializeApp(followingFirebaseConfig, "followingApp");
        const gonlineApp = firebase.initializeApp(gonlineFirebaseConfig, "gonlineApp");

        const tickDb = tickApp.database();
        const premiumDb = premiumApp.database();
        const userDb = userApp.database();
        const followingDb = followingApp.database();
        const gonlineDb = gonlineApp.database();

        let tickUsers = {};
        let premiumUsers = {};
        let allUsers = {};
        let followingUsers = [];
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

        function hideLoaderIfReady() {
            if (Object.values(dataLoaded).every(status => status)) {
                const loader = document.getElementById("loader");
                loader.style.opacity = 0;
                setTimeout(() => {
                    loader.style.display = "none";
                    document.getElementById("posts").style.display = "block";
                }, 500);
                
                // If comment param is in URL, open comment overlay
                if (urlParams.get('comment') === 'true' && urlParams.get('postId')) {
                    // We need to set activeCommentPostId internally, even if not in URL
                    activeCommentPostId = urlParams.get('postId');
                    openCommentOverlay(activeCommentPostId);
                }
            }
        }
        
        function getStatusBadge(nickname) {
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
        
        function getUserName(nickname) {
            const cleanNickname = nickname.startsWith('@') ? nickname.substring(1) : nickname;
            if (allUsers[cleanNickname]) {
                try {
                    const userData = JSON.parse(allUsers[cleanNickname]);
                    return userData[1];
                } catch(e) {
                    console.error(`Failed to parse user data for ${cleanNickname}`);
                }
            }
            // Fallback for current user if their data isn't in allUsers yet
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
                    console.error(`Failed to parse user data for ${cleanNickname}`);
                }
            }
            // Fallback for current user if their data isn't in allUsers yet
            if (cleanNickname === currentUser.replace('@', '') && currentUserProfilePic) {
                return currentUserProfilePic;
            }
            return "https://placehold.co/40x40/333333/FFFFFF?text=📸";
        }

        function formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(minutes / (60 * 24)); // Corrected days calculation
            const months = Math.floor(days / 30);
            const years = Math.floor(months / 12);

            if (years > 0) return `${years} il əvvəl`;
            if (months > 0) return `${months} ay əvvəl`;
            if (days > 0) return `${days} gün əvvəl`;
            if (hours > 0) return `${hours} saat əvvəl`;
            if (minutes > 0) return `${minutes} dəq əvvəl`;
            return `${seconds} san əvvəl`;
        }


        function renderPost(postId, data) {
            const postLikes = likeCache[postId] ? Object.keys(likeCache[postId]).length : 0;
            const isLikedByUser = likeCache[postId] && likeCache[postId][currentUser];

            const postEl = document.createElement("div");
            postEl.className = "post";
            postEl.id = "post_" + postId;

            const header = document.createElement("div");
            header.className = "post-header";

            const img = document.createElement("img");
            img.className = "profile-pic";
            img.src = getProfilePic(data.nickname);
            img.alt = data.nickname + " profile picture";

            const userBox = document.createElement("div");
            userBox.className = "username-box";

            const userNameDiv = document.createElement("div");
            userNameDiv.className = "userid";
            userNameDiv.textContent = getUserName(data.nickname) || data.user || "";

            const statusBadgeUrl = getStatusBadge(data.nickname);
            if (statusBadgeUrl) {
                const statusBadgeImg = document.createElement("img");
                statusBadgeImg.className = "status-badge";
                statusBadgeImg.src = statusBadgeUrl;
                statusBadgeImg.alt = "Status badge";
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

            postEl.appendChild(header);

            if (data.text) {
                const text = document.createElement("div");
                text.className = "post-text";
                text.textContent = data.text;
                postEl.appendChild(text);
            }

            if (data.image) {
                const image = document.createElement("img");
                image.className = "post-image";
                image.src = data.image.replace(/\\/g, '').trim();
                image.alt = "Post image";
                postEl.appendChild(image);
            }

            const footer = document.createElement("div");
            footer.className = "post-footer";
            
            const likeBtn = document.createElement("button");
            likeBtn.className = "like-button";
            if (isLikedByUser) likeBtn.classList.add("liked");
            likeBtn.innerHTML = `
                <span class="material-icons">${isLikedByUser ? 'favorite' : 'favorite_border'}</span>
                <span class="like-count">${postLikes}</span>
            `;
            likeBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                const likeRef = db.ref(`likes/${postId}/${currentUser}`); // Use 'db' for post likes
                likeRef.once("value").then(snap => {
                    const isCurrentlyLiked = snap.exists();
                    if (isCurrentlyLiked) {
                        likeRef.remove();
                    } else {
                        likeRef.set(true);
                    }
                });
            });
            footer.appendChild(likeBtn);

            // Comment Button
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
            footer.appendChild(commentBtn);

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
                db.ref("posts/" + deletePostId).remove(); // Use 'db' for post deletion
                db.ref("likes/" + deletePostId).remove(); // Use 'db' for post likes deletion
                commentsDb.ref("comments/" + deletePostId).remove(); // Use 'commentsDb' for comments deletion
                document.getElementById("confirmDialog").style.display = "none";
                deletePostId = null;
            }
        };

        document.getElementById("confirmNo").onclick = () => {
            document.getElementById("confirmDialog").style.display = "none";
            deletePostId = null;
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
        
        function updateProfileInFirebase(nickname, newProfilePicUrl) {
            // Update profile in posts Firebase
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
                                console.log(`Post ${postId} for user ${nickname} updated.`);
                            }).catch(error => {
                                console.error(`Error updating profile pic for post ${postId}:`, error);
                            });
                        }
                    }
                });
            });
            // Also update comments with new profile pic in comments Firebase
            commentsDb.ref("comments").once("value", (snapshot) => {
                snapshot.forEach((postCommentsSnapshot) => {
                    const postId = postCommentsSnapshot.key;
                    postCommentsSnapshot.forEach((commentSnapshot) => {
                        const commentId = commentSnapshot.key;
                        const commentData = commentSnapshot.val();
                        if (commentData.nickname.replace('@', '') === nickname.replace('@', '')) {
                            if (commentData.profilePic !== newProfilePicUrl) {
                                commentsDb.ref(`comments/${postId}/${commentId}/profilePic`).set(newProfilePicUrl).then(() => {
                                    console.log(`Comment ${commentId} for user ${nickname} updated with new profile pic.`);
                                }).catch(error => {
                                    console.error(`Error updating profile pic for comment ${commentId}:`, error);
                                });
                            }
                        }
                        // Check replies
                        if (commentData.replies) {
                            for (const replyId in commentData.replies) {
                                const replyData = commentData.replies[replyId];
                                if (replyData.nickname.replace('@', '') === nickname.replace('@', '')) {
                                    if (replyData.profilePic !== newProfilePicUrl) {
                                        commentsDb.ref(`comments/${postId}/${commentId}/replies/${replyId}/profilePic`).set(newProfilePicUrl).then(() => {
                                            console.log(`Reply ${replyId} for user ${nickname} updated with new profile pic.`);
                                        }).catch(error => {
                                            console.error(`Error updating profile pic for reply ${replyId}:`, error);
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
            
            followingUsers.forEach(user => allStoryUsers.add(user.replace('@', '')));
            
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
            const storiesForUser = (allStories.images[nickname] || []).concat(allStories.videos[nickname] || []).sort((a,b) => b.timestamp - a.timestamp);
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
                    const storyType = story.image ? 'posts' : 'snap';
                    gonlineDb.ref(`${storyType}/${story.storyId}`).remove();
                    gonlineDb.ref(`storyViews/${story.storyId}`).remove();
                    gonlineDb.ref(`likes/${story.storyId}`).remove();
                    closeStoryViewer();
                }
            };

            const isOwnStory = currentUser.replace('@', '') === currentStoryUser.replace('@', '');
            storyDeleteBtn.style.display = isOwnStory ? 'block' : 'none';
            
            const profilePicEl = storyViewer.querySelector(".story-header .story-profile-pic");
            const usernameEl = storyViewer.querySelector(".story-header .username");
            const headerClickHandler = () => {
                window.location.href = `?other_user=${nickname}`;
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
                resumeStory(); // Resume story after closing list
            } else {
                listContainer.innerHTML = `<h4>Bəyənənlər</h4>`;
                const users = Object.keys(likes);
                if (users.length > 0) {
                    users.forEach(user => {
                        const userDiv = document.createElement('div');
                        userDiv.className = 'liked-user-item';
                        userDiv.innerHTML = `
                            <img src="${getProfilePic(user)}" alt="${user} profile picture" />
                            <span>${getUserName(user)}</span>
                        `;
                        userDiv.onclick = () => {
                            window.location.href = `?other_user=@${user}`;
                            closeStoryViewer();
                        };
                        listContainer.appendChild(userDiv);
                    });
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
                resumeStory(); // Resume story after closing list
            } else {
                listContainer.innerHTML = `<h4>Baxışlar</h4>`;
                const users = Object.keys(views);
                if (users.length > 0) {
                    users.forEach(user => {
                        const userDiv = document.createElement('div');
                        userDiv.className = 'viewed-user-item';
                        userDiv.innerHTML = `
                            <img src="${getProfilePic(user)}" alt="${user} profile picture" />
                            <span>${getUserName(user)}</span>
                        `;
                        userDiv.onclick = () => {
                            window.location.href = `?other_user=@${user}`;
                            closeStoryViewer();
                        };
                        listContainer.appendChild(userDiv);
                    });
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

            // Add event listeners for tap/click gestures
            let touchStartX = 0;
            let longPressTimer;

            mediaContainer.onmousedown = mediaContainer.ontouchstart = (e) => {
                e.preventDefault();
                touchStartX = (e.touches ? e.touches[0] : e).clientX;
                lastTouchTime = Date.now();
                longPressTimer = setTimeout(pauseStory, 300); // Hold for 300ms to pause
            };
            
            mediaContainer.onmouseup = mediaContainer.ontouchend = (e) => {
                clearTimeout(longPressTimer);
                const touchEndX = (e.changedTouches ? e.changedTouches[0] : e).clientX;
                const touchEndTime = Date.now();
                const screenWidth = window.innerWidth;
                
                if (touchEndTime - lastTouchTime < 300) {
                    // Tap/short press
                    if (touchEndX < screenWidth / 2) {
                        prevStory();
                    } else {
                        nextStory();
                    }
                } else if (isPaused) {
                    // Resume if previously paused by long press
                    resumeStory();
                }
            };
            
            mediaContainer.onmousemove = mediaContainer.ontouchmove = (e) => {
                // If a significant move happens, cancel the long press
                const currentX = (e.touches ? e.touches[0] : e).clientX;
                if (Math.abs(currentX - touchStartX) > 10) {
                    clearTimeout(longPressTimer);
                }
            };

            if (story.image) {
                const img = document.createElement("img");
                img.src = story.image;
                img.onerror = function() {
                    console.error("Failed to load story image:", this.src);
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
                video.style.objectFit = 'contain';
                
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
                    console.error("Failed to load story video:", this.src);
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
                    console.log(`Story from ${nickname} marked as read by ${currentUser}.`);
                })
                .catch(error => {
                    console.error("Error marking story as read in Firebase:", error);
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
            hideLoaderIfReady();
        });
        
        followingDb.ref(currentUser.replace('@', '')).on("value", (snapshot) => {
            const data = snapshot.val() || {};
            const keys = Object.keys(data).filter(key => data[key] === "+" || data[key] === '"+"');
            followingUsers = keys.map(key => key.startsWith('@') ? key : `@${key}`);
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
                    stories[nickname].push({...post, storyId: child.key, timestamp: postTime});
                } catch(e) {
                    console.error("Story (posts) məlumatı oxunarkən xəta:", e);
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
                    stories[nickname].push({...post, storyId: child.key, timestamp: postTime});
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
                                console.log(`Own story read status reset for ${cleanCurrentUser}.`);
                            })
                            .catch(error => {
                                console.error("Error resetting own story read status:", error);
                            });
                    }
                } catch (e) {
                    console.error("Error parsing new story data from posts (child_added):", e);
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
                                console.log(`Own story read status reset for ${cleanCurrentUser}.`);
                            })
                            .catch(error => {
                                console.error("Error resetting own story read status:", error);
                            });
                    }
                } catch (e) {
                    console.error("Error parsing new story data from snap (child_added):", e);
                }
            }
        });


        db.ref("likes").on("value", (likesSnap) => { // Use 'db' for post likes
            likeCache = likesSnap.val() || {};
            dataLoaded.likes = true;
            for (const postId in postCache) {
                updateLikeInfo(postId);
            }
            hideLoaderIfReady();
        });

        // Listener for comments (using commentsDb)
        commentsDb.ref("comments").on("value", (snapshot) => {
            commentsCache = snapshot.val() || {};
            dataLoaded.comments = true;
            // Update comment counts on posts
            for (const postId in postCache) {
                updateCommentCount(postId);
            }
            // If the comment overlay is open for a post, re-render its comments
            if (activeCommentPostId) {
                renderComments(activeCommentPostId);
            }
            hideLoaderIfReady();
        });

        // Listener for comment likes (using commentsDb)
        commentsDb.ref("commentLikes").on("value", (snapshot) => {
            commentLikesCache = snapshot.val() || {};
            dataLoaded.commentLikes = true;
            if (activeCommentPostId) {
                renderComments(activeCommentPostId);
            }
            hideLoaderIfReady();
        });

        tickDb.ref("tick").on("value", (snapshot) => {
            tickUsers = snapshot.val() || {};
            dataLoaded.tick = true;
            for (const postId in postCache) {
                const existingPostEl = document.getElementById(`post_${postId}`);
                if (existingPostEl) {
                    const postData = postCache[postId];
                    const newHeader = renderPost(postId, postData).querySelector('.post-header');
                    existingPostEl.querySelector('.post-header').replaceWith(newHeader);
                }
            }
            hideLoaderIfReady();
        });

        premiumDb.ref("premium").on("value", (snapshot) => {
            premiumUsers = snapshot.val() || {};
            dataLoaded.premium = true;
            for (const postId in postCache) {
                const existingPostEl = document.getElementById(`post_${postId}`);
                if (existingPostEl) {
                    const postData = postCache[postId];
                    const newHeader = renderPost(postId, postData).querySelector('.post-header');
                    existingPostEl.querySelector('.post-header').replaceWith(newHeader);
                }
            }
            hideLoaderIfReady();
        });
        
        db.ref("posts").once("value").then(snapshot => { // Use 'db' for initial posts load
            const allPosts = snapshot.val() || {};
            const postDataArray = [];
            for (const postId in allPosts) {
                try {
                    const postData = JSON.parse(allPosts[postId]);
                    postCache[postId] = postData;
                    postDataArray.push({ id: postId, data: postData });
                } catch (e) {
                    console.error("İlk post məlumatı oxunarkən xəta:", e);
                }
            }
            
            const shuffledPosts = postDataArray.sort(() => 0.5 - Math.random());
            
            postsContainer.innerHTML = "";
            shuffledPosts.forEach(post => {
                postsContainer.appendChild(renderPost(post.id, post.data));
            });
            dataLoaded.posts = true;
            initialLoadDone = true;
            hideLoaderIfReady();

            db.ref("posts").on("child_added", (snap) => { // Use 'db' for child_added on posts
                if (initialLoadDone) {
                    const postId = snap.key;
                    if (!postCache[postId]) {
                        try {
                            const postData = JSON.parse(snap.val());
                            postCache[postId] = postData;
                            const newPostEl = renderPost(postId, postData);
                            postsContainer.prepend(newPostEl);
                        } catch (e) {
                            console.error("Yeni post əlavə edilərkən xəta:", postId, e);
                        }
                    }
                }
            });

            db.ref("posts").on("child_changed", (snap) => { // Use 'db' for child_changed on posts
                const postId = snap.key;
                try {
                    const postData = JSON.parse(snap.val());
                    postCache[postId] = postData;
                    const existingPostEl = document.getElementById("post_" + postId);
                    if (existingPostEl) {
                        const newPostEl = renderPost(postId, postData);
                        postsContainer.replaceChild(newPostEl, existingPostEl);
                    }
                } catch (e) {
                    console.error("Post dəyişdirilərkən xəta:", postId, e);
                }
            });

            db.ref("posts").on("child_removed", (snap) => { // Use 'db' for child_removed on posts
                const postId = snap.key;
                delete postCache[postId];
                const el = document.getElementById("post_" + postId);
                if (el) el.remove();
            });

        }).catch(error => {
            console.error("İlk post məlumatları yüklənərkən xəta:", error);
            dataLoaded.posts = true;
            initialLoadDone = true;
            hideLoaderIfReady();
        });

        // Comment functionality
        const commentOverlay = document.getElementById('comment-overlay');
        const commentsList = document.getElementById('comments-list');
        const commentInput = document.getElementById('comment-input');
        const sendCommentButton = document.getElementById('send-comment-button');
        // const currentUserCommentPic = document.getElementById('current-user-comment-pic'); // Removed this element

        // No longer needed since the profile picture element is removed from HTML
        // currentUserCommentPic.src = getProfilePic(currentUser.replace('@', '')); 

        function openCommentOverlay(postId) {
            activeCommentPostId = postId; // Internal tracking of the postId
            
            // Update URL to only add &comment=true
            const currentUrl = new URL(window.location.href);
            const newSearchParams = new URLSearchParams(currentUrl.search);
            newSearchParams.set('comment', 'true');
            newSearchParams.delete('postId'); // Ensure postId is removed if it was there before

            const newUrl = currentUrl.origin + currentUrl.pathname + '?' + newSearchParams.toString();
            history.pushState(null, '', newUrl);

            commentOverlay.style.display = 'flex';
            // Trigger animation
            requestAnimationFrame(() => {
                commentOverlay.classList.add('visible');
                document.body.style.overflow = 'hidden'; // Prevent body scroll when overlay is open
            });
            
            commentInput.value = ''; // Clear input field
            replyingToCommentId = null; // Reset reply state
            replyingToCommentAuthor = null;
            commentInput.placeholder = 'Şərh yazın...'; // Reset placeholder
            sendCommentButton.disabled = true; // Disable send button initially

            // Render comments using the internally tracked activeCommentPostId
            renderComments(activeCommentPostId);
        }

        function closeCommentOverlay() {
            commentOverlay.classList.remove('visible');
            
            // Remove 'comment' and 'postId' from URL
            const currentUrl = new URL(window.location.href);
            const newSearchParams = new URLSearchParams(currentUrl.search);
            newSearchParams.delete('comment');
            newSearchParams.delete('postId'); // Also ensure postId is removed if any old URL still has it

            const newUrl = currentUrl.origin + currentUrl.pathname + '?' + newSearchParams.toString();
            history.pushState(null, '', newUrl);

            setTimeout(() => {
                commentOverlay.style.display = 'none';
                document.body.style.overflow = 'auto'; // Re-enable body scroll
                activeCommentPostId = null; // Reset internal postId tracking
                replyingToCommentId = null;
                replyingToCommentAuthor = null;
                commentInput.value = '';
                commentInput.placeholder = 'Şərh yazın...';
                sendCommentButton.disabled = true;
            }, 300);
        }

        function renderComments(postId) {
            commentsList.innerHTML = '';
            if (!postId) {
                // If no postId is active, clear the comments list and return
                console.warn("Şərhləri göstərmək üçün aktiv post ID yoxdur.");
                return;
            }
            const commentsForPost = commentsCache[postId] || {};
            
            // Sort comments by timestamp
            const sortedCommentIds = Object.keys(commentsForPost).sort((a, b) => {
                return commentsForPost[a].timestamp - commentsForPost[b].timestamp;
            });

            sortedCommentIds.forEach(commentId => {
                const commentData = commentsForPost[commentId];
                commentsList.appendChild(createCommentElement(postId, commentId, commentData));
            });
            commentsList.scrollTop = commentsList.scrollHeight; // Scroll to bottom
        }

        function createCommentElement(postId, commentId, commentData, isReply = false, parentCommentId = null) {
            const wrapperElement = document.createElement('div');
            wrapperElement.className = isReply ? 'reply-item' : 'comment-item';
            wrapperElement.id = `${isReply ? 'reply_' : 'comment_'}${commentId}`;

            const profilePic = document.createElement('img');
            profilePic.className = 'profile-pic';
            profilePic.src = getProfilePic(commentData.nickname);
            profilePic.alt = commentData.nickname + ' profile picture';
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
            
            // If it's a reply and has a replyToNickname, format the text
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
            text.appendChild(document.createTextNode(commentData.text));


            const actions = document.createElement('div');
            actions.className = 'comment-actions';

            // Like button for comments - ONLY show for top-level comments (not replies)
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
                // It's a reply
                newComment.replyToNickname = replyingToCommentAuthor;
                commentsDb.ref(`comments/${activeCommentPostId}/${replyingToCommentId}/replies`).push(newComment); // Use 'commentsDb' for replies
            } else {
                // It's a new top-level comment
                commentsDb.ref(`comments/${activeCommentPostId}`).push(newComment); // Use 'commentsDb' for new comments
            }

            commentInput.value = '';
            sendCommentButton.disabled = true;
            replyingToCommentId = null;
            replyingToCommentAuthor = null;
            commentInput.placeholder = 'Şərh yazın...';
        });

        function toggleCommentLike(commentId) {
            const likeRef = commentsDb.ref(`commentLikes/${commentId}/${currentUser}`); // Use 'commentsDb' for comment likes
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
            // postIdInUrl is no longer used for opening, as per your request
            // const postIdInUrl = currentUrlParams.get('postId'); 

            if (isCommentOpenInUrl && !commentOverlay.classList.contains('visible')) {
                // If comment param is present, try to open.
                // activeCommentPostId will remain whatever it was set to by clicking a post's comment button.
                // If a user navigates to a URL with only `?comment=true` and no previous postId was set, 
                // the comments list will be empty as renderComments checks for activeCommentPostId.
                openCommentOverlay(activeCommentPostId); 
            } else if (!isCommentOpenInUrl && commentOverlay.classList.contains('visible')) {
                closeCommentOverlay();
            }
        });
