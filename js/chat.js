import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCMUZ-RMaQBZdaF39mpLNq79BCutrANkXA",
            authDomain: "pasyak-mess.firebaseapp.com",
            databaseURL: "https://pasyak-mess-default-rtdb.firebaseio.com",
            projectId: "pasyak-mess",
            storageBucket: "pasyak-mess.firebasestorage.app",
            messagingSenderId: "243117691435",
            appId: "1:243117691435:web:aade1765ddec56ad6bd06e"
        };
        
        const tickConfig = {
            apiKey: "AIzaSyA2RNLGS-qUkhq6zNGtoUMTXJ3jNTfuHoE",
            databaseURL: "https://pasyak-tick-default-rtdb.firebaseio.com"
        };

        const premiumConfig = {
            apiKey: "AIzaSyByZEbmw0w1Q5U1LfOrFsjCpd9CXzwyHyc",
            databaseURL: "https://pasyak-premium-default-rtdb.firebaseio.com"
        };


        const app = initializeApp(firebaseConfig);
        const tickApp = initializeApp(tickConfig, "tickApp");
        const premiumApp = initializeApp(premiumConfig, "premiumApp");

        const db = getDatabase(app);
        const tickDb = getDatabase(tickApp);
        const premiumDb = getDatabase(premiumApp);


        const urlParams = new URLSearchParams(window.location.search);
        const currentUserNick = urlParams.get("user");
        const overrideProfile = urlParams.get("profile");
        const groupId = urlParams.get("group_id");

        const container = document.getElementById("messagesContainer");
        const loading = document.getElementById("loading");
        const confirmOverlay = document.getElementById("confirmOverlay");
        const yesBtn = document.getElementById("yesBtn");
        const noBtn = document.getElementById("noBtn");

        let pendingDeleteKey = null;
        let tickUsers = {};
        let premiumUsers = {};

        noBtn.onclick = () => {
            confirmOverlay.style.display = "none";
            pendingDeleteKey = null;
        };

        yesBtn.onclick = () => {
            if (pendingDeleteKey && groupId) {
                remove(ref(db, `${groupId}/${pendingDeleteKey}`));
            }
            confirmOverlay.style.display = "none";
            pendingDeleteKey = null;
        };

        if (!currentUserNick || !groupId) {
            container.innerHTML = "<p style='color:red'></p>";
            loading.style.display = "none";
            throw new Error("");
        }

        const messageRef = ref(db, groupId);

        function scrollToBottom() {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        }

        function scrollToBottomAfterImages() {
            const images = container.querySelectorAll('.content img');
            if (images.length === 0) {
                scrollToBottom();
                return;
            }

            let loadedCount = 0;
            images.forEach(img => {
                if (img.complete) {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        scrollToBottom();
                    }
                } else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === images.length) {
                            scrollToBottom();
                        }
                    });
                    img.addEventListener('error', () => {
                        loadedCount++;
                        if (loadedCount === images.length) {
                            scrollToBottom();
                        }
                    });
                }
            });
        }
        
        function getStatusBadgeUrl(nickname) {
            const cleanNickname = nickname.replace('@', ''); // @ simvolunu təmizləyir
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

        function getUsernameHtml(name, nickname) {
            const badgeUrl = getStatusBadgeUrl(nickname);
            const badgeHtml = badgeUrl ? `<img class="status-badge" src="${badgeUrl}" alt="Status" />` : '';
            return `${name}${badgeHtml}`;
        }
        
        // Asinxron məlumat yüklənməsi
        Promise.all([
            new Promise(resolve => onValue(ref(tickDb, "tick"), (snap) => {
                tickUsers = snap.val() || {};
                resolve();
            })),
            new Promise(resolve => onValue(ref(premiumDb, "premium"), (snap) => {
                premiumUsers = snap.val() || {};
                resolve();
            }))
        ]).then(() => {
            onValue(messageRef, (snapshot) => {
                loading.style.display = "none";
                container.innerHTML = "";

                if (!snapshot.exists()) return;

                const data = snapshot.val();
                let isFirstLoad = true;

                Object.entries(data).forEach(([key, rawJson]) => {
                    try {
                        const msg = JSON.parse(rawJson);

                        if (msg.nickname === "Sistem") {
                            const sysDiv = document.createElement("div");
                            sysDiv.className = "system-message";
                            sysDiv.textContent = msg.message;
                            container.appendChild(sysDiv);
                            return;
                        }

                        const isOwn = msg.nickname === currentUserNick;
                        
                        // Bu hissə overrideProfile-i nəzərə alır
                        if (isOwn && overrideProfile) {
                            msg.profile_pct = overrideProfile;
                        }
                        
                        const div = document.createElement("div");
                        div.className = `message ${isOwn ? "own-message" : "other-message"}`;
                        
                        div.innerHTML = `
                            ${isOwn ? `<span class="material-icons delete-icon" title="Sil" data-key="${key}">delete</span>` : ''}
                            <div class="header">
                                <img src="${msg.profile_pct.trim()}" class="profile" />
                                <div class="user-info">
                                    <span class="username">${getUsernameHtml(msg.user, msg.nickname)}</span>
                                    <span class="nickname">${msg.nickname}</span>
                                </div>
                            </div>
                            <div class="content">
                                ${msg.message ? msg.message : `<img src="${msg.image.trim()}" alt="Mesaj şəkli">`}
                            </div>
                            <div class="time">${msg.time || ""}</div>
                        `;

                        if (isOwn) {
                            div.querySelector(".delete-icon").addEventListener("click", () => {
                                pendingDeleteKey = key;
                                confirmOverlay.style.display = "flex";
                            });
                        }

                        container.appendChild(div);
                    } catch (e) {
                        console.error("Mesaj parse xətası:", e);
                    }
                });
                
                if(isFirstLoad){
                    scrollToBottomAfterImages();
                    isFirstLoad = false;
                } else {
                    if (container.scrollHeight - container.scrollTop < container.clientHeight + 200) {
                        scrollToBottomAfterImages();
                    }
                }
            });
        });
