[file name]: script.js
[file content begin]
(function() {
    'use strict';
    
    // Замените на имя вашего репозитория и ветки
    const GITHUB_REPO = 'd1rtym0lly/radmir-leaders.github.io';
    const GITHUB_BRANCH = 'main';
    const DATA_FILE = 'people-data.json';
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    });
    
    Object.defineProperty(window, '_appCore', {
        value: (() => {
            const getPassword = () => {
                const parts = [
                    () => "41",
                    () => "28", 
                    () => "88",
                    () => "32" 
                ];
                
                return parts.map(fn => fn()).join('');
            };
            
            const initApp = () => {
                const ADMIN_PASSWORD = getPassword();
                const PEOPLE_PER_PAGE = 12;
                
                // Динамическое получение элементов
                const getElement = (id) => document.getElementById(id);
                
                // Состояние приложения
                let currentPage = 1;
                let isAdminMode = false;
                let people = [];
                let currentEditIndex = null;
                
                // НОВЫЙ ФУНКЦИОНАЛ: Загрузка данных с GitHub
                const loadDataFromGitHub = async () => {
                    try {
                        // Пробуем загрузить данные с GitHub
                        const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_FILE}?t=${Date.now()}`);
                        
                        if (response.ok) {
                            const data = await response.json();
                            console.log('Данные загружены с GitHub:', data);
                            return data;
                        }
                        console.log('Файл на GitHub не найден, используем локальные данные');
                        
                        // Если файла нет на GitHub, пробуем локальные данные
                        const savedData = localStorage.getItem('radmirPeopleData');
                        if (savedData) {
                            return JSON.parse(savedData);
                        }
                        
                        return null;
                    } catch (error) {
                        console.error('Ошибка загрузки с GitHub:', error);
                        
                        // Пробуем локальные данные как запасной вариант
                        const savedData = localStorage.getItem('radmirPeopleData');
                        if (savedData) {
                            return JSON.parse(savedData);
                        }
                        
                        return null;
                    }
                };
                
                // НОВЫЙ ФУНКЦИОНАЛ: Сохранение данных в localStorage и синхронизация
                const saveData = async (dataToSave = people) => {
                    // Сохраняем локально
                    localStorage.setItem('radmirPeopleData', JSON.stringify(dataToSave));
                    
                    // Если админ - предлагаем синхронизацию
                    if (isAdminMode && confirm('Хотите синхронизировать изменения для всех пользователей?\n\nЭто создаст файл данных в репозитории GitHub.')) {
                        await syncToGitHub(dataToSave);
                    }
                };
                
                // НОВЫЙ ФУНКЦИОНАЛ: Синхронизация на GitHub (для администратора)
                const syncToGitHub = async (data) => {
                    const syncModal = document.createElement('div');
                    syncModal.className = 'sync-modal';
                    syncModal.innerHTML = `
                        <div class="sync-content">
                            <h3><i class="fas fa-sync-alt"></i> Синхронизация с GitHub</h3>
                            <p>Для публикации изменений для всех пользователей:</p>
                            <ol style="text-align: left; margin: 15px 0; padding-left: 20px;">
                                <li>Скопируйте данные ниже</li>
                                <li>Перейдите в ваш репозиторий на GitHub</li>
                                <li>Создайте новый файл с именем <strong>${DATA_FILE}</strong></li>
                                <li>Вставьте скопированные данные и сохраните</li>
                            </ol>
                            <textarea id="syncData" readonly style="width: 100%; height: 150px; background: #111; color: #fff; border: 1px solid #333; padding: 10px; border-radius: 5px; margin: 15px 0; font-family: monospace;">${JSON.stringify(data, null, 2)}</textarea>
                            <div style="display: flex; gap: 10px; justify-content: center;">
                                <button id="copyData" class="admin-btn" style="background: #2a7de1;">
                                    <i class="fas fa-copy"></i> Копировать данные
                                </button>
                                <button id="closeSync" class="admin-btn">
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    `;
                    
                    // Стили для модального окна
                    const style = document.createElement('style');
                    style.textContent = `
                        .sync-modal {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.9);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 9999;
                            backdrop-filter: blur(5px);
                        }
                        .sync-content {
                            background: rgba(30, 30, 30, 0.95);
                            border: 2px solid #2a7de1;
                            border-radius: 12px;
                            padding: 25px;
                            max-width: 600px;
                            width: 90%;
                            color: #fff;
                            text-align: center;
                        }
                        .sync-content h3 {
                            color: #2a7de1;
                            margin-bottom: 15px;
                            font-size: 1.5rem;
                        }
                    `;
                    
                    document.head.appendChild(style);
                    document.body.appendChild(syncModal);
                    
                    // Копирование данных
                    document.getElementById('copyData').addEventListener('click', () => {
                        const textarea = document.getElementById('syncData');
                        textarea.select();
                        document.execCommand('copy');
                        alert('Данные скопированы в буфер обмена!');
                    });
                    
                    // Закрытие окна
                    document.getElementById('closeSync').addEventListener('click', () => {
                        document.body.removeChild(syncModal);
                        document.head.removeChild(style);
                    });
                    
                    // Автоматическое копирование через 1 секунду
                    setTimeout(() => {
                        const textarea = document.getElementById('syncData');
                        textarea.select();
                        document.execCommand('copy');
                    }, 1000);
                };
                
                // Обновленная инициализация данных
                const initializeData = async () => {
                    // Пробуем загрузить данные с GitHub
                    const githubData = await loadDataFromGitHub();
                    
                    if (githubData && Array.isArray(githubData)) {
                        people = githubData;
                        console.log('Используются данные с GitHub');
                    } else {
                        // Запасной вариант - локальные данные или данные по умолчанию
                        const savedData = localStorage.getItem('radmirPeopleData');
                        if (savedData) {
                            try {
                                people = JSON.parse(savedData);
                            } catch(e) {
                                loadDefaultData();
                            }
                        } else {
                            loadDefaultData();
                        }
                    }
                    
                    renderPage();
                    
                    // Показываем источник данных
                    showDataSource(githubData ? 'github' : 'local');
                };
                
                // Показ источника данных
                const showDataSource = (source) => {
                    // Удаляем старый индикатор, если есть
                    const oldIndicator = document.querySelector('.data-source-indicator');
                    if (oldIndicator) {
                        oldIndicator.remove();
                    }
                    
                    const indicator = document.createElement('div');
                    indicator.className = 'data-source-indicator';
                    indicator.innerHTML = `
                        <div style="position: fixed; bottom: 20px; right: 20px; background: ${source === 'github' ? 'rgba(42, 125, 225, 0.9)' : 'rgba(255, 165, 0, 0.9)'}; 
                            color: white; padding: 8px 15px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 8px; z-index: 1000;">
                            <i class="fas fa-database"></i>
                            ${source === 'github' ? 'Данные с GitHub (общие)' : 'Локальные данные (только у вас)'}
                        </div>
                    `;
                    
                    document.body.appendChild(indicator);
                };
                
                const loadDefaultData = () => {
                    // Данные в обычном виде (но без пароля)
                    people = [
                        {
                            name: "ИВАН ПЕТРОВ",
                            organization: "LSPD",
                            position: "Капитан полиции",
                            photo: "https://images.unsplash.com/photo-1585076641399-5c06d1b3365f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        },
                        {
                            name: "АННА ВОРОНОВА",
                            organization: "Медицинский центр",
                            position: "Главный хирург",
                            photo: "https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        },
                        {
                            name: "ДМИТРИЙ СИДОРОВ",
                            organization: "Такси служба",
                            position: "Старший диспетчер",
                            photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        },
                        {
                            name: "ЕЛЕНА КУЗНЕЦОВА",
                            organization: "Банк Лос-Сантос",
                            position: "Управляющая",
                            photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        },
                        {
                            name: "СЕРГЕЙ ИВАНОВ",
                            organization: "Автосервис LS Customs",
                            position: "Главный механик",
                            photo: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        },
                        {
                            name: "ОЛЬГА СМИРНОВА",
                            organization: "Адвокатское бюро",
                            position: "Старший адвокат",
                            photo: "https://images.unsplash.com/photo-1512757776214-26d36777b513?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        },
                        {
                            name: "МИХАИЛ ПОПОВ",
                            organization: "Служба эвакуации",
                            position: "Оператор",
                            photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        },
                        {
                            name: "ТАТЬЯНА НИКОЛАЕВА",
                            organization: "Ресторан",
                            position: "Шеф-повар",
                            photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        }
                    ];
                    saveData();
                };
                
                const renderPage = () => {
                    const container = getElement('peopleContainer');
                    if (!container) return;
                    
                    container.innerHTML = '';
                    
                    const totalPages = Math.max(1, Math.ceil(people.length / PEOPLE_PER_PAGE));
                    const startIndex = (currentPage - 1) * PEOPLE_PER_PAGE;
                    const endIndex = Math.min(startIndex + PEOPLE_PER_PAGE, people.length);
                    const pagePeople = people.slice(startIndex, endIndex);
                    
                    pagePeople.forEach((person, index) => {
                        const personIndex = startIndex + index;
                        const card = document.createElement('div');
                        card.className = 'person-card';
                        
                        card.innerHTML = `
                            <div class="person-img-container">
                                <img src="${person.photo}" alt="${person.name}" class="person-img" 
                                    onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                                <div class="person-name">${person.name}</div>
                                ${isAdminMode ? `<button class="edit-icon" data-index="${personIndex}">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>` : ''}
                            </div>
                            <div class="person-info">
                                <div class="person-organization">${person.organization}</div>
                                <div class="person-position">${person.position}</div>
                            </div>
                        `;
                        
                        container.appendChild(card);
                    });
                    
                    // Обновление статистики
                    const totalPeopleEl = getElement('totalPeople');
                    const currentPageEl = getElement('currentPage');
                    const totalPagesEl = getElement('totalPages');
                    const pageInfoEl = getElement('pageInfo');
                    const prevBtn = getElement('prevBtn');
                    const nextBtn = getElement('nextBtn');
                    
                    if (totalPeopleEl) totalPeopleEl.textContent = people.length;
                    if (currentPageEl) currentPageEl.textContent = currentPage;
                    if (totalPagesEl) totalPagesEl.textContent = totalPages;
                    if (pageInfoEl) pageInfoEl.textContent = `Страница ${currentPage} из ${totalPages}`;
                    if (prevBtn) prevBtn.disabled = currentPage === 1;
                    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
                    
                    // Обработчики для кнопок редактирования
                    if (isAdminMode) {
                        document.querySelectorAll('.edit-icon').forEach(btn => {
                            btn.addEventListener('click', function() {
                                const index = parseInt(this.getAttribute('data-index'));
                                openEditModal(index);
                            });
                        });
                    }
                };
                
                const openEditModal = (index) => {
                    const person = people[index];
                    currentEditIndex = index;
                    
                    const editName = getElement('editName');
                    const editOrganization = getElement('editOrganization');
                    const editPosition = getElement('editPosition');
                    const editPhoto = getElement('editPhoto');
                    const editModal = getElement('editModal');
                    
                    if (editName) editName.value = person.name;
                    if (editOrganization) editOrganization.value = person.organization;
                    if (editPosition) editPosition.value = person.position;
                    if (editPhoto) editPhoto.value = person.photo;
                    if (editModal) editModal.classList.remove('hidden');
                };
                
                const closeEditModal = () => {
                    const editModal = getElement('editModal');
                    if (editModal) editModal.classList.add('hidden');
                    currentEditIndex = null;
                };
                
                const openAddPersonModal = () => {
                    const newPersonName = getElement('newPersonName');
                    const newPersonOrganization = getElement('newPersonOrganization');
                    const newPersonPosition = getElement('newPersonPosition');
                    const newPersonPhoto = getElement('newPersonPhoto');
                    const addPersonModal = getElement('addPersonModal');
                    
                    if (newPersonName) newPersonName.value = '';
                    if (newPersonOrganization) newPersonOrganization.value = '';
                    if (newPersonPosition) newPersonPosition.value = '';
                    if (newPersonPhoto) newPersonPhoto.value = '';
                    if (addPersonModal) addPersonModal.classList.remove('hidden');
                };
                
                const closeAddPersonModal = () => {
                    const addPersonModal = getElement('addPersonModal');
                    if (addPersonModal) addPersonModal.classList.add('hidden');
                };
                
                // НОВЫЙ ФУНКЦИОНАЛ: Кнопка синхронизации
                const addSyncButton = () => {
                    const adminControls = getElement('adminControls');
                    if (!adminControls) return;
                    
                    // Проверяем, нет ли уже кнопки синхронизации
                    if (document.getElementById('syncBtn')) return;
                    
                    const syncBtn = document.createElement('button');
                    syncBtn.id = 'syncBtn';
                    syncBtn.className = 'admin-btn';
                    syncBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Синхронизировать';
                    syncBtn.style.background = '#2a7de1';
                    syncBtn.style.borderColor = '#2a7de1';
                    
                    syncBtn.addEventListener('click', () => {
                        syncToGitHub(people);
                    });
                    
                    adminControls.insertBefore(syncBtn, adminControls.querySelector('#logoutBtn'));
                };
                
                // Инициализация обработчиков событий
                const initEventListeners = () => {
                    // Вход
                    const loginBtn = getElement('loginBtn');
                    if (loginBtn) {
                        loginBtn.addEventListener('click', () => {
                            const loginForm = getElement('loginForm');
                            if (loginForm) loginForm.classList.toggle('hidden');
                        });
                    }
                    
                    const submitLogin = getElement('submitLogin');
                    if (submitLogin) {
                        submitLogin.addEventListener('click', () => {
                            const adminPassword = getElement('adminPassword');
                            const loginForm = getElement('loginForm');
                            const adminControls = getElement('adminControls');
                            const loginBtn = getElement('loginBtn');
                            
                            if (adminPassword) {
                                if (adminPassword.value === ADMIN_PASSWORD) {
                                    isAdminMode = true;
                                    if (loginForm) loginForm.classList.add('hidden');
                                    if (adminControls) adminControls.classList.remove('hidden');
                                    if (loginBtn) loginBtn.classList.add('hidden');
                                    
                                    // Добавляем кнопку синхронизации при входе
                                    addSyncButton();
                                    
                                    renderPage();
                                    adminPassword.value = '';
                                    console.log("Успешный вход!");
                                } else {
                                    alert('Неверный пароль');
                                    console.log("Неверный пароль!");
                                }
                            }
                        });
                    }
                    
                    // Выход
                    const logoutBtn = getElement('logoutBtn');
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', () => {
                            isAdminMode = false;
                            const adminControls = getElement('adminControls');
                            const loginBtn = getElement('loginBtn');
                            const saveBtn = getElement('saveBtn');
                            
                            if (adminControls) adminControls.classList.add('hidden');
                            if (loginBtn) loginBtn.classList.remove('hidden');
                            if (saveBtn) saveBtn.classList.add('hidden');
                            renderPage();
                        });
                    }
                    
                    // Добавление участника
                    const addPersonBtn = getElement('addPersonBtn');
                    if (addPersonBtn) {
                        addPersonBtn.addEventListener('click', openAddPersonModal);
                    }
                    
                    // Режим редактирования
                    const editToggle = getElement('editToggle');
                    if (editToggle) {
                        editToggle.addEventListener('click', () => {
                            const saveBtn = getElement('saveBtn');
                            if (saveBtn) saveBtn.classList.toggle('hidden');
                            renderPage();
                        });
                    }
                    
                    // Сохранение данных
                    const saveBtn = getElement('saveBtn');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', async () => {
                            await saveData();
                            alert('Все изменения сохранены локально!');
                        });
                    }
                    
                    // Пагинация
                    const prevBtn = getElement('prevBtn');
                    if (prevBtn) {
                        prevBtn.addEventListener('click', () => {
                            if (currentPage > 1) {
                                currentPage--;
                                renderPage();
                            }
                        });
                    }
                    
                    const nextBtn = getElement('nextBtn');
                    if (nextBtn) {
                        nextBtn.addEventListener('click', () => {
                            const totalPages = Math.max(1, Math.ceil(people.length / PEOPLE_PER_PAGE));
                            if (currentPage < totalPages) {
                                currentPage++;
                                renderPage();
                            }
                        });
                    }
                    
                    // Редактирование профиля
                    const saveEdit = getElement('saveEdit');
                    if (saveEdit) {
                        saveEdit.addEventListener('click', async () => {
                            if (currentEditIndex !== null) {
                                const editName = getElement('editName');
                                const editOrganization = getElement('editOrganization');
                                const editPosition = getElement('editPosition');
                                const editPhoto = getElement('editPhoto');
                                
                                if (editName && editOrganization && editPosition && editPhoto) {
                                    people[currentEditIndex] = {
                                        name: editName.value.toUpperCase(),
                                        organization: editOrganization.value,
                                        position: editPosition.value,
                                        photo: editPhoto.value
                                    };
                                    
                                    await saveData();
                                    renderPage();
                                    closeEditModal();
                                }
                            }
                        });
                    }
                    
                    const deletePerson = getElement('deletePerson');
                    if (deletePerson) {
                        deletePerson.addEventListener('click', async () => {
                            if (currentEditIndex !== null && confirm('Вы уверены, что хотите удалить этого участника?')) {
                                people.splice(currentEditIndex, 1);
                                await saveData();
                                renderPage();
                                closeEditModal();
                            }
                        });
                    }
                    
                    const cancelEdit = getElement('cancelEdit');
                    if (cancelEdit) {
                        cancelEdit.addEventListener('click', closeEditModal);
                    }
                    
                    // Добавление нового участника
                    const saveNewPerson = getElement('saveNewPerson');
                    if (saveNewPerson) {
                        saveNewPerson.addEventListener('click', async () => {
                            const newPersonName = getElement('newPersonName');
                            const newPersonOrganization = getElement('newPersonOrganization');
                            const newPersonPosition = getElement('newPersonPosition');
                            const newPersonPhoto = getElement('newPersonPhoto');
                            
                            if (!newPersonName || !newPersonOrganization || !newPersonPosition || !newPersonPhoto) return;
                            
                            const name = newPersonName.value.trim();
                            const organization = newPersonOrganization.value.trim();
                            const position = newPersonPosition.value.trim();
                            const photo = newPersonPhoto.value.trim();
                            
                            if (!name || !organization || !position || !photo) {
                                alert('Пожалуйста, заполните все поля!');
                                return;
                            }
                            
                            people.push({
                                name: name.toUpperCase(),
                                organization: organization,
                                position: position,
                                photo: photo
                            });
                            
                            await saveData();
                            currentPage = Math.ceil(people.length / PEOPLE_PER_PAGE);
                            renderPage();
                            closeAddPersonModal();
                            alert('Новый участник успешно добавлен!');
                        });
                    }
                    
                    const cancelNewPerson = getElement('cancelNewPerson');
                    if (cancelNewPerson) {
                        cancelNewPerson.addEventListener('click', closeAddPersonModal);
                    }
                    
                    // Закрытие модальных окон при клике вне их
                    document.addEventListener('click', (e) => {
                        const editModal = getElement('editModal');
                        const addModal = getElement('addPersonModal');
                        
                        if (editModal && e.target === editModal && !editModal.classList.contains('hidden')) {
                            closeEditModal();
                        }
                        if (addModal && e.target === addModal && !addModal.classList.contains('hidden')) {
                            closeAddPersonModal();
                        }
                    });
                };
                
                // Запуск приложения
                return {
                    init: () => {
                        // Используем асинхронную инициализацию
                        initializeData().then(() => {
                            initEventListeners();
                        });
                    }
                };
            };
            
            return { initApp };
        })(),
        writable: false,
        configurable: false,
        enumerable: false
    });
})();

// == Запуск приложения после загрузки DOM ==
document.addEventListener('DOMContentLoaded', function() {
    if (window._appCore && window._appCore.initApp) {
        const app = window._appCore.initApp();
        app.init();
    }
});
[file content end]
