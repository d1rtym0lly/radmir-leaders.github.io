(function() {
    'use strict';
    
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
                
                // Инициализация данных
                const initializeData = () => {
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
                    renderPage();
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
                
                const saveData = () => {
                    localStorage.setItem('radmirPeopleData', JSON.stringify(people));
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
                                console.log("Введенный пароль:", adminPassword.value); // УДАЛИТЬ
                                console.log("Ожидаемый пароль:", ADMIN_PASSWORD); // УДАЛИТЬ
                                
                                if (adminPassword.value === ADMIN_PASSWORD) {
                                    isAdminMode = true;
                                    if (loginForm) loginForm.classList.add('hidden');
                                    if (adminControls) adminControls.classList.remove('hidden');
                                    if (loginBtn) loginBtn.classList.add('hidden');
                                    renderPage();
                                    adminPassword.value = '';
                                    console.log("Успешный вход!"); // УДАЛИТЬ
                                } else {
                                    alert('Неверный пароль');
                                    console.log("Неверный пароль!"); // УДАЛИТЬ
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
                        saveBtn.addEventListener('click', () => {
                            saveData();
                            alert('Все изменения сохранены!');
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
                        saveEdit.addEventListener('click', () => {
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
                                    
                                    saveData();
                                    renderPage();
                                    closeEditModal();
                                }
                            }
                        });
                    }
                    
                    const deletePerson = getElement('deletePerson');
                    if (deletePerson) {
                        deletePerson.addEventListener('click', () => {
                            if (currentEditIndex !== null && confirm('Вы уверены, что хотите удалить этого участника?')) {
                                people.splice(currentEditIndex, 1);
                                saveData();
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
                        saveNewPerson.addEventListener('click', () => {
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
                            
                            saveData();
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
                        initializeData();
                        initEventListeners();
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
