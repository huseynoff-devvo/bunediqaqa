const urlParams = new URLSearchParams(window.location.search);
        const currentUser = urlParams.get('user');

        const followConfig = {
            apiKey: "AIzaSyAHuOrVvJwNk3LG9tqvSA5sdOn7zCs9QAc",
            authDomain: "limon-following.firebaseapp.com",
            databaseURL: "https://limon-following-default-rtdb.firebaseio.com",
            projectId: "limon-following",
            storageBucket: "limon-following.firebasestorage.app",
            messagingSenderId: "128241854550",
            appId: "1:128241854550:web:868457b4e76ff7cefb73f7",
            measurementId: "G-70DTD9NGBF"
        };

        const userConfig = {
            apiKey: "AIzaSyA6slU31pyfp7tljAB20Vui1gvptSPEv8M",
            authDomain: "limons-user-e43c0.firebaseapp.com",
            databaseURL: "https://limons-user-e43c0-default-rtdb.firebaseio.com",
            projectId: "limons-user-e43c0",
            storageBucket: "limons-user-e43c0.firebasestorage.app",
            messagingSenderId: "484283046830",
            appId: "1:484283046830:web:ad76e2d421b68f22fd063f"
        };
        
        const tickConfig = {
            apiKey: "AIzaSyAoYfYv4C22xKKlLQZHSty9YTV6el8QzZw",
  authDomain: "limons-tick.firebaseapp.com",
  databaseURL: "https://limons-tick-default-rtdb.firebaseio.com",
  projectId: "limons-tick",
  storageBucket: "limons-tick.firebasestorage.app",
  messagingSenderId: "803200776941",
  appId: "1:803200776941:web:92acaa749ee25eeeab2ae4",
  measurementId: "G-7HCR9FS6Q4"
        };

        const premiumConfig = {
          apiKey: "AIzaSyCiOg6YwhtoBNGO3TboCyq0dusXjPLkW5A",
  authDomain: "limons-premium.firebaseapp.com",
  databaseURL: "https://limons-premium-default-rtdb.firebaseio.com",
  projectId: "limons-premium",
  storageBucket: "limons-premium.firebasestorage.app",
  messagingSenderId: "9549849500",
  appId: "1:9549849500:web:936589028b99dfcdbede59",
  measurementId: "G-XTDYV0RHBJ"
        };

        const followApp = firebase.initializeApp(followConfig, "followApp");
        const userApp = firebase.initializeApp(userConfig, "userApp");
        const tickApp = firebase.initializeApp(tickConfig, "tickApp");
        const premiumApp = firebase.initializeApp(premiumConfig, "premiumApp");

        const followDb = followApp.database();
        const userDb = userApp.database();
        const tickDb = tickApp.database();
        const premiumDb = premiumApp.database();

        let tickUsers = {};
        let premiumUsers = {};

        function getStatusBadgeUrl(nickname) {
            const isTick = tickUsers[nickname] === "+";
            const isPremium = premiumUsers[nickname] === "+";

            if (isTick && isPremium) {
                return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314187/premium-tick_lls2xj.png";
            } else if (isTick) {
                return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314188/tick_bpkpy1.png";
            } else if (isPremium) {
                return "https://res.cloudinary.com/dxymbsg0p/image/upload/v1757314187/premium_rtcvax.png";
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
                    <div class="username">${name}${statusBadgeHtml}</div>
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

        async function loadFollowings() {
            if (!currentUser) {
                showLoading(false);
                showUserList(true);
                return;
            }

            showLoading(true);

            // Bütün lazımi məlumatları paralel yükləmək üçün Promise.all istifadə edirəm
            const [followSnap, tickSnap, premiumSnap] = await Promise.all([
                followDb.ref(currentUser).once('value'),
                tickDb.ref("tick").once('value'),
                premiumDb.ref("premium").once('value')
            ]);
            
            tickUsers = tickSnap.val() || {};
            premiumUsers = premiumSnap.val() || {};
            const followData = followSnap.val();

            if (!followData) {
                showLoading(false);
                showUserList(true);
                return;
            }

            const usernames = Object.keys(followData).filter(username => {
                const value = (followData[username] + '').replaceAll('"', '');
                return value === '+';
            });
            
            if (usernames.length === 0) {
                showLoading(false);
                showUserList(true);
                return;
            }

            const userPromises = usernames.map(username => {
                const cleanUsername = username.replace('@', ''); // `@` nişanəsini təmizləyir
                return userDb.ref("Users/" + cleanUsername).once('value');
            });

            const userSnaps = await Promise.all(userPromises);
            
            clearUserList();
            userSnaps.forEach(userSnap => {
                try {
                    const val = userSnap.val();
                    if (val) {
                        const [name, nick, img] = JSON.parse(val);
                        renderUser(name, nick, img);
                    }
                } catch (e) {
                    console.error("Profil oxunmadı:", userSnap.ref.key, e);
                }
            });

            showLoading(false);
            showUserList(true);
        }

        loadFollowings();
