document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const ADMIN_PASSWORD = "radmir2024"; // Измените на свой пароль
    const PEOPLE_PER_PAGE = 12; // Увеличено количество на странице
    
    // Состояние приложения
    let currentPage = 1;
    let isAdminMode = false;
    let people = [];
    let currentEditIndex = null;
    
    // Элементы DOM
    const elements = {
        loginBtn: document.getElementById('loginBtn'),
        loginForm: document.getElementById('loginForm'),
        adminPassword: document.getElementById('adminPassword'),
        submitLogin: document.getElementById('submitLogin'),
        adminControls: document.getElementById('adminControls'),
        addPersonBtn: document.getElementById('addPersonBtn'),
        addPersonModal: document.getElementById('addPersonModal'),
        editToggle: document.getElementById('editToggle'),
        saveBtn: document.getElementById('saveBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        peopleContainer: document.getElementById('peopleContainer'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        pageInfo: document.getElementById('pageInfo'),
        totalPeople: document.getElementById('totalPeople'),
        currentPage: document.getElementById('currentPage'),
        totalPages: document.getElementById('totalPages'),
        editModal: document.getElementById('editModal'),
        editName: document.getElementById('editName'),
        editOrganization: document.getElementById('editOrganization'),
        editPosition: document.getElementById('editPosition'),
        editPhoto: document.getElementById('editPhoto'),
        saveEdit: document.getElementById('saveEdit'),
        deletePerson: document.getElementById('deletePerson'),
        cancelEdit: document.getElementById('cancelEdit'),
        newPersonName: document.getElementById('newPersonName'),
        newPersonOrganization: document.getElementById('newPersonOrganization'),
        newPersonPosition: document.getElementById('newPersonPosition'),
        newPersonPhoto: document.getElementById('newPersonPhoto'),
        saveNewPerson: document.getElementById('saveNewPerson'),
        cancelNewPerson: document.getElementById('cancelNewPerson')
    };

    // Инициализация данных
    function initializeData() {
        const savedData = localStorage.getItem('radmirPeopleData');
        if (savedData) {
            people = JSON.parse(savedData);
        } else {
            // Стартовые данные
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
        }
        renderPage();
    }

    // Сохранение данных
    function saveData() {
        localStorage.setItem('radmirPeopleData', JSON.stringify(people));
    }

// Рендеринг страницы - ИСПРАВЛЕННАЯ ВЕРСИЯ
function renderPage() {
    const container = elements.peopleContainer;
    container.innerHTML = '';
    
    const totalPages = Math.max(1, Math.ceil(people.length / PEOPLE_PER_PAGE));
    const startIndex = (currentPage - 1) * PEOPLE_PER_PAGE;
    const endIndex = Math.min(startIndex + PEOPLE_PER_PAGE, people.length);
    const pagePeople = people.slice(startIndex, endIndex);
    
    pagePeople.forEach((person, index) => {
        const personIndex = startIndex + index;
        const card = document.createElement('div');
        card.className = 'person-card';
        
        // ВАЖНО: Новая структура HTML с именем внизу
        // В функции renderPage() используйте ЭТУ структуру:
        card.innerHTML = `
            <!-- Контейнер фото с именем ВНУТРИ -->
            <div class="person-img-container">
                <img src="${person.photo}" alt="${person.name}" class="person-img" 
                    onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
        
                <!-- Имя ВНУТРИ контейнера фото, В САМОМ НИЗУ -->
                <div class="person-name">${person.name}</div>
        
                ${isAdminMode ? `<button class="edit-icon" data-index="${personIndex}">
                    <i class="fas fa-pencil-alt"></i>
                </button>` : ''}
            </div>
    
            <!-- Информация ОТДЕЛЬНЫМ блоком ПОД фото -->
            <div class="person-info">
                <div class="person-organization">${person.organization}</div>
                <div class="person-position">${person.position}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Обновление статистики
    elements.totalPeople.textContent = people.length;
    elements.currentPage.textContent = currentPage;
    elements.totalPages.textContent = totalPages;
    
    // Обновление пагинации
    elements.pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    elements.prevBtn.disabled = currentPage === 1;
    elements.nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Обработчики для кнопок редактирования
    if (isAdminMode) {
        document.querySelectorAll('.edit-icon').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                openEditModal(index);
            });
        });
    }
}

    // Открытие модального окна редактирования
    function openEditModal(index) {
        const person = people[index];
        currentEditIndex = index;
        
        elements.editName.value = person.name;
        elements.editOrganization.value = person.organization;
        elements.editPosition.value = person.position;
        elements.editPhoto.value = person.photo;
        
        elements.editModal.classList.remove('hidden');
    }

    // Закрытие модального окна редактирования
    function closeEditModal() {
        elements.editModal.classList.add('hidden');
        currentEditIndex = null;
    }

    // Открытие модального окна добавления
    function openAddPersonModal() {
        elements.newPersonName.value = '';
        elements.newPersonOrganization.value = '';
        elements.newPersonPosition.value = '';
        elements.newPersonPhoto.value = '';
        elements.addPersonModal.classList.remove('hidden');
    }

    // Закрытие модального окна добавления
    function closeAddPersonModal() {
        elements.addPersonModal.classList.add('hidden');
    }

    // Обработчики событий
    elements.loginBtn.addEventListener('click', function() {
        elements.loginForm.classList.toggle('hidden');
    });

    elements.submitLogin.addEventListener('click', function() {
        const password = elements.adminPassword.value;
        if (password === ADMIN_PASSWORD) {
            isAdminMode = true;
            elements.loginForm.classList.add('hidden');
            elements.adminControls.classList.remove('hidden');
            elements.loginBtn.classList.add('hidden');
            renderPage();
            elements.adminPassword.value = '';
        } else {
            alert('Неверный пароль');
        }
    });

    elements.logoutBtn.addEventListener('click', function() {
        isAdminMode = false;
        elements.adminControls.classList.add('hidden');
        elements.loginBtn.classList.remove('hidden');
        elements.saveBtn.classList.add('hidden');
        renderPage();
    });

    elements.addPersonBtn.addEventListener('click', openAddPersonModal);

    elements.editToggle.addEventListener('click', function() {
        elements.saveBtn.classList.toggle('hidden');
        renderPage();
    });

    elements.saveBtn.addEventListener('click', function() {
        saveData();
        alert('Все изменения сохранены!');
    });

    elements.prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });

    elements.nextBtn.addEventListener('click', function() {
        const totalPages = Math.max(1, Math.ceil(people.length / PEOPLE_PER_PAGE));
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    });

    // Редактирование профиля
    elements.saveEdit.addEventListener('click', function() {
        if (currentEditIndex !== null) {
            people[currentEditIndex] = {
                name: elements.editName.value.toUpperCase(),
                organization: elements.editOrganization.value,
                position: elements.editPosition.value,
                photo: elements.editPhoto.value
            };
            
            saveData();
            renderPage();
            closeEditModal();
        }
    });

    elements.deletePerson.addEventListener('click', function() {
        if (currentEditIndex !== null && confirm('Вы уверены, что хотите удалить этого участника?')) {
            people.splice(currentEditIndex, 1);
            saveData();
            renderPage();
            closeEditModal();
        }
    });

    elements.cancelEdit.addEventListener('click', closeEditModal);

    // Добавление нового участника
    elements.saveNewPerson.addEventListener('click', function() {
        const name = elements.newPersonName.value.trim();
        const organization = elements.newPersonOrganization.value.trim();
        const position = elements.newPersonPosition.value.trim();
        const photo = elements.newPersonPhoto.value.trim();
        
        if (!name || !organization || !position || !photo) {
            alert('Пожалуйста, заполните все поля!');
            return;
        }
        
        const newPerson = {
            name: name.toUpperCase(),
            organization: organization,
            position: position,
            photo: photo
        };
        
        people.push(newPerson);
        saveData();
        
        // Переход на последнюю страницу с новым участником
        currentPage = Math.ceil(people.length / PEOPLE_PER_PAGE);
        renderPage();
        
        closeAddPersonModal();
        alert('Новый участник успешно добавлен!');
    });

    elements.cancelNewPerson.addEventListener('click', closeAddPersonModal);

    // Закрытие модальных окон при клике вне их
    elements.editModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });

    elements.addPersonModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddPersonModal();
        }
    });

    // Инициализация
    initializeData();
});