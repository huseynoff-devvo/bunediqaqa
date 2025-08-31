// İstifadəçi tərəfindən verilmiş Firebase konfiqurasiyaları
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
        
        const writeConfig = {
            apiKey: "AIzaSyCMUZ-RMaQBZdaF39mpLNq79BCutrANkXA",
            authDomain: "pasyak-mess.firebaseapp.com",
            databaseURL: "https://pasyak-mess-default-rtdb.firebaseio.com",
            projectId: "pasyak-mess",
            storageBucket: "pasyak-mess.firebasestorage.app",
            messagingSenderId: "243117691435",
            appId: "1:243117691435:web:aade1765ddec56ad6bd06e"
        };

        const newMessConfig = {
             apiKey: "AIzaSyBAZ2ZYIZiizRktqojSYD1He4sWsRi17MI",
             authDomain: "build-number1.firebaseapp.com",
             databaseURL: "https://build-number1-default-rtdb.firebaseio.com",
             projectId: "build-number1",
             storageBucket: "build-number1.firebasestorage.app",
             messagingSenderId: "382364951112",
             appId: "1:382364951112:web:cb4d049d2c66f20a01ee7d"
        };


        const readApp = firebase.initializeApp(readConfig, "readApp");
        const readDb = firebase.database(readApp);

        const writeApp = firebase.initializeApp(writeConfig, "writeApp");
        const writeDb = firebase.database(writeApp);
        
        const newMessApp = firebase.initializeApp(newMessConfig, "newMessApp");
        const newMessDb = firebase.database(newMessApp);

        const myGroupsContainer = document.getElementById('myGroups');
        const recommendedGroupsContainer = document.getElementById('recommendedGroups');
        const mainContainer = document.querySelector('.container');
        const loadingOverlay = document.getElementById('loading-overlay');
        const confirmModalOverlay = document.getElementById('confirm-modal-overlay');
        const confirmYesBtn = document.getElementById('confirm-yes');
        const confirmNoBtn = document.getElementById('confirm-no');
        
        const urlParams = new URLSearchParams(window.location.search);
        const currentUser = urlParams.get('user');

        if (!currentUser) {
            loadingOverlay.style.display = 'none';
            mainContainer.style.display = 'block';
            myGroupsContainer.innerHTML = '<div class="error-message">Xahiş edirik, URL-də istifadəçi adınızı qeyd edin (məsələn: ?user=@huseynoff).</div>';
            recommendedGroupsContainer.innerHTML = '';
        } else {
            readDb.ref().once('value', async (snapshot) => {
                await loadGroups(snapshot);
                loadingOverlay.style.display = 'none';
                mainContainer.style.display = 'block';
                setupNewMessageListener();
            });
        }

        async function loadGroups(snapshot) {
            try {
                const groupsData = snapshot.val();
                
                if (!groupsData || !groupsData.groups) {
                    myGroupsContainer.innerHTML = '<div class="empty-state">Heç bir qrup tapılmadı.</div>';
                    recommendedGroupsContainer.innerHTML = '<div class="empty-state">Heç bir qrup tapılmadı.</div>';
                    return;
                }

                const myGroups = [];
                const recommendedGroups = [];
                
                const allGroups = groupsData.groups;
                const admins = groupsData.admins;
                
                for (const groupId in allGroups) {
                    if (allGroups.hasOwnProperty(groupId)) {
                        const groupMeta = JSON.parse(allGroups[groupId]);
                        const userStatus = groupsData[groupId] ? groupsData[groupId][currentUser] : null;
                        
                        const isAdmin = admins && admins[groupMeta.group_id] && admins[groupMeta.group_id].includes(currentUser);

                        if (userStatus === '1') {
                            myGroups.push({ ...groupMeta, isAdmin });
                        } else if (groupMeta.gizli !== 2) {
                            recommendedGroups.push({ ...groupMeta, isAdmin });
                        }
                    }
                }
                
                renderGroups(myGroupsContainer, myGroups, true);
                renderGroups(recommendedGroupsContainer, recommendedGroups, false);
                
                const messagePromises = myGroups.map(group => loadLastMessage(group.group_id));
                const lastMessages = await Promise.all(messagePromises);

                myGroups.forEach((group, index) => {
                    const element = document.querySelector(`.group-card[data-group-id="${group.group_id}"] .last-message`);
                    if (element) {
                        element.textContent = formatMessage(lastMessages[index], currentUser);
                        setupMessageListener(group.group_id, currentUser);
                    }
                });

            } catch (error) {
                console.error("Qrupları yükləmək xətası:", error);
                myGroupsContainer.innerHTML = `<div class="error-message">Qrupları yükləyərkən xəta baş verdi. Zəhmət olmasa konsolu yoxlayın.</div>`;
            }
        }
        
        function renderGroups(container, groups, isMember) {
            container.innerHTML = '';
            if (groups.length === 0) {
                container.innerHTML = `<div class="empty-state">${isMember ? 'Hələlik heç bir qrupda deyilsiniz.' : 'Tövsiyə olunan qrup yoxdur.'}</div>`;
                return;
            }

            groups.forEach(group => {
                const card = createGroupCard(group, isMember);
                container.appendChild(card);
            });
        }

        async function loadLastMessage(groupId) {
            try {
                const messagesRef = writeDb.ref(groupId).orderByKey().limitToLast(1);
                const snapshot = await messagesRef.once('value');
                const messages = snapshot.val();
                if (messages) {
                    const lastMessageKey = Object.keys(messages)[0];
                    const lastMessageJson = messages[lastMessageKey];
                    return JSON.parse(lastMessageJson);
                }
                return null;
            } catch (error) {
                console.error(`Son mesajı yükləmək xətası (${groupId}):`, error);
                return null;
            }
        }
        
        function formatMessage(messageData, currentUser) {
            if (!messageData) {
                return "Hələ mesaj yoxdur.";
            }
            const nickname = messageData.nickname;
            const message = messageData.message;
            if (nickname === 'Sistem') {
                return message;
            } else if (nickname.toLowerCase() === currentUser.toLowerCase()) {
                return `Mən: ${message}`;
            } else {
                return `${nickname}: ${message}`;
            }
        }

        function createGroupCard(group, isMember) {
            const card = document.createElement('div');
            card.className = 'group-card';
            card.dataset.groupId = group.group_id;

            card.innerHTML = `
                <img src="${group.profile_group}" alt="${group.name} profili">
                <div class="group-info">
                    <span class="group-name">${group.name}</span>
                    <span class="group-id">ID: ${group.group_id}</span>
                    ${isMember ? `<span class="last-message">Yüklənir...</span>` : ''}
                </div>
                <div class="group-actions">
                    ${!isMember ? '<button class="join-button">Qoşul</button>' : ''}
                    ${group.isAdmin ? `<button class="delete-button" data-group-id="${group.group_id}"><i class="material-icons">delete</i></button>` : ''}
                </div>
            `;
            
            if (isMember) {
                card.onclick = () => {
                    const url = `?user=${encodeURIComponent(currentUser)}&group_id=${encodeURIComponent(group.group_id)}`;
                    window.location.href = `https://huseynoff-devvo.github.io/bunediqaqa/group.html?${url.substring(1)}`;
                    // Mesaj bildirişini yalnız bu istifadəçi üçün sil
                    newMessDb.ref('new_message/' + currentUser).remove();
                };
            } else {
                card.querySelector('.join-button').onclick = async (event) => {
                    event.stopPropagation();
                    
                    try {
                        const groupMemberRef = readDb.ref(`${group.group_id}/${currentUser}`);
                        await groupMemberRef.set("1");
                        
                        const uniqueId = `${Date.now()}`;
                        const messageString = JSON.stringify({
                            "message": `${currentUser} qrupa qoşuldu.`,
                            "nickname": "Sistem"
                        });
                        
                        const messageNodeRef = writeDb.ref(`${group.group_id}/${uniqueId}`);
                        await messageNodeRef.set(messageString);
                        
                    } catch (error) {
                        console.error("Qrupa qoşulma xətası:", error);
                        showConfirmModal("Xəta!", "Qrupa qoşularkən xəta baş verdi.", false);
                    }
                };
            }
            
            const deleteButton = card.querySelector('.delete-button');
            if (deleteButton) {
                deleteButton.onclick = (event) => {
                    event.stopPropagation();
                    const groupIdToDelete = event.currentTarget.dataset.groupId;
                    showConfirmModal("Qrupu silmək", "Bu qrupu silmək istədiyinizə əminsiniz? Bu əməliyyatı geri qaytarmaq mümkün deyil.", true, () => deleteGroup(groupIdToDelete));
                };
            }

            return card;
        }

        async function deleteGroup(groupId) {
            try {
                await readDb.ref(`groups/${groupId}`).remove(); 
                await readDb.ref(`${groupId}`).remove(); 
                await readDb.ref(`admins/${groupId}`).remove(); 
                await writeDb.ref(groupId).remove(); 
                
            } catch (error) {
                console.error("Qrupu silmək xətası:", error);
                showConfirmModal("Xəta!", "Qrupu silərkən xəta baş verdi.", false);
            }
        }
        
        function showConfirmModal(title, message, isDeletable, callback) {
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
            
            confirmYesBtn.style.display = isDeletable ? 'inline-block' : 'none';
            confirmYesBtn.onclick = () => {
                confirmModalOverlay.style.display = 'none';
                if (callback) callback();
            };

            confirmNoBtn.textContent = isDeletable ? "Xeyr" : "Bağla";
            confirmNoBtn.onclick = () => {
                confirmModalOverlay.style.display = 'none';
            };
            
            confirmModalOverlay.style.display = 'flex';
        }

        function setupNewMessageListener() {
            // Real-vaxtda cari istifadəçi üçün yeni mesaj bildirişini dinləyir
            newMessDb.ref('new_message/' + currentUser).on('value', (snapshot) => {
                const newMessId = snapshot.val();
                
                // Bütün qrup kartlarından işarəni sil
                document.querySelectorAll('.group-card').forEach(card => {
                    card.classList.remove('new-message');
                });

                // Əgər yeni mesaj varsa, müvafiq qrupu işarələ
                if (newMessId) {
                    const groupCard = document.querySelector(`.group-card[data-group-id="${newMessId}"]`);
                    if (groupCard) {
                        groupCard.classList.add('new-message');
                    }
                }
            });
        }
        
        function setupMessageListener(groupId, currentUser) {
            const messagesRef = writeDb.ref(groupId);
            
            messagesRef.limitToLast(1).on('value', (snapshot) => {
                if (snapshot.exists()) {
                    const messages = snapshot.val();
                    const lastMessageKey = Object.keys(messages)[0];
                    const lastMessageJson = messages[lastMessageKey];
                    const lastMessage = JSON.parse(lastMessageJson);
                    
                    const groupCard = document.querySelector(`.group-card[data-group-id="${groupId}"]`);
                    if (groupCard) {
                        const lastMessageElement = groupCard.querySelector('.last-message');
                        if (lastMessageElement) {
                            lastMessageElement.textContent = formatMessage(lastMessage, currentUser);
                        }
                        
                        // Əgər mesaj cari istifadəçi tərəfindən göndərilməyibsə
                        if (lastMessage.nickname.toLowerCase() !== currentUser.toLowerCase()) {
                            // URL-ə &new=true əlavə et
                            const currentUrl = new URL(window.location.href);
                            currentUrl.searchParams.set('new', 'true');
                            history.pushState({}, '', currentUrl.toString());

                            // Yeni mesajı cari istifadəçi üçün Firebase-də qeyd et
                            newMessDb.ref('new_message/' + currentUser).set(groupId);

                            // 5 saniyə sonra URL-dən sil
                            setTimeout(() => {
                               const finalUrl = new URL(window.location.href);
                               finalUrl.searchParams.delete('new');
                               history.pushState({}, '', finalUrl.toString());
                            }, 5000);
                        }
                    }
                }
            });
        }
