(function () {
            // Firebase konfiqurasiyaları
            const reelFirebaseConfig = {
                apiKey: "AIzaSyC6yWCYGtOkJoTOfZRoO8HGo-L_NKR9p5k",
                authDomain: "pasyak-reels.firebaseapp.com",
                projectId: "pasyak-reels",
                storageBucket: "pasyak-reels.firebasestorage.app",
                messagingSenderId: "635054499590",
                appId: "1:635054499590:web:7b1e9bc84f4b752317e087",
                measurementId: "G-FW0KJDLF4B"
            };
            const reelApp = firebase.initializeApp(reelFirebaseConfig, 'reelApp');
            const reelDb = reelApp.database();

            const userFirebaseConfig = {
                apiKey: "AIzaSyBHRY6yGGT9qHV8df1OJXtmbQ7QxWu69ps",
                authDomain: "pasyak-user.firebaseapp.com",
                databaseURL: "https://pasyak-user-default-rtdb.firebaseio.com",
                projectId: "pasyak-user",
                storageBucket: "pasyak-user.firebasestorage.app",
                messagingSenderId: "898141218588",
                appId: "1:898141218588:web:f3477f39d96bceb2727cd9"
            };
            const userApp = firebase.initializeApp(userFirebaseConfig, 'userApp');
            const userDb = userApp.database();

            const followsFirebaseConfig = {
                apiKey: "AIzaSyAZbtUw8id4yyXqrXtsf2FwuZmJ02qxit8",
                authDomain: "pasyak-follows.firebaseapp.com",
                databaseURL: "https://pasyak-follows-default-rtdb.firebaseio.com",
                projectId: "pasyak-follows",
                storageBucket: "pasyak-follows.firebasestorage.app",
                messagingSenderId: "571115478758",
                appId: "1:571115478758:web:9b45de3c9169083d9a2527",
                measurementId: "G-KHDDTM6FC9"
            };
            const followsApp = firebase.initializeApp(followsFirebaseConfig, 'followsApp');
            const followsDb = followsApp.database();

            const followingFirebaseConfig = {
                apiKey: "AIzaSyBA0gfZVLCnGV2Hli6BjEbq08SmLzFkshg",
                authDomain: "pasyak-following.firebaseapp.com",
                databaseURL: "https://pasyak-following-default-rtdb.firebaseio.com",
                projectId: "pasyak-following",
                storageBucket: "pasyak-following.firebasestorage.app",
                messagingSenderId: "538884111637",
                appId: "1:538884111637:web:c2c3532a1bda359aacbd1c"
            };
            const followingApp = firebase.initializeApp(followingFirebaseConfig, 'followingApp');
            const followingDb = followingApp.database();

            const commentsFirebaseConfig = {
                apiKey: "AIzaSyCqiOFuq6usZTZ4zsfd8LcCUdj1hP2j5cQ",
                authDomain: "reply-eb654.firebaseapp.com",
                databaseURL: "https://reply-eb654-default-rtdb.firebaseio.com",
                projectId: "reply-eb654",
                storageBucket: "reply-eb654.firebasestorage.app",
                messagingSenderId: "292801573334",
                appId: "1:292801573334:web:2486813d8fe45865d0f477"
            };
            const commentsApp = firebase.initializeApp(commentsFirebaseConfig, 'commentsApp');
            const commentsDb = commentsApp.database();

            const commentLikesFirebaseConfig = {
                apiKey: "AIzaSyB3Ckrcg-Bw4SAY-OyZiAV-qwiJgT8pmfg",
                authDomain: "comment-55fc9.firebaseapp.com",
                databaseURL: "https://comment-55fc9-default-rtdb.firebaseio.com",
                projectId: "comment-55fc9",
                storageBucket: "comment-55fc9.firebasestorage.app",
                messagingSenderId: "968182843800",
                appId: "1:968182843800:web:d37989387f333c9705c3ed",
                measurementId: "G-NL2QXBSQFK"
            };
            const commentLikesApp = firebase.initializeApp(commentLikesFirebaseConfig, 'commentLikesApp');
            const commentLikesDb = commentLikesApp.database();

            // GIF-lər üçün Firebase konfiqurasiyası
            const gifFirebaseConfig = {
                apiKey: "AIzaSyDmV0lnMcux9Q5t-Gy-Fh5Lp23kP2Yy5fE", // Replace with your GIF Firebase API Key
                authDomain: "gif-s-53e6d.firebaseapp.com",
                databaseURL: "https://gif-s-53e6d-default-rtdb.firebaseio.com",
                projectId: "gif-s-53e6d",
                storageBucket: "gif-s-53e6d.firebasestorage.app",
                messagingSenderId: "285576525417",
                appId: "1:285576525417:web:515028b392b379122cd4f8"
            };
            const gifApp = firebase.initializeApp(gifFirebaseConfig, 'gifApp');
            const gifDb = gifApp.database();


            // DOM elementləri
            const app = document.getElementById('app');
            const mySnapsGrid = document.getElementById('my-snaps-grid');
            const mySnapsLoader = document.getElementById('my-snaps-loader');
            const noSnapsMessage = document.getElementById('no-snaps-message');
            const loader = document.getElementById('loader');
            const soundIndicator = document.getElementById('sound-indicator');
            const soundIcon = soundIndicator.querySelector('span');
            const commentsContainer = document.getElementById('comments-container');
            const closeCommentsBtn = document.querySelector('.close-comments');
            const commentsList = document.querySelector('.comments-list-content');
            const commentInput = document.querySelector('.comment-input');
            const sendCommentBtn = document.querySelector('.send-comment-btn');
            const commentsLoader = document.getElementById('comments-loader');
            const deleteDialogOverlay = document.getElementById('delete-dialog-overlay');
            const confirmDeleteBtn = document.getElementById('confirm-delete');
            const cancelDeleteBtn = document.getElementById('cancel-delete');
            const snapsNav = document.getElementById('snaps-nav');
            const friendsNav = document.getElementById('friends-nav');
            const mySnapsNav = document.getElementById('my-snaps-nav');
            const gifButton = document.getElementById('gif-button'); // GIF düyməsi
            const gifListContainer = document.getElementById('gif-list-container'); // GIF siyahısı konteyneri
            const gifCarousel = document.getElementById('gif-carousel'); // GIF karuseli
            const closeGifListBtn = document.querySelector('.close-gif-list'); // GIF siyahısını bağlama düyməsi

            // Yeni əlavə olunan snap silmə dialogu elementləri
            const deleteSnapDialogOverlay = document.getElementById('delete-snap-dialog-overlay');
            const confirmDeleteSnapBtn = document.getElementById('confirm-delete-snap');
            const cancelDeleteSnapBtn = document.getElementById('cancel-delete-snap');


            // URL parametrləri
            const userFromUrl = window.location.search.match(/user=([^&]+)/)?.[1];
            const currentUser = userFromUrl || "anonim";
            const cleanCurrentUser = currentUser.startsWith('@') ? currentUser.substring(1) : currentUser;

            // Cari istifadəçinin tam adı və profil şəkli
            let currentUserName = cleanCurrentUser;
            let currentUserProfilePic = 'https://via.placeholder.com/48';

            // Qlobal dəyişənlər
            let allReels = [];
            let currentReels = [];
            let activeIndex = 0;
            let isAnimating = false;
            let allVideosSoundOn = true;
            let indicatorTimeout = null;
            let touchStartY = null;
            let activePostId = null; // Aktiv postun ID-si (şərhlər üçün)
            let activeCommentId = null;
            let replyingToCommentAuthor = null; // Cavab verilən şərhin müəllifi
            let commentAddedListenerAttached = false;
            let longPressTimer = null;
            let itemToDelete = null; // Şərh silmə üçün istifadə olunur
            let snapToDelete = null; // Snap silmə üçün istifadə olunur
            let allGifs = {}; // GIF-ləri saxlamaq üçün obyekt

            // Firebase çağırışlarının qarşısını almaq üçün keşlər
            const userProfileCache = {};
            const userNameCache = {};
            const userFollowStatusCache = {};
            
            // Video preloading üçün diapazon
            const PRELOAD_RANGE = 2; // Aktiv videodan əvvəl və sonra yüklənəcək videoların sayı

            /**
             * İstifadəçi profil şəklini Firebase-dən gətirir. Nəticəni keşləyir.
             * @param {string} username - Profil şəklinin gətiriləcəyi istifadəçi adı.
             * @returns {Promise<string>} - Profil şəklinin URL-i və ya yer tutucu.
             */
            async function fetchUserProfile(username) {
                const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
                if (userProfileCache[cleanUsername]) {
                    return userProfileCache[cleanUsername];
                }
                try {
                    const snapshot = await userDb.ref(`Users/${cleanUsername}`).once('value');
                    const profileData = snapshot.val();
                    if (profileData) {
                        const parsedData = JSON.parse(profileData);
                        const profilePicUrl = parsedData[2].trim();
                        userProfileCache[cleanUsername] = profilePicUrl;
                        return profilePicUrl;
                    }
                } catch (e) {
                    console.error(`Error fetching profile for user ${cleanUsername}:`, e);
                }
                return 'https://via.placeholder.com/48';
            }

            /**
             * İstifadəçinin tam adını Firebase-dən gətirir. Nəticəni keşləyir.
             * @param {string} username - Adı gətiriləcək istifadəçi adı.
             * @returns {Promise<string>} - İstifadəçinin tam adı və ya təmizlənmiş istifadəçi adı.
             */
            async function fetchUserName(username) {
                const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
                if (userNameCache[cleanUsername]) {
                    return userNameCache[cleanUsername];
                }
                try {
                    const snapshot = await userDb.ref(`Users/${cleanUsername}`).once('value');
                    const profileData = snapshot.val();
                    if (profileData) {
                        const parsedData = JSON.parse(profileData);
                        const name = parsedData[0];
                        userNameCache[cleanUsername] = name;
                        return name;
                    }
                } catch (e) {
                    console.error(`Error fetching name for user ${cleanUsername}:`, e);
                }
                return cleanUsername;
            }

            /**
             * Cari istifadəçinin başqa bir istifadəçini izləyib-izləmədiyini yoxlayır.
             * Nəticəni performans üçün keşləyir.
             * @param {string} reelUserNickname - İzləmə statusunu yoxlamaq üçün istifadəçi ləqəbi.
             * @returns {Promise<boolean>} - İzləyirsə true, əks halda false.
             */
            async function isFollowing(reelUserNickname) {
                const cleanReelUserNickname = reelUserNickname.startsWith('@') ? reelUserNickname.substring(1) : reelUserNickname;
                const cleanCurrentUser = currentUser.startsWith('@') ? currentUser.substring(1) : currentUser;

                if (cleanReelUserNickname === cleanCurrentUser) {
                    return true;
                }
                if (userFollowStatusCache[cleanReelUserNickname] !== undefined) {
                    return userFollowStatusCache[cleanReelUserNickname];
                }
                try {
                    let snapshot = await followingDb.ref(cleanCurrentUser).child(cleanReelUserNickname).once('value');

                    if (!snapshot.exists()) {
                        snapshot = await followingDb.ref(cleanCurrentUser).child(`@${cleanReelUserNickname}`).once('value');
                    }

                    const isFollowed = snapshot.exists();
                    userFollowStatusCache[cleanReelUserNickname] = isFollowed;
                    return isFollowed;
                } catch (e) {
                    console.error("Error checking follow status:", e);
                    return false;
                }
            }

            /**
             * Bir massivi təsadüfi olaraq qarışdırır.
             * @param {Array} array - Qarışdırılacaq massiv.
             * @returns {Array} - Qarışdırılmış massiv.
             */
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            // Reel bəyənmələri üçün real-time dinləyici (bəyənmə sayını və ikonu yeniləyir)
            reelDb.ref('likes').on('value', (snapshot) => {
                const likesData = snapshot.val() || {};
                currentReels.forEach(reel => {
                    const postLikes = likesData[reel.postId] || {};
                    const likedByUser = postLikes.users && postLikes.users[currentUser];

                    if (likedByUser) {
                        reel.likeIcon.classList.add('liked');
                    } else {
                        reel.likeIcon.classList.remove('liked');
                    }

                    const likeCount = postLikes.count || 0;
                    reel.likeCount.textContent = likeCount; // Düzəliş edildi: `count` yerinə `likeCount`
                });
            });

            // GIF-lər üçün dinləyici
            gifDb.ref("gif").on("value", (snapshot) => {
                allGifs = snapshot.val() || {};
                // GIF list-i render etməyə ehtiyac yoxdur, çünki bu, hər toggleGifList çağırışında edilir.
            });

            /**
             * Əsas tətbiqi işə salır. Reel məlumatlarını, istifadəçi profillərini gətirir
             * və makaraları göstərir.
             */
            async function initializeApp() {
                loader.style.display = 'flex'; // Məlumatlar yüklənərkən loaderi göstərin

                // `Promise.all` istifadə edərək profil məlumatlarını paralel olaraq yükləyin
                const [fetchedUserName, fetchedProfilePic] = await Promise.all([ // postsDataSnapshot çıxarıldı
                    fetchUserName(cleanCurrentUser),
                    fetchUserProfile(cleanCurrentUser)
                ]);

                currentUserName = fetchedUserName;
                currentUserProfilePic = fetchedProfilePic;

                // Reel məlumatları üçün real-time dinləyici əlavə edildi
                reelDb.ref('reels').on('value', async (snapshot) => {
                    const postsData = snapshot.val() || {};
                    allReels = Object.keys(postsData).map(key => {
                        let post = JSON.parse(postsData[key]);
                        return { id: key, ...post };
                    });

                    // Aktiv tabı tapın və yenidən render edin
                    const currentActiveTabElement = document.querySelector('.tabs-container .tab-button.active');
                    const currentActiveTab = currentActiveTabElement ? currentActiveTabElement.id.replace('-nav', '') : 'snaps';
                    
                    // loader-i burada göstərin, çünki yeniləmə uzun çəkə bilər
                    loader.style.display = 'flex'; 
                    await displayReels(currentActiveTab);
                    loader.style.display = 'none'; // Yeniləmə bitdikdə gizlədin
                });
                
                // İlk yükləmə zamanı loaderi gizlətmək Firebase dinləyicisinin içərisinə köçürüldü
            }

            initializeApp(); // Tətbiqi başladın

            async function displayReels(mode, postIdToOpen = null) {
                if (isAnimating) return;
                isAnimating = true;

                loader.style.display = 'flex'; // Reel rejimi dəyişərkən loaderi göstərin

                // Bütün əsas tətbiq görünüşlərini gizləyin
                app.style.display = 'none';
                mySnapsGrid.style.display = 'none';

                if (currentReels[activeIndex] && currentReels[activeIndex].video) {
                    currentReels[activeIndex].video.pause();
                }

                // Bütün tətbiq görünüşlərinin məzmununu təmizləyin
                while (app.firstChild) {
                    app.removeChild(app.firstChild);
                }
                // My-snaps qridinin məzmununu təmizləyin, lakin yükləyici və mesajı saxlayın
                const mySnapsItems = mySnapsGrid.querySelectorAll('.my-snap-item');
                mySnapsItems.forEach(item => item.remove());

                mySnapsLoader.style.display = 'none';
                noSnapsMessage.style.display = 'none';

                currentReels = [];
                activeIndex = 0;

                let postsToDisplay = [];
                // Reel məlumatları real-time dinləyici tərəfindən `allReels` qlobal dəyişəninə yüklənir
                const likesData = await reelDb.ref('likes').once('value').then(snap => snap.val() || {});

                if (mode === 'snaps') {
                    app.style.display = 'block';
                    postsToDisplay = shuffleArray([...allReels]); // allReels-in bir kopyasını istifadə edin
                } else if (mode === 'friends') {
                    app.style.display = 'block';
                    const followingSnapshot = await followingDb.ref(cleanCurrentUser).once('value');
                    const followingUsers = Object.keys(followingSnapshot.val() || {});
                    postsToDisplay = allReels.filter(post => {
                        const cleanNickname = post.nickname.startsWith('@') ? post.nickname.substring(1) : post.nickname;
                        return followingUsers.includes(cleanNickname) || followingUsers.includes(`@${cleanNickname}`);
                    });
                    postsToDisplay = shuffleArray(postsToDisplay);
                } else if (mode === 'my-snaps') {
                    // Cari istifadəçi üçün postları filterləyin
                    postsToDisplay = allReels.filter(post => {
                        const cleanNickname = post.nickname.startsWith('@') ? post.nickname.substring(1) : post.nickname;
                        return cleanNickname === cleanCurrentUser;
                    });

                    if (postIdToOpen) {
                        // Müəyyən bir snapı reel görünüşündə açın
                        app.style.display = 'block';
                        const postToOpen = postsToDisplay.find(p => p.id === postIdToOpen);
                        if (postToOpen) { // Post tapıldıqda əlavə et
                            postsToDisplay = [postToOpen];
                        } else { // Post tapılmazsa boş array et
                            postsToDisplay = []; 
                        }
                    } else {
                        // Qrid görünüşünü göstərin
                        mySnapsGrid.style.display = 'grid';
                        mySnapsGrid.classList.add('active');
                        app.classList.remove('active');

                        if (postsToDisplay.length === 0) {
                            mySnapsLoader.style.display = 'none';
                            noSnapsMessage.style.display = 'block';
                        } else {
                            mySnapsLoader.style.display = 'block';
                            noSnapsMessage.style.display = 'none';

                            // Postları dövrə vurun və qrid elementləri yaradın
                            postsToDisplay.forEach(post => {
                                const snapItem = createMySnapItem(post);
                                mySnapsGrid.appendChild(snapItem);
                            });
                            mySnapsLoader.style.display = 'none';
                        }
                    }
                }

                if (mode === 'snaps' || mode === 'friends' || postIdToOpen) {
                    const loadedReels = [];
                    // Bütün profil şəkillərini və izləmə statuslarını paralel olaraq gətirin
                    const profileAndFollowPromises = postsToDisplay.map(async post => {
                        const [profilePicUrl, isFollowed] = await Promise.all([
                            fetchUserProfile(post.nickname),
                            isFollowing(post.nickname)
                        ]);
                        return { id: post.id, isFollowed, isLiked: likesData[post.id] && likesData[post.id].users && likesData[post.id].users[currentUser], profile: profilePicUrl, ...post };
                    });
                    const resolvedPosts = await Promise.all(profileAndFollowPromises);
                    loadedReels.push(...resolvedPosts);

                    loadedReels.forEach(post => {
                        const newReel = createReel(post);
                        app.appendChild(newReel.element);
                        currentReels.push(newReel);

                        reelDb.ref(`likes/${post.id}/count`).once('value').then(likeSnap => {
                            const count = likeSnap.val() || 0;
                            newReel.likeCount.textContent = count;
                        });

                        commentsDb.ref(`comments/${post.id}`).on('value', async (snap) => {
                            let totalComments = 0;
                            const commentsData = snap.val();
                            if (commentsData) {
                                for (const commentId in commentsData) {
                                    totalComments++;
                                    if (commentsData[commentId].replies) {
                                        totalComments += Object.keys(commentsData[commentId].replies).length;
                                    }
                                }
                            }
                            newReel.commentCountElement.textContent = totalComments;
                        });
                    });

                    if (currentReels.length > 0) {
                        activeIndex = 0;
                        const activeReel = currentReels[activeIndex];
                        activeReel.element.classList.add('active');
                        activeReel.element.style.transform = 'translateY(0)';
                        activeReel.element.style.opacity = '1';
                        // Aktiv videonu və ətrafdakı videoları ön yükləyin və oynadın
                        preloadAndPlayVideosInRange(activeIndex);
                    }

                }

                isAnimating = false;
                loader.style.display = 'none'; // Reel məzmunu yükləndikdən sonra loaderi gizlədin
            }

            // Naviqasiya düymələrinin hadisə dinləyiciləri
            snapsNav.addEventListener('click', () => {
                snapsNav.classList.add('active');
                friendsNav.classList.remove('active');
                mySnapsNav.classList.remove('active');
                displayReels('snaps');
            });

            friendsNav.addEventListener('click', () => {
                friendsNav.classList.add('active');
                snapsNav.classList.remove('active');
                mySnapsNav.classList.remove('active');
                displayReels('friends');
            });

            mySnapsNav.addEventListener('click', () => {
                mySnapsNav.classList.add('active');
                snapsNav.classList.remove('active');
                friendsNav.classList.remove('active');
                displayReels('my-snaps');
            });

            // İzləmə düyməsinin görünürlüyü üçün real-time yeniləmə
            followingDb.ref(cleanCurrentUser).on('value', async (snapshot) => {
                const followingData = snapshot.val() || {};
                const followingUsers = Object.keys(followingData);

                for (const user in userFollowStatusCache) {
                    userFollowStatusCache[user] = followingUsers.includes(user);
                }

                currentReels.forEach(reel => {
                    const cleanNickname = reel.userNickname.startsWith('@') ? reel.userNickname.substring(1) : reel.userNickname;
                    const followButton = reel.followButton;
                    if (followButton) {
                        const cleanPostNickname = reel.userNickname.startsWith('@') ? reel.userNickname.substring(1) : reel.userNickname;
                        if (cleanPostNickname === cleanCurrentUser || followingUsers.includes(cleanNickname) || followingUsers.includes(`@${cleanNickname}`)) {
                            followButton.style.display = 'none';
                        } else {
                            followButton.style.display = 'block';
                        }
                    }
                });
            });

            // My-snap qrid elementi yaratmaq üçün funksiya
            function createMySnapItem(post) {
                const item = document.createElement('div');
                item.className = 'my-snap-item';
                if (post.type && post.type.toLowerCase() === 'post') {
                    item.classList.add('post');
                }

                let mediaElement;
                if (post.video) {
                    mediaElement = document.createElement('video');
                    mediaElement.src = post.video;
                    mediaElement.loop = true;
                    mediaElement.muted = true;
                    mediaElement.playsInline = true;
                    mediaElement.autoplay = true;
                    mediaElement.preload = 'none'; // Videoları yükləmə
                } else if (post.image) {
                    mediaElement = document.createElement('img');
                    mediaElement.src = post.image;
                }

                if (mediaElement) {
                    item.appendChild(mediaElement);
                }

                const overlay = document.createElement('div');
                overlay.className = 'my-snap-overlay';

                const typeLabel = document.createElement('div');
                typeLabel.className = 'my-snap-type';
                typeLabel.textContent = post.type || 'SNAP';
                item.appendChild(typeLabel);

                const text = document.createElement('div');
                text.className = 'my-snap-text';
                text.textContent = post.text;
                overlay.appendChild(text);

                const info = document.createElement('div');
                info.className = 'my-snap-info';

                // Firebase-dən bəyənmə və şərh sayını alın
                const likes = document.createElement('div');
                likes.className = 'icon-text';
                likes.innerHTML = `<span class="material-icons" style="color:#ff4d4d;">favorite</span><span>0</span>`;
                info.appendChild(likes);

                reelDb.ref(`likes/${post.id}/count`).on('value', (snapshot) => {
                    const count = snapshot.val() || 0;
                    likes.querySelector('span:last-child').textContent = count;
                });

                const comments = document.createElement('div');
                comments.className = 'icon-text';
                comments.innerHTML = `<span class="material-icons">comment</span><span>0</span>`;
                info.appendChild(comments);

                commentsDb.ref(`comments/${post.id}`).on('value', (snapshot) => {
                    let totalComments = 0;
                    const commentsData = snapshot.val();
                    if (commentsData) {
                        for (const commentId in commentsData) {
                            totalComments++;
                            if (commentsData[commentId].replies) {
                                totalComments += Object.keys(commentsData[commentId].replies).length;
                            }
                        }
                    }
                    comments.querySelector('span:last-child').textContent = totalComments;
                });

                overlay.appendChild(info);
                item.appendChild(overlay);

                // Silmə düyməsi
                const deleteButton = document.createElement('button');
                deleteButton.className = 'material-icons delete-snap-button';
                deleteButton.textContent = 'delete';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Parent click hadisəsini dayandırın
                    showDeleteSnapDialog(post.id);
                });
                item.appendChild(deleteButton);


                item.addEventListener('click', () => {
                    displayReels('my-snaps', post.id);
                });

                return item;
            }

            /**
             * Səs göstəricisini göstərir (səs açıq/qapalı ikonu).
             * @param {boolean} muted - Səs kəsilibsə true, əks halda false.
             */
            function showSoundIndicator(muted) {
                clearTimeout(indicatorTimeout);
                soundIcon.textContent = muted ? 'volume_off' : 'volume_up';
                soundIndicator.classList.add('show');
                indicatorTimeout = setTimeout(() => {
                    soundIndicator.classList.remove('show');
                }, 1000);
            }

            /**
             * Video elementini hazırlayır (src təyin edir, yükləyir).
             * @param {object} reel - Reel obyekti (video elementi ilə birlikdə).
             * @param {boolean} shouldPlay - Video yüklənəndən sonra avtomatik oynatılmalıdırmı.
             * @param {boolean} isCurrentlyActive - Hazırda aktiv olan videodurmu.
             */
            function prepareVideo(reel, shouldPlay, isCurrentlyActive) {
                if (!reel || !reel.video || !reel.postVideoUrl) return;

                if (!reel.video.src || reel.video.src !== reel.postVideoUrl) {
                    reel.video.src = reel.postVideoUrl;
                    reel.video.load();
                }

                // Yükləmə prosesini göstərmək üçün loader-i idarə edin
                if (reel.video.readyState < 2) { // HAVE_CURRENT_DATA
                    reel.video.style.display = 'none';
                    if (reel.loader) reel.loader.style.display = 'block';
                } else {
                    reel.video.style.display = 'block';
                    if (reel.loader) reel.loader.style.display = 'none';
                }

                // loadeddata hadisəsi yalnız bir dəfə əlavə edilsin
                const onLoadedData = () => {
                    reel.video.style.display = 'block';
                    if (reel.loader) reel.loader.style.display = 'none';
                    if (shouldPlay) {
                        reel.video.muted = !allVideosSoundOn;
                        reel.video.play().catch(e => {
                            console.error("Video avtomatik başlamadı, səbəb: ", e);
                            if (e.name === 'NotAllowedError') {
                                reel.video.muted = true;
                                reel.video.play().then(() => showSoundIndicator(true));
                            }
                        });
                    }
                    reel.video.removeEventListener('loadeddata', onLoadedData); // Dinləyiciyi silin
                };

                // Əgər video hələ yüklənməyibsə, loadeddata dinləyicisi əlavə edin
                if (reel.video.readyState < 2 && isCurrentlyActive) {
                    reel.video.addEventListener('loadeddata', onLoadedData);
                } else if (isCurrentlyActive && shouldPlay) {
                    // Əgər video artıq yüklənibsə və aktivdirsə, dərhal oynatın
                    onLoadedData();
                }

                // Aktiv olmayan preloaded videolar üçün səsi bağlayın
                if (!shouldPlay && reel.video.muted === false) {
                    reel.video.muted = true;
                }
            }


            /**
             * Aktiv makaranı və ətrafdakı videoları ön yükləyir və oynadır.
             * @param {number} activeIndex - Hal-hazırda aktiv olan makaranın indeksi.
             */
            function preloadAndPlayVideosInRange(activeIndex) {
                // Aktiv videonu oynatın
                prepareVideo(currentReels[activeIndex], true, true);

                // Aktiv videodan sonrakı videoları ön yükləyin
                for (let i = 1; i <= PRELOAD_RANGE; i++) {
                    const preloadIndex = activeIndex + i;
                    if (preloadIndex < currentReels.length) {
                        prepareVideo(currentReels[preloadIndex], false, false);
                    }
                }

                // Aktiv videodan əvvəlki videoları ön yükləyin
                for (let i = 1; i <= PRELOAD_RANGE; i++) {
                    const preloadIndex = activeIndex - i;
                    if (preloadIndex >= 0) {
                        prepareVideo(currentReels[preloadIndex], false, false);
                    }
                }
            }

            /**
             * Aktiv olmayan videoları dayandırır və oynatma mövqeyini sıfırlayır,
             * həmçinin preload diapazonundan kənarda olan videoların src-ni silir.
             * @param {number} activeIndex - Hal-hazırda aktiv olan makaranın indeksi.
             */
            function pauseInactiveVideos(activeIndex) {
                currentReels.forEach((r, i) => {
                    const isWithinPreloadRange = i >= (activeIndex - PRELOAD_RANGE) && i <= (activeIndex + PRELOAD_RANGE);

                    if (r.video) {
                        if (i !== activeIndex && !isWithinPreloadRange) {
                            // Preload diapazonundan kənarda olanlar
                            r.video.pause();
                            r.video.currentTime = 0;
                            r.video.muted = true;
                            r.video.removeAttribute('src');
                            r.video.load(); // Videonu sıfırlayın
                            if (r.loader) r.loader.style.display = 'none'; // Loader-i gizlədin
                        } else if (i !== activeIndex && isWithinPreloadRange) {
                            // Preload diapazonunda olanlar, lakin aktiv deyil
                            r.video.pause();
                            r.video.currentTime = 0; // Oynatma mövqeyini sıfırlayın ki, növbəti dəfə tez başlasın
                            r.video.muted = true;
                            if (r.loader) r.loader.style.display = 'none'; // Loader-i gizlədin
                        } else if (i === activeIndex) {
                            // Aktiv video, səsi tənzimləyin və loader-i gizlədin
                            r.video.muted = !allVideosSoundOn;
                            if (r.loader) r.loader.style.display = 'none';
                        }
                    }
                });
            }


            /**
             * Makaranı bəyənmək/bəyənməmək funksiyası. Firebase və UI-nı yeniləyir.
             * @param {string} postId - Postun (makaranın) ID-si.
             */
            function handleLikeClick(postId) {
                const likeUserRef = reelDb.ref(`likes/${postId}/users/${currentUser}`);
                const likeCountRef = reelDb.ref(`likes/${postId}/count`);

                likeUserRef.once('value').then(snap => {
                    if (snap.exists()) {
                        likeUserRef.remove();
                        likeCountRef.transaction(currentCount => (currentCount || 1) - 1);
                    } else {
                        likeUserRef.set(true);
                        likeCountRef.transaction(currentCount => (currentCount || 0) + 1);
                    }
                }).catch(e => {
                    console.error("Like əməliyyatı uğursuz oldu: ", e);
                });
            }

            /**
             * İstifadəçini izləmək/izləməmək funksiyası. Firebase və UI-nı yeniləyir.
             * @param {string} reelUserNickname - İzləniləcək/izlənməyəcək istifadəçi ləqəbi.
             */
            async function handleFollowClick(reelUserNickname) {
                const followerUsername = cleanCurrentUser;
                const followedUsername = reelUserNickname.startsWith('@') ? reelUserNickname.substring(1) : reelUserNickname;

                if (followerUsername === followedUsername) {
                    console.log("Kendi kendinizi takip edemezsiniz.");
                    return;
                }

                try {
                    const isFollowed = await isFollowing(followedUsername);
                    if (!isFollowed) {
                        const followsRef = followsDb.ref(followedUsername);
                        const followerRef = followsRef.child(followerUsername);
                        const followCountRef = followsRef.child('follow');

                        const followingRef = followingDb.ref(followerUsername);
                        const followedRef = followingRef.child(followedUsername);
                        const followingCountRef = followingRef.child('following');

                        await followerRef.set("+");
                        await followCountRef.transaction(currentCount => (parseInt(currentCount) || 0) + 1);

                        await followedRef.set("+");
                        await followingCountRef.transaction(currentCount => (parseInt(currentCount) || 0) + 1);

                        userFollowStatusCache[followedUsername] = true;

                        const followButton = document.querySelector(`.follow-button[data-nickname="${reelUserNickname}"]`);
                        if (followButton) followButton.style.display = 'none';

                        console.log(`User ${followerUsername} is now following ${followedUsername}.`);
                    } else {
                        console.log(`User ${followerUsername} is already following ${followedUsername}. No action needed.`);
                    }
                } catch (e) {
                    console.error("Follow operation failed:", e);
                }
            }

            /**
             * Video və overlay məzmunu ilə yeni bir reel elementi yaradır.
             * @param {object} post - Reel üçün post məlumatları.
             * @returns {object} - Reel elementi və digər əlaqəli DOM elementlərini ehtiva edən bir obyekt.
             */
            function createReel(post) {
                const reel = document.createElement('div');
                reel.className = 'reel';

                const loader = document.createElement('div');
                loader.className = 'reel-loader';
                reel.appendChild(loader);

                const video = document.createElement('video');
                // Video yüklənməsini təxirə salmaq üçün preload='none' istifadə edin
                video.preload = 'none';
                video.loop = true;
                video.playsInline = true;
                video.muted = !allVideosSoundOn;
                video.style.display = 'none'; // Başlanğıcda gizlədin

                video.addEventListener('click', () => {
                    allVideosSoundOn = !allVideosSoundOn;
                    currentReels.forEach(r => {
                        r.video.muted = !allVideosSoundOn;
                    });
                    showSoundIndicator(!allVideosSoundOn);
                });

                reel.appendChild(video);

                const overlay = document.createElement('div');
                overlay.className = 'overlay';

                const profileInfo = document.createElement('div');
                profileInfo.className = 'profile-info';

                const userInfo = document.createElement('div');
                userInfo.className = 'user-info';

                const profilePic = document.createElement('img');
                profilePic.className = 'profile-pic';
                profilePic.src = post.profile || 'https://via.placeholder.com/48';

                const userDetails = document.createElement('div');
                userDetails.className = 'user-details';
                const userid = document.createElement('div');
                userid.className = 'userid';
                userid.textContent = post.user;
                const nickname = document.createElement('div');
                nickname.className = 'nickname';
                nickname.textContent = post.nickname;

                userDetails.appendChild(userid);
                userDetails.appendChild(nickname);
                userInfo.appendChild(profilePic);
                userInfo.appendChild(userDetails);

                profileInfo.appendChild(userInfo);

                const followButton = document.createElement('button');
                followButton.className = 'follow-button';
                followButton.textContent = 'Takib Et';
                followButton.setAttribute('data-nickname', post.nickname);

                isFollowing(post.nickname).then(isFollowed => {
                    const cleanPostNickname = post.nickname.startsWith('@') ? post.nickname.substring(1) : post.nickname;
                    if (cleanPostNickname === cleanCurrentUser || isFollowed) {
                        followButton.style.display = 'none';
                    } else {
                        followButton.style.display = 'block';
                    }
                });

                followButton.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFollowClick(post.nickname);
                });

                profileInfo.appendChild(followButton);

                const text = document.createElement('div');
                text.className = 'text';

                const fullText = (post.text || '').replace(/#(\w+)/g, '<a href="#">#$1</a>');
                const shortText = fullText.split(' ').slice(0, 3).join(' ') + '...';

                text.innerHTML = shortText;
                let isExpanded = false;

                text.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (fullText.split(' ').length > 3) {
                        if (isExpanded) {
                            text.innerHTML = fullText;
                        } else {
                            text.innerHTML = shortText;
                        }
                        isExpanded = !isExpanded;
                    }
                });

                const time = document.createElement('div');
                time.className = 'time';
                time.textContent = post.time || '';

                const newInteractionSection = document.createElement('div');
                newInteractionSection.className = 'new-interaction-section';

                const likeSection = document.createElement('div');
                likeSection.className = 'interaction-item';
                const likeIcon = document.createElement('span');
                likeIcon.className = 'material-icons interaction-icon like-icon';
                likeIcon.textContent = 'favorite';

                if (post.isLiked) {
                    likeIcon.classList.add('liked');
                }

                const likeCount = document.createElement('span');
                likeCount.className = 'interaction-count';
                likeCount.textContent = post.likesCount || 0;

                likeSection.appendChild(likeIcon);
                likeSection.appendChild(likeCount);

                likeSection.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLikeClick(post.id);
                });

                const commentSection = document.createElement('div');
                commentSection.className = 'interaction-item';
                const commentIcon = document.createElement('span');
                commentIcon.className = 'material-icons interaction-icon';
                commentIcon.textContent = 'comment';

                commentIcon.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    openComments(post.id);
                });

                const commentCount = document.createElement('span');
                commentCount.className = 'interaction-count';
                commentCount.textContent = post.commentCount || 0;

                commentSection.appendChild(commentIcon);
                commentSection.appendChild(commentCount);

                newInteractionSection.appendChild(likeSection);
                newInteractionSection.appendChild(commentSection);

                overlay.appendChild(profileInfo);
                overlay.appendChild(text);
                overlay.appendChild(time);
                overlay.appendChild(newInteractionSection);

                reel.appendChild(overlay);

                // `postVideoUrl` əlavə edin ki, sonra videonun src-ni təyin edə bilək
                return { element: reel, video, likeIcon, likeCount, postId: post.id, userNickname: post.nickname, followButton: followButton, loader: loader, commentCountElement: commentCount, postVideoUrl: post.video };
            }

            /**
             * Təqdim olunan indeksə əsasən aktiv makaranı təyin edir, keçidləri idarə edir.
             * @param {number} newIndex - Aktiv olacaq makaranın indeksi.
             */
            function setActiveReel(newIndex) {
                if (isAnimating || newIndex === activeIndex || newIndex < 0 || newIndex >= currentReels.length) return;

                isAnimating = true;

                commentsContainer.classList.remove('open');
                if (window.location.search.includes('reply=true')) {
                    closeComments();
                }

                const currentReel = currentReels[activeIndex];
                const nextReel = currentReels[newIndex];

                pauseInactiveVideos(newIndex); // Aktiv olmayan videoları dayandırın və src-ni təmizləyin

                currentReel.element.style.transform = (newIndex > activeIndex) ? 'translateY(-100%)' : 'translateY(100%)';
                currentReel.element.style.opacity = '0';
                currentReel.element.style.zIndex = '1';
                currentReel.element.classList.remove('active');

                nextReel.element.style.transform = 'translateY(0)';
                nextReel.element.style.opacity = '1';
                nextReel.element.style.zIndex = '2';
                nextReel.element.classList.add('active');

                activeIndex = newIndex;

                setTimeout(() => {
                    isAnimating = false;
                    preloadAndPlayVideosInRange(activeIndex); // Yeni aktiv videonu və ətrafdakı videoları ön yükləyin və oynadın
                }, 500);
            }

            /**
             * İstiqamətə əsasən makaralar arasında sürüşməni idarə edir.
             * @param {string} direction - 'up' və ya 'down'.
             */
            function handleScroll(direction) {
                if (isAnimating || app.style.display === 'none') return;

                if (direction === 'down' && activeIndex < currentReels.length - 1) {
                    setActiveReel(activeIndex + 1);
                } else if (direction === 'up' && activeIndex > 0) {
                    setActiveReel(activeIndex - 1);
                }
            }

            let wheelTimeout = null;
            window.addEventListener('wheel', e => {
                if (!isAnimating) {
                    clearTimeout(wheelTimeout);
                    wheelTimeout = setTimeout(() => {
                        if (e.deltaY > 0) {
                            handleScroll('down');
                        } else if (e.deltaY < 0) {
                            handleScroll('up');
                        }
                    }, 80);
                }
            });

            // Mobil sürüşmə üçün toxunma hadisə dinləyiciləri
            app.addEventListener('touchstart', e => {
                if (!isAnimating && e.touches.length === 1) {
                    touchStartY = e.touches[0].clientY;
                }
            });

            app.addEventListener('touchend', e => {
                touchStartY = null;
            });

            app.addEventListener('touchmove', e => {
                if (!isAnimating && touchStartY !== null) {
                    const yDiff = touchStartY - e.touches[0].clientY;
                    if (Math.abs(yDiff) > 50) {
                        if (yDiff > 0) {
                            handleScroll('down');
                        } else if (yDiff < 0) {
                            handleScroll('up');
                        }
                    }
                }
            });

            /** Şərh modalını bağlayır və məzmununu təmizləyir. */
            function closeComments() {
                commentsContainer.classList.remove('open');
                commentsList.innerHTML = '';
                gifListContainer.style.display = 'none'; // GIF siyahısını da bağlayın

                const searchString = window.location.search;
                let userParam = null;
                if (searchString.includes('user=')) {
                    userParam = searchString.match(/user=([^&]+)/)?.[1];
                }

                let newUrl = window.location.pathname;
                if (userParam) {
                    newUrl += `?user=${userParam}`;
                }
                history.replaceState({}, '', newUrl);

                // Təkrarlanan hadisələrin qarşısını almaq üçün bütün əvvəlki dinləyiciləri silin
                if (activePostId) {
                    const commentsRef = commentsDb.ref(`comments/${activePostId}`);
                    commentsRef.off('child_added');
                    commentsRef.off('child_changed');
                    commentsRef.off('child_removed');
                }
                commentAddedListenerAttached = false;
            }

            closeCommentsBtn.addEventListener('click', closeComments);

            sendCommentBtn.addEventListener('click', () => sendComment()); 
            commentInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    sendComment();
                }
            });

            // İstifadəçinin cavab istifadəçi adını təmizləməsini yoxlayır və cavab vəziyyətini sıfırlayır
            commentInput.addEventListener('input', () => {
                sendCommentBtn.disabled = commentInput.value.trim() === '';
                if (activeCommentId && !commentInput.value.startsWith('@')) {
                    activeCommentId = null;
                    replyingToCommentAuthor = null;
                    commentInput.placeholder = 'Şərh yazın...';
                }
            });

            // Şərh modalı üçün brauzerin geri/irəli düyməsini idarə edir
            window.addEventListener('popstate', () => {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('reply') !== 'true' && commentsContainer.classList.contains('open')) {
                    closeComments();
                }
            });

            /**
             * DOM-a şərh (və ya cavab) elementi əlavə edir.
             * @param {object} comment - Şərh məlumatları.
             * @param {string|null} parentCommentId - Cavabdırsa, əsas şərhin ID-si.
             */
            async function addCommentToDOM(comment, parentCommentId = null) {
                // Təkrarlanmaması üçün şərhin DOM-da artıq mövcud olub-olmadığını yoxlayın
                const existingElement = document.querySelector(`.comment-item[data-comment-id="${comment.id}"]`);
                if (existingElement) {
                    return;
                }

                const commentElement = document.createElement('div');
                commentElement.className = `comment-item ${parentCommentId ? 'reply-item' : ''}`;
                commentElement.dataset.commentId = comment.id;
                commentElement.dataset.user = comment.user;
                if (parentCommentId) {
                    commentElement.dataset.parentId = parentCommentId;
                }

                const userProfilePic = await fetchUserProfile(comment.user);
                const userName = await fetchUserName(comment.user);

                let formattedText = comment.text;
                if (comment.isGif) {
                    // GIF URL-i üçün təmizləmə əlavə edildi
                    const cleanedGifUrl = cleanGifUrl(comment.text);
                    formattedText = `<img src="${cleanedGifUrl}" alt="GIF" />`;
                } else {
                    // Hashtag-ləri və cavab verilən istifadəçiləri vurğulayın
                    formattedText = formattedText.replace(/#(\w+)/g, '<a href="#" class="hashtag">#$1</a>');
                    if (comment.replyToNickname) {
                        formattedText = `<a href="#" class="reply-user">@${comment.replyToNickname}</a> ${formattedText.replace(`@${comment.replyToNickname}`, '')}`;
                    }
                    formattedText = formattedText.replace(/@(\w+)/g, '<a href="#" class="reply-user">@$1</a>');
                }
                
                commentElement.innerHTML = `
                    <div class="comment-main-content">
                        <img src="${userProfilePic}" class="comment-profile-pic" alt="${userName}" />
                        <div class="comment-text-bubble">
                            <span class="comment-user">${userName}</span>
                            <span class="comment-text">${formattedText}</span>
                        </div>
                    </div>
                `;

                // Yalnız əsas şərhlər üçün bəyənmə və cavab düymələrini əlavə edin
                if (!parentCommentId) {
                    const actionsHtml = `<div class="comment-actions">
                        <button class="reply-button">
                            <span class="reply-text">Cavablar</span>
                            <span class="reply-count"></span>
                        </button>
                        <div class="comment-like-section">
                            <span class="material-icons comment-like-icon">favorite</span>
                            <span class="comment-like-count">0</span>
                        </div>
                    </div>`;

                    commentElement.innerHTML += actionsHtml;

                    const repliesList = document.createElement('div');
                    repliesList.className = 'replies-list';
                    repliesList.style.display = 'none';
                    commentElement.appendChild(repliesList);

                    const replyButton = commentElement.querySelector('.reply-button');
                    const replyCountSpan = commentElement.querySelector('.reply-count');
                    const likeIcon = commentElement.querySelector('.comment-like-icon');
                    const likeCountSpan = commentElement.querySelector('.comment-like-count');

                    // Cavab sayını real-time dinləyici
                    commentsDb.ref(`comments/${activePostId}/${comment.id}/replies`).on('value', snap => {
                        const count = snap.numChildren();
                        if (count > 0) {
                            replyCountSpan.textContent = `+${count}`;
                            replyCountSpan.style.display = 'inline';
                        } else {
                            replyCountSpan.style.display = 'none';
                        }
                    });

                    // Yeni verilənlər bazasından şərh bəyənmələri üçün real-time dinləyici
                    commentLikesDb.ref(`comment_likes/${activePostId}/${comment.id}/likes`).on('value', snap => {
                        const likesData = snap.val() || {};
                        const count = likesData.count || 0;
                        const likedByUser = likesData.users && likesData.users[cleanCurrentUser];

                        likeCountSpan.textContent = count;
                        if (likedByUser) {
                            likeIcon.classList.add('liked');
                        } else {
                            likeIcon.classList.remove('liked');
                        }
                    });

                    // Cavab düyməsi üçün hadisə dinləyicisi
                    replyButton.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (repliesList.style.display === 'none' || repliesList.innerHTML === '') {
                            repliesList.style.display = 'flex';
                            repliesList.innerHTML = '';

                            const repliesSnapshot = await commentsDb.ref(`comments/${activePostId}/${comment.id}/replies`).once('value');
                            const replies = repliesSnapshot.val();
                            if (replies) {
                                const repliesArray = Object.keys(replies).map(key => ({ id: key, ...replies[key], parentId: comment.id }));
                                repliesArray.sort((a, b) => a.timestamp - b.timestamp);
                                for (const reply of repliesArray) {
                                    await addCommentToDOM(reply, comment.id);
                                }
                            }
                        } else {
                            repliesList.style.display = 'none';
                        }
                    });

                    // Bəyənmə düyməsi üçün hadisə dinləyicisi
                    likeIcon.parentElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handleCommentLikeClick(activePostId, comment.id);
                    });

                } else {
                    commentElement.classList.add('reply-item');
                }

                // Cavab girişini başlatmaq üçün şərh balonu üçün klik dinləyicisi
                commentElement.querySelector('.comment-text-bubble').addEventListener('click', (e) => {
                    e.stopPropagation();

                    if (!parentCommentId) {
                        const replyText = `@${comment.user} `;
                        commentInput.value = replyText;
                        commentInput.focus();
                        activeCommentId = comment.id;
                        replyingToCommentAuthor = comment.user;
                        commentInput.placeholder = `@${userName}'a cavab yazın...`;
                        sendCommentBtn.disabled = false;
                    }
                });

                // Silmə üçün uzun basma hadisə dinləyiciləri
                commentElement.addEventListener('touchstart', (e) => {
                    if (commentElement.dataset.user === cleanCurrentUser) {
                        longPressTimer = setTimeout(() => {
                            e.preventDefault();
                            showDeleteDialog(commentElement);
                        }, 500); // 500ms uzun basma
                    }
                });

                commentElement.addEventListener('touchend', (e) => {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                });

                // Şərhi doğru siyahıya (əsas siyahı və ya cavablar siyahısı) əlavə edin
                if (parentCommentId) {
                    const parentCommentElement = document.querySelector(`.comment-item[data-comment-id="${parentCommentId}"]`);
                    if (parentCommentElement) {
                        const repliesList = parentCommentElement.querySelector('.replies-list');
                        if (repliesList) {
                            repliesList.appendChild(commentElement);
                        }
                    }
                } else {
                    commentsList.prepend(commentElement);
                }
            }

            /**
             * Müəyyən bir şərhi bəyənmək/bəyənməmək funksiyası.
             * @param {string} postId - Postun ID-si.
             * @param {string} commentId - Şərhin ID-si.
             */
            async function handleCommentLikeClick(postId, commentId) {
                const commentLikeUserRef = commentLikesDb.ref(`comment_likes/${postId}/${commentId}/likes/users/${cleanCurrentUser}`);
                const commentLikeCountRef = commentLikesDb.ref(`comment_likes/${postId}/${commentId}/likes/count`);

                try {
                    const snap = await commentLikeUserRef.once('value');
                    if (snap.exists()) {
                        // İstifadəçi artıq bəyənib, ona görə bəyənməni geri al
                        await commentLikeUserRef.remove();
                        await commentLikeCountRef.transaction(currentCount => (currentCount || 1) - 1);
                    } else {
                        // İstifadəçi bəyənməyib, ona görə bəyən
                        await commentLikeUserRef.set(true);
                        await commentLikeCountRef.transaction(currentCount => (currentCount || 0) + 1);
                    }
                } catch (e) {
                    console.error("Şərh bəyənmə əməliyyatı uğursuz oldu:", e);
                }
            }

            /**
             * Müəyyən bir post üçün şərh modalını açır.
             * Bütün şərhlər gətirilənə qədər yükləmə spinnerini göstərir.
             * @param {string} postId - Şərhləri açılacaq postun ID-si.
             */
            async function openComments(postId) {
                activePostId = postId;
                commentsContainer.classList.add('open');
                gifListContainer.style.display = 'none'; // GIF siyahısını bağlayın

                // Daha yaxşı naviqasiya üçün URL-i şərh vəziyyətini əks etdirəcək şəkildə yeniləyin
                const newUrl = `${window.location.pathname}?user=${currentUser}&reply=true&post=${postId}`;
                history.pushState({ postId: postId, user: currentUser }, '', newUrl);

                commentsList.innerHTML = ''; // Əvvəlki şərhləri təmizləyin
                commentsLoader.style.display = 'flex'; // Yükləmə spinnerini göstərin

                // Yeni şərhlər və cavablar üçün dinləyici əlavə edin
                if (!commentAddedListenerAttached) {
                    const commentsRef = commentsDb.ref(`comments/${postId}`);

                    // Yeni əsas şərhlər üçün dinləyici
                    commentsRef.on('child_added', async (snapshot) => {
                        const newComment = { id: snapshot.key, ...snapshot.val() };
                        // Təkrarlanmaması üçün yoxlayın
                        if (!commentsList.querySelector(`[data-comment-id=\"${newComment.id}\"]`)) {
                            await addCommentToDOM(newComment);
                        }
                    });

                    // Yeni cavablar üçün dinləyici
                    commentsRef.on('child_changed', async (snapshot) => {
                        const updatedComment = { id: snapshot.key, ...snapshot.val() };
                        if (updatedComment.replies) {
                            // Sadece yeni əlavə olunan cavabları tapın
                            const existingReplies = Array.from(document.querySelectorAll(`.reply-item[data-parent-id="${updatedComment.id}"]`)).map(el => el.dataset.commentId);
                            for (const replyId in updatedComment.replies) {
                                if (!existingReplies.includes(replyId)) {
                                    const newReply = updatedComment.replies[replyId];
                                    const parentCommentElement = commentsList.querySelector(`.comment-item[data-comment-id="${updatedComment.id}"]`);
                                    if (parentCommentElement && parentCommentElement.querySelector('.replies-list').style.display === 'flex') {
                                        await addCommentToDOM({ id: replyId, ...newReply }, updatedComment.id);
                                    }
                                }
                            }
                        }
                    });

                    // Silinmiş şərhlər üçün dinləyici
                    commentsRef.on('child_removed', (snapshot) => {
                        const deletedCommentId = snapshot.key;
                        const elementToRemove = document.querySelector(`.comment-item[data-comment-id="${deletedCommentId}"]`);
                        if (elementToRemove) {
                            elementToRemove.remove();
                        }
                    });

                    commentAddedListenerAttached = true;
                }

                commentsLoader.style.display = 'none'; // İlkin yükləmədən sonra yükləmə spinnerini gizləyin
            }

            /**
             * Firebase-ə yeni bir şərh və ya cavab göndərir.
             * Yeni şərhi/cavabı dərhal DOM-a əlavə edir.
             * @param {string} [content=null] - Göndəriləcək əlavə məzmun (məsələn, GIF URL-i). Əgər nullsa, commentInput.value istifadə olunur.
             */
            async function sendComment(content = null) {
                let commentText;
                let isGifComment = false;

                if (content) {
                    commentText = content; // Təqdim olunan məzmundan (GIF URL-i) istifadə edin
                    isGifComment = true;
                } else {
                    commentText = commentInput.value.trim(); // Giriş sahəsindən istifadə edin
                }

                if (commentText === "" || !activePostId) return;

                const newComment = {
                    user: cleanCurrentUser,
                    text: commentText,
                    timestamp: Date.now(),
                    isGif: isGifComment // GIF olub olmadığını qeyd et
                };

                // Giriş məzmunu və ya activeCommentId-ə əsasən cavab olub olmadığını müəyyənləşdirin
                const replyToUserMatch = commentText.match(/^@(\w+)/);
                if (replyToUserMatch && activeCommentId) {
                    newComment.replyToNickname = replyingToCommentAuthor; // replyingToCommentAuthor istifadə et
                    const replyRef = commentsDb.ref(`comments/${activePostId}/${activeCommentId}/replies`).push();
                    await replyRef.set(newComment);
                    activeCommentId = null;
                    replyingToCommentAuthor = null;
                } else {
                    const newCommentRef = commentsDb.ref(`comments/${activePostId}`).push();
                    await newCommentRef.set(newComment);
                }

                commentInput.value = ''; // Giriş sahəsini təmizləyin
                sendCommentBtn.disabled = true; // Göndər düyməsini deaktiv et
                commentInput.placeholder = 'Şərh yazın...'; // Placeholder-i sıfırla
                gifListContainer.style.display = 'none'; // GIF siyahısını da bağlayın
                commentInput.disabled = false; // Şərh inputunu yenidən aktiv et
            }

            /**
             * Şərh silmə təsdiqi dialoqunu göstərir.
             * @param {HTMLElement} element - Silinəcək şərh və ya cavab elementi.
             */
            function showDeleteDialog(element) {
                itemToDelete = element;
                deleteDialogOverlay.style.display = 'flex';
            }

            /**
             * Şərh silmə təsdiqi dialoqunu gizlədir.
             */
            function hideDeleteDialog() {
                deleteDialogOverlay.style.display = 'none';
                itemToDelete = null;
            }

            /**
             * Firebase-dən şərhi və ya cavabı silir və DOM-dan çıxarır.
             */
            async function deleteItem() {
                if (!itemToDelete) return;

                const commentId = itemToDelete.dataset.commentId;
                const parentId = itemToDelete.dataset.parentId;

                try {
                    if (parentId) {
                        // Cavabdır
                        const replyRef = commentsDb.ref(`comments/${activePostId}/${parentId}/replies/${commentId}`);
                        await replyRef.remove();
                    } else {
                        // Əsas şərhdir
                        const commentRef = commentsDb.ref(`comments/${activePostId}/${commentId}`);
                        await commentRef.remove();
                    }
                    console.log("Şərh silmə uğurlu oldu.");
                    hideDeleteDialog(); // Silmə əməliyyatından sonra dialoqu DƏRHAL gizlədin
                    // DOM-dan silinmə child_removed listener tərəfindən idarə olunacaq.
                } catch (e) {
                    console.error("Şərh silmə uğursuz oldu:", e);
                    hideDeleteDialog(); // Hata olsa belə dialoqu gizlədin
                }
            }

            // Şərh silmə dialoq düymələri üçün hadisə dinləyiciləri
            confirmDeleteBtn.addEventListener('click', deleteItem);
            cancelDeleteBtn.addEventListener('click', hideDeleteDialog);
            deleteDialogOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'delete-dialog-overlay') {
                    hideDeleteDialog();
                }
            });

            // Snap silmə funksiyaları
            /**
             * Snap silmə təsdiqi dialoqunu göstərir.
             * @param {string} postId - Silinəcək snapın ID-si.
             */
            function showDeleteSnapDialog(postId) {
                snapToDelete = postId;
                deleteSnapDialogOverlay.style.display = 'flex';
            }

            /**
             * Snap silmə təsdiqi dialoqunu gizlədir.
             */
            function hideDeleteSnapDialog() {
                deleteSnapDialogOverlay.style.display = 'none';
                snapToDelete = null;
            }

            /**
             * Firebase-dən snapı silir.
             */
            async function deleteSnap() {
                if (!snapToDelete) return;

                const currentSnapId = snapToDelete; // Snap ID-ni saxla
                try {
                    // Postu reels node-dan silin
                    await reelDb.ref(`reels/${currentSnapId}`).remove();

                    // Bəyənmələri silin
                    await reelDb.ref(`likes/${currentSnapId}`).remove();

                    // Şərhləri silin
                    await commentsDb.ref(`comments/${currentSnapId}`).remove();

                    // Şərh bəyənmələrini silin
                    await commentLikesDb.ref(`comment_likes/${currentSnapId}`).remove();

                    console.log("Snap uğurla silindi:", currentSnapId);

                    hideDeleteSnapDialog(); // Silmə əməliyyatından sonra dialoqu DƏRHAL gizlədin

                    // `displayReels` avtomatik olaraq Firebase dinləyicisi tərəfindən çağırılacaq.
                    // Ona görə bu xətti ləğv etdik: await displayReels('my-snaps');
                } catch (e) {
                    console.error("Snap silmə uğursuz oldu:", e);
                    hideDeleteSnapDialog(); // Hata olsa belə dialoqu gizlədin
                }
            }

            // Snap silmə dialoq düymələri üçün hadisə dinləyiciləri
            confirmDeleteSnapBtn.addEventListener('click', deleteSnap);
            cancelDeleteSnapBtn.addEventListener('click', hideDeleteSnapDialog);
            deleteSnapDialogOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'delete-snap-dialog-overlay') {
                    hideDeleteSnapDialog();
                }
            });

            // GIF funksiyaları

            /**
             * GIF URL-ni təmizləyir, səhv əks-slashları təmizləyir.
             * @param {string} url - Təmizlənəcək GIF URL-i.
             * @returns {string} - Təmizlənmiş GIF URL-i.
             */
            function cleanGifUrl(url) {
                return url.replace(/\\/g, ''); // Bütün əks-slashları (escaped or not) boşluqla əvəz et
            }


            function toggleGifList() {
                if (gifListContainer.style.display === 'flex') {
                    gifListContainer.style.display = 'none';
                    // İNPUTU YENİDƏN AKTİV ET
                    commentInput.disabled = false; 
                    sendCommentBtn.disabled = commentInput.value.trim() === '';
                } else {
                    gifListContainer.style.display = 'flex';
                    // İNPUTU DEAKTİV ET
                    commentInput.disabled = true;
                    sendCommentBtn.disabled = true;
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
                    const originalGifUrl = allGifs[gifId];
                    const cleanedGifUrl = cleanGifUrl(originalGifUrl); // URL-i təmizlə
                    const gifItem = document.createElement('div');
                    gifItem.className = 'gif-item';
                    gifItem.innerHTML = `<img src="${cleanedGifUrl}" alt="GIF" onerror="this.onerror=null;this.src='https://placehold.co/120x90/333/666?text=GIF+Not+Found';" />`;
                    gifItem.onclick = () => selectGif(cleanedGifUrl);
                    gifCarousel.appendChild(gifItem);
                });
            }

            function selectGif(gifUrl) {
                if (!activePostId) {
                    // Alert dialog olsaydı: showAlertDialog("GIF göndərmək üçün aktiv post yoxdur.");
                    console.error("GIF göndərmək üçün aktiv post yoxdur.");
                    return;
                }

                // sendComment funksiyasına GIF URL-i göndər
                sendComment(gifUrl);

                commentInput.value = '';
                sendCommentBtn.disabled = true;
                activeCommentId = null;
                replyingToCommentAuthor = null;
                commentInput.placeholder = 'Şərh yazın...';
                toggleGifList(); // GIF seçildikdən sonra siyahını bağla
                commentInput.disabled = false; // Şərh inputunu yenidən aktiv et
            }

            // GIF düyməsinə klikləmə hadisəsi
            gifButton.addEventListener('click', toggleGifList);

            // X düyməsinə klikləmə hadisəsi (yeni)
            closeGifListBtn.addEventListener('click', toggleGifList);

        })();
