import {initializeApp as initApp} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
    import {getDatabase, ref, onValue, get, set, onDisconnect} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

    // Qrup DB config
    const firebaseConfigGroups = {
        apiKey: "AIzaSyAiS6VzSxs6tRnYyTuUttSdO5gzQ6osBpc",
        authDomain: "pasyak-group.firebaseapp.com",
        databaseURL: "https://pasyak-group-default-rtdb.firebaseio.com",
        projectId: "pasyak-group",
        storageBucket: "pasyak-group.firebasestorage.app",
        messagingSenderId: "609320402321",
        appId: "1:609320402321:web:0d3322a262fc807f772e30",
        measurementId: "G-93PCBFG9QK"
    };

    // İstifadəçi DB config
    const firebaseConfigUsers = {
        apiKey: "AIzaSyBHRY6yGGT9qHV8df1OJXtmbQ7QxWu69ps",
        authDomain: "pasyak-user.firebaseapp.com",
        databaseURL: "https://pasyak-user-default-rtdb.firebaseio.com",
        projectId: "pasyak-user",
        storageBucket: "pasyak-user.firebasestorage.app",
        messagingSenderId: "898141218588",
        appId: "1:898141218588:web:f3477f39d96bceb2727cd9"
    };

    // Tick DB config
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

    // Premium DB config
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

    const appGroups = initApp(firebaseConfigGroups, "groupsApp");
    const appUsers = initApp(firebaseConfigUsers, "usersApp");
    const appTick = initApp(tickFirebaseConfig, "tickApp");
    const appPremium = initApp(premiumFirebaseConfig, "premiumApp");

    const dbGroups = getDatabase(appGroups);
    const dbUsers = getDatabase(appUsers);
    const dbTick = getDatabase(appTick);
    const dbPremium = getDatabase(appPremium);

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("group_id");
    const currentUser = urlParams.get("user");

    const userList = document.getElementById("userList");
    const loading = document.getElementById("loading");

    if (!groupId || !currentUser) {
        loading.style.display = "none";
        document.body.innerHTML = "<p style='color:red'></p>";
        throw new Error("group_id və ya user yoxdur");
    }

    // Tick & Premium məlumatlarını saxlayırıq
    let tickUsers = {};
    let premiumUsers = {};

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

    // Qrup və istifadəçi məlumatlarını yükləyən funksiya
    async function loadUsersAndStatus() {
        try {
            const usersSnap = await get(ref(dbUsers, "Users"));
            const allUsers = usersSnap.val();

            // Qrupun məlumatlarına real vaxtda qulaq asırıq
            onValue(ref(dbGroups, groupId), (groupSnap) => {
                if (!groupSnap.exists()) {
                    userList.innerHTML = "<p style='color:red'>Qrup tapılmadı.</p>";
                    userList.style.display = "block";
                    loading.style.display = "none";
                    return;
                }

                const groupData = groupSnap.val();
                userList.innerHTML = "";
                userList.style.display = "block";
                loading.style.display = "none";

                Object.entries(groupData).forEach(([usernameKey, value]) => {
                    if (value !== "1") {
                        return;
                    }

                    const username = usernameKey.replace("@", "").trim();
                    const rawData = allUsers?.[username];
                    if (!rawData) return;

                    try {
                        const [name, nick, photo] = JSON.parse(rawData);
                        const card = document.createElement("div");
                        card.className = "user-card";
                        const statusBadgeUrl = getStatusBadge(nick);

                        let nameHTML = `${name}`;
                        if (statusBadgeUrl) {
                            nameHTML += ` <img class="status-badge" src="${statusBadgeUrl}" alt="status">`;
                        }

                        card.innerHTML = `
                            <img class="profile-pic" src="${photo.trim()}" alt="Profil şəkli">
                            <div class="user-info">
                                <div class="name">${nameHTML}</div>
                                <div class="nickname">@${nick}</div>
                            </div>
                        `;
                        userList.appendChild(card);
                    } catch (e) {
                        console.error("İstifadəçi məlumatı xətalıdır:", username);
                    }
                });

                if (userList.children.length === 0) {
                    userList.innerHTML = "<p>Qrupda görünən iştirakçı yoxdur.</p>";
                }
            });
        } catch (error) {
            console.error("Məlumatlar alınarkən xəta:", error);
            loading.style.display = "none";
            userList.innerHTML = "<p style='color:red'>Xəta baş verdi.</p>";
            userList.style.display = "block";
        }
    }

    // Tick & Premium məlumatlarını real vaxtda izləyirik
    onValue(ref(dbTick, "tick"), (snap) => {
        tickUsers = snap.val() || {};
        loadUsersAndStatus();
    });

    onValue(ref(dbPremium, "premium"), (snap) => {
        premiumUsers = snap.val() || {};
        loadUsersAndStatus();
    });

    // Başlanğıcda funksiyanı çağırırıq
    loadUsersAndStatus();
