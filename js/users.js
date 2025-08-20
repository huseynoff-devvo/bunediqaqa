 const userConfig = {
            apiKey: "AIzaSyBHRY6yGGT9qHV8df1OJXtmbQ7QxWu69ps",
            authDomain: "pasyak-user.firebaseapp.com",
            databaseURL: "https://pasyak-user-default-rtdb.firebaseio.com",
            projectId: "pasyak-user",
            storageBucket: "pasyak-user.firebasestorage.app",
            messagingSenderId: "898141218588",
            appId: "1:898141218588:web:f3477f39d96bceb2727cd9"
        };

        const tickConfig = {
            apiKey: "AIzaSyA2RNLGS-qUkhq6zNGtoUMTXJ3jNTfuHoE",
            databaseURL: "https://pasyak-tick-default-rtdb.firebaseio.com"
        };

        const premiumConfig = {
            apiKey: "AIzaSyByZEbmw0w1Q5U1LfOrFsjCpd9CXzwyHyc",
            databaseURL: "https://pasyak-premium-default-rtdb.firebaseio.com"
        };
    
        const userApp = firebase.initializeApp(userConfig, "userApp");
        const tickApp = firebase.initializeApp(tickConfig, "tickApp");
        const premiumApp = firebase.initializeApp(premiumConfig, "premiumApp");

        const userDb = userApp.database();
        const tickDb = tickApp.database();
        const premiumDb = premiumApp.database();

        let allUsers = [];
        let tickUsers = {};
        let premiumUsers = {};
        let initialLoadComplete = false;

        function getStatusBadgeUrl(nickname) {
            const isTick = tickUsers[nickname] === "+";
            const isPremium = premiumUsers[nickname] === "+";

            if (isTick && isPremium) {
                return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium-tick_ne5yjz.png";
            } else if (isTick) {
                return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/tik_tiozjv.png";
            } else if (isPremium) {
                return "https://res.cloudinary.com/dhski1gkx/image/upload/v1754247890/premium_aomgkl.png";
            }
            return null;
        }

        function renderUser(name, nick, img) {
            const userDiv = document.createElement('div');
            userDiv.className = 'user';
            userDiv.onclick = () => {
                window.location.href = `?other=${nick}`;
            };
        
            const statusBadgeUrl = getStatusBadgeUrl(nick);
            const statusBadgeHtml = statusBadgeUrl ? `<img class="status-badge" src="${statusBadgeUrl}" alt="Status" />` : '';

            userDiv.innerHTML = `
                <img class="profile-pic" src="${img.trim()}" alt="${nick}">
                <div class="user-info">
                    <div class="username">${name} ${statusBadgeHtml}</div>
                    <div>@${nick}</div>
                </div>
            `;
            document.getElementById('userList').appendChild(userDiv);
        }

        function showLoading(state) {
            document.getElementById('loadingSpinner').style.display = state ? 'flex' : 'none';
        }

        function showUserList(state) {
            document.getElementById('userList').style.display = state ? 'block' : 'none';
        }

        function clearUserList() {
            document.getElementById('userList').innerHTML = '';
        }

        function displayFilteredUsers(keyword) {
            const filtered = allUsers.filter(user =>
                user.nick.toLowerCase().includes(keyword.toLowerCase()) ||
                user.name.toLowerCase().includes(keyword.toLowerCase())
            );

            clearUserList();
            filtered.forEach(user => {
                renderUser(user.name, user.nick, user.img);
            });
        }

        async function loadInitialData() {
            showLoading(true);

            const usersPromise = new Promise(resolve => {
                userDb.ref("Users").once("value", snapshot => {
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
                    resolve();
                });
            });

            const tickPromise = new Promise(resolve => {
                tickDb.ref("tick").once("value", snapshot => {
                    tickUsers = snapshot.val() || {};
                    resolve();
                });
            });

            const premiumPromise = new Promise(resolve => {
                premiumDb.ref("premium").once("value", snapshot => {
                    premiumUsers = snapshot.val() || {};
                    resolve();
                });
            });

            await Promise.all([usersPromise, tickPromise, premiumPromise]);
            initialLoadComplete = true;

            showLoading(false);
            showUserList(true);
            displayFilteredUsers(document.getElementById("searchInput").value);
        
            // İlk yükləmədən sonra real-time dinləyiciləri qoş
            userDb.ref("Users").on("value", (snapshot) => updateUsersAndRender(snapshot, 'users'));
            tickDb.ref("tick").on("value", (snapshot) => updateUsersAndRender(snapshot, 'tick'));
            premiumDb.ref("premium").on("value", (snapshot) => updateUsersAndRender(snapshot, 'premium'));
        }
    
        function updateUsersAndRender(snapshot, source) {
            if (!initialLoadComplete) return;

            const data = snapshot.val();

            if (source === 'users') {
                allUsers = [];
                for (let key in data) {
                    try {
                        const [name, nick, img] = JSON.parse(data[key]);
                        allUsers.push({ name, nick, img });
                    } catch (e) {
                        console.error("İstifadəçi oxunmadı:", key);
                    }
                }
            } else if (source === 'tick') {
                tickUsers = data || {};
            } else if (source === 'premium') {
                premiumUsers = data || {};
            }
        
            displayFilteredUsers(document.getElementById("searchInput").value);
        }
    
        document.getElementById("searchInput").addEventListener("input", e => {
            const value = e.target.value;
            displayFilteredUsers(value);
        });

        document.addEventListener('DOMContentLoaded', loadInitialData);
