import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
        import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

        // Qrupları oxumaq üçün Firebase konfiqurasiyası
        const readConfig = {
            apiKey: "AIzaSyAiS6VzSxs6tRnYyTuUttSdO5gzQ6osBpc",
            authDomain: "pasyak-group.firebaseapp.com",
            projectId: "pasyak-group",
            storageBucket: "pasyak-group.firebasestorage.app",
            messagingSenderId: "609320402321",
            appId: "1:609320402321:web:0d3322a262fc807f772e30",
            measurementId: "G-93PCBFG9QK",
            databaseURL: "https://pasyak-group-default-rtdb.firebaseio.com"
        };
        const readApp = initializeApp(readConfig, "readApp");
        const readDb = getDatabase(readApp);

        // Mesaj yazmaq üçün Firebase konfiqurasiyası
        const writeConfig = {
            apiKey: "AIzaSyCMUZ-RMaQBZdaF39mpLNq79BCutrANkXA",
            authDomain: "pasyak-mess.firebaseapp.com",
            databaseURL: "https://pasyak-mess-default-rtdb.firebaseio.com",
            projectId: "pasyak-mess",
            storageBucket: "pasyak-mess.firebasestorage.app",
            messagingSenderId: "243117691435",
            appId: "1:243117691435:web:aade1765ddec56ad6bd06e"
        };
        const writeApp = initializeApp(writeConfig, "writeApp");
        const writeDb = getDatabase(writeApp);
        
        const urlParams = new URLSearchParams(window.location.search);
        const currentUser = urlParams.get("user");

        const groupList = document.getElementById("groupList");
        const recommendedGroupsList = document.getElementById("recommendedGroups");
        const loading = document.getElementById("loading");
        const content = document.getElementById("content");
        const noGroupsMessage = document.getElementById("noGroupsMessage");
        const noRecommendedGroupsMessage = document.getElementById("noRecommendedGroupsMessage");

        if (!currentUser) {
            loading.style.display = "none";
            content.style.display = "block";
            document.querySelector("h1").style.display = "none";
            document.querySelector("h2").style.display = "none";
            document.getElementById("groupList").innerHTML = "<div class='error-message'>URL-də **?user=** parametrini əlavə edin.</div>";
            throw new Error("İstifadəçi (user) parametri yoxdur!");
        }

        const userGroupsRef = ref(readDb);

        onValue(userGroupsRef, (snapshot) => {
            loading.style.display = "none";
            content.style.display = "block";
            
            if (!snapshot.exists()) {
                noGroupsMessage.style.display = "block";
                return;
            }

            const data = snapshot.val();
            const userGroupsIds = new Set();
            const allGroupsData = data["groups"] || {};
            
            groupList.innerHTML = "";
            recommendedGroupsList.innerHTML = "";

            for (const key in data) {
                if (key.trim() === "" || key === "groups") continue;
                const groupUsers = data[key];

                if (groupUsers && typeof groupUsers === "object") {
                    const value = groupUsers[currentUser];
                    if (value !== undefined && value !== "2") {
                        userGroupsIds.add(key.trim());
                        
                        let groupStr = allGroupsData[key.trim()];
                        if (groupStr) {
                            try {
                                const groupObj = JSON.parse(groupStr);
                                if (groupObj && groupObj.profile_group && groupObj.name) {
                                    const card = createGroupCard(groupObj, key.trim(), currentUser, false);
                                    groupList.appendChild(card);
                                }
                            } catch (e) {
                                console.error("JSON parse xətası:", e);
                            }
                        }
                    }
                }
            }
            
            if (groupList.children.length === 0) {
                noGroupsMessage.style.display = "block";
            } else {
                noGroupsMessage.style.display = "none";
            }

            let hasRecommendedGroups = false;
            for (const gid in allGroupsData) {
                if (!userGroupsIds.has(gid)) {
                    hasRecommendedGroups = true;
                    let groupStr = allGroupsData[gid];
                    if (groupStr) {
                        try {
                            const groupObj = JSON.parse(groupStr);
                            if (groupObj && groupObj.profile_group && groupObj.name) {
                                const card = createGroupCard(groupObj, gid, currentUser, true);
                                recommendedGroupsList.appendChild(card);
                            }
                        } catch (e) {
                            console.error("JSON parse xətası:", e);
                        }
                    }
                }
            }

            if (!hasRecommendedGroups) {
                noRecommendedGroupsMessage.style.display = "block";
            } else {
                noRecommendedGroupsMessage.style.display = "none";
            }

        }, (error) => {
            console.error("Firebase oxuma xətası:", error);
            loading.style.display = "none";
            content.style.display = "block";
            document.getElementById("groupList").innerHTML = "<div class='error-message'>Məlumatları yükləmək mümkün olmadı.</div>";
        });

        function createGroupCard(groupObj, gid, currentUser, isRecommended) {
            const card = document.createElement("div");
            card.className = "group-card";
            card.innerHTML = `
                <img src="${groupObj.profile_group.trim()}" alt="Qrup şəkli" />
                <div class="group-name">${groupObj.name} <span style="opacity:0.6; font-size:0.85em; margin-left:8px;">#${gid}</span></div>
                ${isRecommended ? `<button class="join-button" data-group-id="${gid}">Qoşul</button>` : ''}
            `;

            if (isRecommended) {
                card.querySelector('.join-button').addEventListener('click', (event) => {
                    event.stopPropagation();
                    joinGroup(gid, currentUser);
                });
            } else {
                card.onclick = () => {
                    window.location.href = `?user=${encodeURIComponent(currentUser)}&group_id=${encodeURIComponent(gid)}`;
                };
            }
            return card;
        }

        async function joinGroup(gid, currentUser) {
            try {
                // Qrupa qoşulma məlumatını pasyak-group-a yazırıq
                const groupRef = ref(readDb, `${gid}/${currentUser}`);
                await set(groupRef, "1");

                // Unikal ID yaradırıq (vaxt + istifadəçi adı)
                const uniqueId = `${Date.now()}${currentUser}`;

                // Mesajı JSON formatında string kimi hazırlayırıq
                const messageString = JSON.stringify({
                    "message": `${currentUser} qrupa qatıldı`,
                    "nickname": "Sistem"
                });

                // Hazırlanmış stringi birbaşa unikal ID altında yazırıq
                const messageNodeRef = ref(writeDb, `${gid}/${uniqueId}`);
                await set(messageNodeRef, messageString);

                // Qoşulduqdan sonra səhifəni yeniləyirik
                window.location.reload(); 
            } catch (error) {
                console.error("Əməliyyat xətası:", error);
            }
        }
