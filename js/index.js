const firebaseConfig = {
            apiKey: "AIzaSyC_wr_ji3crAVEmRwbHmJ0YJfx46B_as2w",
            authDomain: "pasyakaaz.firebaseapp.com",
            projectId: "pasyakaaz",
            storageBucket: "pasyakaaz.appspot.com",
            messagingSenderId: "289629756800",
            appId: "1:289629756800:web:f7a6f00fcce2b1eb28b565"
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();
        const postsContainer = document.getElementById("posts");
        const urlParams = new URLSearchParams(window.location.search);
        const currentUser = urlParams.get("user") || "anonim";
        let currentUserProfilePic = urlParams.get("profile");

        let likeCache = {};
        let postCache = {};
        let deletePostId = null;
        let dataLoaded = { posts: false, likes: false, tick: false, premium: false };
        let initialLoadDone = false; // Yeni dəyişiklik

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

        const tickApp = firebase.initializeApp(tickFirebaseConfig, "tickApp");
        const premiumApp = firebase.initializeApp(premiumFirebaseConfig, "premiumApp");
        const tickDb = tickApp.database();
        const premiumDb = premiumApp.database();

        let tickUsers = {};
        let premiumUsers = {};

        function hideLoaderIfReady() {
            if (dataLoaded.posts && dataLoaded.likes && dataLoaded.tick && dataLoaded.premium) {
                const loader = document.getElementById("loader");
                loader.style.opacity = 0;
                setTimeout(() => {
                    loader.style.display = "none";
                    document.getElementById("posts").style.display = "block";
                }, 500);
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

        function getUniqueImageUrl(originalUrl) {
            if (!originalUrl) return "https://via.placeholder.com/36?text=?";
            return originalUrl;
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
            img.src = getUniqueImageUrl(data.profile);

            const userBox = document.createElement("div");
            userBox.className = "username-box";

            const userNameDiv = document.createElement("div");
            userNameDiv.className = "userid";
            userNameDiv.textContent = data.user || "";

            const statusBadgeUrl = getStatusBadge(data.nickname);
            if (statusBadgeUrl) {
                const statusBadgeImg = document.createElement("img");
                statusBadgeImg.className = "status-badge";
                statusBadgeImg.src = statusBadgeUrl;
                userNameDiv.appendChild(statusBadgeImg);
            }

            const nickDiv = document.createElement("div");
            nickDiv.className = "nickname";
            const displayNickname = data.nickname.startsWith('@') ? data.nickname : `@${data.nickname}`;
            nickDiv.textContent = displayNickname;

            const userClickHandler = () => {
                window.location.href = `?other_user=${encodeURIComponent(data.nickname)}`;
            };
            userNameDiv.addEventListener("click", userClickHandler);
            nickDiv.addEventListener("click", userClickHandler);
            img.addEventListener("click", userClickHandler);

            userBox.appendChild(userNameDiv);
            userBox.appendChild(nickDiv);
            header.appendChild(img);
            header.appendChild(userBox);

            if (data.nickname === currentUser) {
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-button material-icons";
                deleteBtn.textContent = "delete";
                deleteBtn.addEventListener("click", () => {
                    deletePostId = postId;
                    document.getElementById("confirmDialog").style.display = "flex";
                });
                header.appendChild(deleteBtn);
            }

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
                postEl.appendChild(image);
            }

            const likeBtn = document.createElement("button");
            likeBtn.className = "like-button";
            if (isLikedByUser) likeBtn.classList.add("liked");
            likeBtn.innerHTML = `
                <span class="material-icons">favorite</span>
                <span class="like-count">${postLikes}</span>
            `;
            likeBtn.addEventListener("click", () => {
                const likeRef = db.ref(`likes/${postId}/${currentUser}`);
                likeRef.once("value").then(snap => {
                    const isCurrentlyLiked = snap.exists();
                    if (isCurrentlyLiked) {
                        likeRef.remove();
                    } else {
                        likeRef.set(true);
                    }
                });
            });
            postEl.appendChild(likeBtn);

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
                    const summaryHtml = users.map(u => `<span onclick="window.location.href='?other_user=${encodeURIComponent(u)}'">${u}</span>`).join(", ") + " bəyəndi";
                    likedUsersSummary.innerHTML = summaryHtml;
                    likedUsersList.style.display = "none";
                } else {
                    const firstTwo = users.slice(0, 2).map(u => `<span onclick="window.location.href='?other_user=${encodeURIComponent(u)}'">${u}</span>`).join(", ");
                    likedUsersSummary.innerHTML = `${firstTwo} bəyəndi <span class="liked-users-more">... (kliklə)</span>`;
                    likedUsersList.style.display = "none";
                    likedUsersList.innerHTML = "";
                    users.slice(2).forEach(u => {
                        const div = document.createElement("div");
                        div.textContent = "" + u;
                        div.onclick = () => {
                            window.location.href = `?other_user=${encodeURIComponent(u)}`;
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

            if (data.time) {
                const timeDiv = document.createElement("div");
                timeDiv.className = "post-time";
                timeDiv.textContent = data.time;
                postEl.appendChild(timeDiv);
            }

            return postEl;
        }

        document.getElementById("confirmYes").onclick = () => {
            if (deletePostId) {
                db.ref("posts/" + deletePostId).remove();
                db.ref("likes/" + deletePostId).remove();
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
            } else {
                likeBtn.classList.remove("liked");
            }
            
            const users = Object.keys(likeCache[postId] || {});
            if (users.length === 0) {
                likedUsersSummary.textContent = "";
                likedUsersList.style.display = "none";
            } else if (users.length <= 2) {
                const summaryHtml = users.map(u => `<span onclick="window.location.href='?other_user=${encodeURIComponent(u)}'">${u}</span>`).join(", ") + " bəyəndi";
                likedUsersSummary.innerHTML = summaryHtml;
                likedUsersList.style.display = "none";
            } else {
                const firstTwo = users.slice(0, 2).map(u => `<span onclick="window.location.href='?other_user=${encodeURIComponent(u)}'">${u}</span>`).join(", ");
                likedUsersSummary.innerHTML = `${firstTwo} bəyəndi <span class="liked-users-more">... (kliklə)</span>`;
                likedUsersList.style.display = "none";
                likedUsersList.innerHTML = "";
                users.slice(2).forEach(u => {
                    const div = document.createElement("div");
                    div.textContent = "" + u;
                    div.onclick = () => {
                        window.location.href = `?other_user=${encodeURIComponent(u)}`;
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

        function updateProfileInFirebase(nickname, newProfilePicUrl) {
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

                    if (postData.nickname === nickname) {
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
        }

        if (currentUser && currentUserProfilePic) {
            updateProfileInFirebase(currentUser, currentUserProfilePic);
        }

        // --- Firebase Listeners ---

        db.ref("likes").on("value", (likesSnap) => {
            likeCache = likesSnap.val() || {};
            dataLoaded.likes = true;
            for (const postId in postCache) {
                updateLikeInfo(postId);
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
                    // Update header only to reflect tick/premium changes
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
                    // Update header only to reflect tick/premium changes
                    const newHeader = renderPost(postId, postData).querySelector('.post-header');
                    existingPostEl.querySelector('.post-header').replaceWith(newHeader);
                }
            }
            hideLoaderIfReady();
        });
        
        // İlk yükləmə: Postları təsadüfi sırala
        db.ref("posts").once("value").then(snapshot => {
            const allPosts = snapshot.val() || {};
            const postDataArray = [];
            for (const postId in allPosts) {
                try {
                    const postData = JSON.parse(allPosts[postId]);
                    postCache[postId] = postData;
                    postDataArray.push({ id: postId, data: postData });
                } catch (e) {
                    console.error("Post məlumatı oxunarkən xəta:", postId, e);
                }
            }
            
            // Postları təsadüfi qaydada sırala
            const shuffledPosts = postDataArray.sort(() => 0.5 - Math.random());
            
            postsContainer.innerHTML = "";
            shuffledPosts.forEach(post => {
                postsContainer.appendChild(renderPost(post.id, post.data));
            });
            dataLoaded.posts = true;
            initialLoadDone = true; // İlk yükləmə tamamlandı
            hideLoaderIfReady();

            // Real-time dinləyiciləri ilkin yükləmədən sonra işə sal
            db.ref("posts").on("child_added", (snap) => {
                if (initialLoadDone) { // Yalnız ilk yükləmədən sonra yeni əlavə olunanları dinlə
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

            db.ref("posts").on("child_changed", (snap) => {
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

            db.ref("posts").on("child_removed", (snap) => {
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
