// Основные переменные состояния
let currentUser = null;
let isLoggedIn = false;
let activeModal = null;
let financeChart = null;

// Демо-данные для новостей
const newsData = {
    1: {
        title: "Газпром и CNPC подписали новое соглашение о стратегическом сотрудничестве",
        date: "15 мая 2024",
        content: "В рамках Восточного экономического форума ПАО «Газпром» и Китайская национальная нефтегазовая корпорация (CNPC) подписали Дополнительное соглашение к Договору о поставках природного газа по «восточному» маршруту (магистральный газопровод «Сила Сибири»). Документ предусматривает расширение взаимодействия в области поставок природного газа, реализации совместных проектов в сфере газовой инфраструктуры и развития газомоторного топлива. Стороны также обсудили перспективы сотрудничества в области водородной энергетики и decarbonization.",
        image: "Фото: Подписание соглашения"
    },
    2: {
        title: "Запущен новый участок газопровода «Сила Сибири»",
        date: "14 мая 2024",
        content: "Введен в эксплуатацию участок магистрального газопровода «Сила Сибири» протяженностью 150 км в Амурской области. Это позволит увеличить пропускную способность газотранспортной системы и обеспечить надежные поставки газа потребителям Дальнего Востока. Строительство велось с применением самых современных технологий, включая автоматизированные системы контроля и управления. Новый участок включает 3 компрессорные станции и 15 запорных кранов.",
        image: "Фото: Газопровод «Сила Сибири»"
    },
    3: {
        title: "Газпром повышает эффективность добычи на месторождениях Ямала",
        date: "13 мая 2024",
        content: "Благодаря внедрению инновационных технологий бурения и добычи, ПАО «Газпром» увеличил добычу на Бованенковском месторождении на 5%. Были применены технологии горизонтального бурения с многостадийным гидроразрывом пласта, что позволило повысить продуктивность скважин. Также внедрена система интеллектуального управления месторождением, которая в реальном времени оптимизирует режимы добычи. Это позволит увеличить извлекаемые запасы и продлить срок эксплуатации месторождения.",
        image: "Фото: Бованенковское месторождение"
    }
};

// Финансовые данные для графиков
const financeData = {
    quarter: {
        labels: ['Q4 2023', 'Q1 2024', 'Q2 2024', 'Прогноз Q3 2024'],
        revenue: [2600, 2800, 2750, 2900],
        profit: [750, 850, 800, 900],
        capex: [330, 320, 310, 300],
        dividends: [20.5, 24.5, 22.0, 25.0]
    },
    year: {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        revenue: [6500, 8200, 10200, 11000, 11500],
        profit: [1200, 2100, 2300, 2500, 2800],
        capex: [1400, 1250, 1300, 1350, 1280],
        dividends: [16.2, 18.5, 19.8, 20.5, 24.5]
    },
    '5years': {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        revenue: [5200, 6500, 8200, 10200, 11000],
        profit: [950, 1200, 2100, 2300, 2500],
        capex: [1500, 1400, 1250, 1300, 1350],
        dividends: [12.5, 16.2, 18.5, 19.8, 20.5]
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    checkLoginStatus();
    updateStockPrice();
    initFinanceChart('quarter');
    
    // Обновляем время работы каждый день
    setInterval(updateStockPrice, 60000); // Каждую минуту
});

// Инициализация всех обработчиков событий
function initEventListeners() {
    // Кнопка личного кабинета
    document.getElementById('login-btn').addEventListener('click', showLoginModal);
    document.getElementById('mobile-login')?.addEventListener('click', showLoginModal);
    
    // Модальные окна
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    document.querySelectorAll('.modal-trigger').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('href');
            showModal(modalId.replace('#', ''));
        });
    });
    
    // Модальные окна через data-атрибуты
    document.querySelectorAll('[data-modal]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            showModal(modalId + '-modal');
        });
    });
    
    // Переключение языка
    document.getElementById('language-toggle')?.addEventListener('click', function(e) {
        e.preventDefault();
        toggleLanguage();
    });
    
    // Поиск
    document.getElementById('search-toggle')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('search-form').classList.toggle('active');
    });
    
    document.getElementById('search-close')?.addEventListener('click', function() {
        document.getElementById('search-form').classList.remove('active');
    });
    
    document.getElementById('search-form-element')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = document.getElementById('search-input').value;
        if (query.trim()) {
            performSearch(query);
        }
    });
    
    // Форма авторизации
    document.getElementById('login-form-element')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        loginUser(username, password);
    });
    
    // Регистрация
    document.getElementById('show-register')?.addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
    });
    
    document.getElementById('show-login')?.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
    
    document.getElementById('show-forgot')?.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotForm();
    });
    
    document.getElementById('show-login-from-forgot')?.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
    
    document.getElementById('register-form-element')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        registerUser(email, password);
    });
    
    // Выход из системы
    document.getElementById('logout-btn')?.addEventListener('click', logoutUser);
    
    // Табы в личном кабинете
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Форма обратной связи
    document.getElementById('feedback-form-element')?.addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback();
    });
    
    // Форма профиля
    document.getElementById('profile-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });
    
    // Кнопка скачивания отчета
    document.getElementById('download-report')?.addEventListener('click', function(e) {
        e.preventDefault();
        downloadReport();
    });
    
    // Новости
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const newsId = this.getAttribute('data-news');
            showNewsModal(newsId);
        });
    });
    
    // Финансовые периоды
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            changeFinancePeriod(period);
        });
    });
    
    // Финансовые карточки (графики)
    document.querySelectorAll('[data-chart]').forEach(card => {
        card.addEventListener('click', function() {
            const chartType = this.getAttribute('data-chart');
            showFinanceChart(chartType);
        });
    });
    
    // Мобильное меню
    document.querySelector('.mobile-menu-toggle').addEventListener('click', openMobileMenu);
    document.querySelector('.mobile-menu-close').addEventListener('click', closeMobileMenu);
    document.querySelector('.mobile-menu-overlay').addEventListener('click', closeMobileMenu);
    
    // Закрытие модальных окон по клику на оверлей
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
    
    // Уведомления
    document.getElementById('notification-close')?.addEventListener('click', function() {
        hideNotification();
    });
}

// ==================== ФУНКЦИИ АВТОРИЗАЦИИ ====================

function checkLoginStatus() {
    const savedUser = localStorage.getItem('gazprom_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateLoginUI();
    }
}

function loginUser(username, password) {
    // Демо-авторизация
    if (username === 'demo' && password === 'demo123') {
        currentUser = {
            id: 1,
            name: 'Демо Пользователь',
            email: 'demo@gazprom.ru',
            company: 'ООО "Демо Компания"',
            phone: '+7 (900) 123-45-67',
            joined: '2024-05-01'
        };
        
        localStorage.setItem('gazprom_user', JSON.stringify(currentUser));
        isLoggedIn = true;
        
        closeModal();
        showAccountModal();
        updateLoginUI();
        showNotification('Успешный вход в систему!', 'success');
        
        return true;
    } else {
        showNotification('Неверный логин или пароль', 'error');
        return false;
    }
}

function registerUser(email, password) {
    if (!email || !password) {
        showNotification('Заполните все поля', 'error');
        return false;
    }
    
    if (password.length < 8) {
        showNotification('Пароль должен содержать не менее 8 символов', 'error');
        return false;
    }
    
    // Демо-регистрация
    currentUser = {
        id: Date.now(),
        name: email.split('@')[0],
        email: email,
        company: '',
        phone: '',
        joined: new Date().toISOString().split('T')[0]
    };
    
    localStorage.setItem('gazprom_user', JSON.stringify(currentUser));
    isLoggedIn = true;
    
    showLoginForm();
    showNotification('Регистрация успешна! Войдите в систему.', 'success');
    return true;
}

function logoutUser() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('gazprom_user');
    
    closeModal();
    updateLoginUI();
    showNotification('Вы вышли из системы', 'info');
}

function updateLoginUI() {
    const loginBtn = document.getElementById('login-btn');
    if (isLoggedIn && currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name.split(' ')[0]}`;
        loginBtn.addEventListener('click', showAccountModal);
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Личный кабинет';
        loginBtn.removeEventListener('click', showAccountModal);
        loginBtn.addEventListener('click', showLoginModal);
    }
}

// ==================== МОДАЛЬНЫЕ ОКНА ====================

function showModal(modalId) {
    closeModal();
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        activeModal = modalId;
        document.body.style.overflow = 'hidden';
        
        // Инициализация табов для личного кабинета
        if (modalId === 'account-modal') {
            switchTab('profile');
        }
    }
}

function closeModal() {
    if (activeModal) {
        const modal = document.getElementById(activeModal);
        if (modal) {
            modal.classList.remove('active');
        }
        activeModal = null;
    }
    document.body.style.overflow = 'auto';
    
    // Закрываем все модальные окна на всякий случай
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function showLoginModal() {
    if (isLoggedIn) {
        showAccountModal();
    } else {
        showModal('login-modal');
        showLoginForm();
    }
}

function showAccountModal() {
    if (!isLoggedIn) {
        showLoginModal();
        return;
    }
    
    // Обновляем данные пользователя в модальном окне
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('first-name').value = currentUser.name.split(' ')[0] || '';
        document.getElementById('last-name').value = currentUser.name.split(' ')[1] || '';
        document.getElementById('company').value = currentUser.company || '';
        document.getElementById('phone').value = currentUser.phone || '';
        
        const memberDate = new Date(currentUser.joined);
        const options = { year: 'numeric', month: 'long' };
        document.querySelector('.member-since').textContent = 
            `Участник с ${memberDate.toLocaleDateString('ru-RU', options)}`;
    }
    
    showModal('account-modal');
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-form').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('forgot-form').style.display = 'none';
}

function showForgotForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-form').style.display = 'block';
}

// ==================== ТАБЫ ====================

function switchTab(tabId) {
    // Обновляем активные кнопки табов
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Активируем выбранный таб
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// ==================== ФИНАНСОВЫЕ ГРАФИКИ ====================

function initFinanceChart(period) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    const data = financeData[period];
    
    if (financeChart) {
        financeChart.destroy();
    }
    
    financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Выручка, млрд ₽',
                    data: data.revenue,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Чистая прибыль, млрд ₽',
                    data: data.profit,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Финансовые показатели'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('ru-RU') + ' млрд ₽';
                        }
                    }
                }
            }
        }
    });
}

function changeFinancePeriod(period) {
    // Обновляем активную кнопку
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.period-btn[data-period="${period}"]`).classList.add('active');
    
    // Обновляем график
    initFinanceChart(period);
}

function showFinanceChart(chartType) {
    const chartContainer = document.getElementById('finance-chart');
    chartContainer.style.display = 'block';
    chartContainer.scrollIntoView({ behavior: 'smooth' });
}

// ==================== НОВОСТИ ====================

function showNewsModal(newsId) {
    const news = newsData[newsId];
    if (!news) return;
    
    // Создаем модальное окно для новости
    const modalHtml = `
        <div class="modal active" id="news-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-newspaper"></i> Новость</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <span class="news-date">${news.date}</span>
                    <h4>${news.title}</h4>
                    <div class="news-image-large">
                        ${news.image}
                    </div>
                    <p>${news.content}</p>
                    <div class="news-share">
                        <button class="btn-outline"><i class="fas fa-print"></i> Печать</button>
                        <button class="btn-outline"><i class="fas fa-share-alt"></i> Поделиться</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Добавляем обработчики событий
    modalContainer.querySelector('.modal-close').addEventListener('click', function() {
        document.getElementById('news-modal').remove();
        document.body.style.overflow = 'auto';
    });
    
    modalContainer.querySelector('.modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
            document.body.style.overflow = 'auto';
        }
    });
    
    document.body.style.overflow = 'hidden';
}

// ==================== ФОРМЫ ====================

function submitFeedback() {
    const topic = document.getElementById('feedback-topic').value;
    const name = document.getElementById('feedback-name').value;
    const email = document.getElementById('feedback-email').value;
    const message = document.getElementById('feedback-message').value;
    
    if (!topic || !name || !email || !message) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }
    
    // Демо-отправка
    console.log('Обращение отправлено:', { topic, name, email, message });
    
    closeModal();
    showNotification('Ваше обращение отправлено. Мы ответим в течение 3 рабочих дней.', 'success');
    
    // Очищаем форму
    document.getElementById('feedback-form-element').reset();
}

function saveProfile() {
    if (!currentUser) return;
    
    currentUser.name = `${document.getElementById('first-name').value} ${document.getElementById('last-name').value}`;
    currentUser.company = document.getElementById('company').value;
    currentUser.phone = document.getElementById('phone').value;
    
    localStorage.setItem('gazprom_user', JSON.stringify(currentUser));
    
    showNotification('Профиль успешно сохранен', 'success');
    updateLoginUI();
}

function downloadReport() {
    showNotification('Началась загрузка годового отчета 2023...', 'info');
    
    // Демо-загрузка
    setTimeout(() => {
        showNotification('Отчет успешно скачан', 'success');
    }, 1500);
}

// ==================== ДРУГИЕ ФУНКЦИИ ====================

function toggleLanguage() {
    const langBtn = document.getElementById('language-toggle');
    const currentLang = langBtn.textContent.includes('English') ? 'ru' : 'en';
    
    if (currentLang === 'ru') {
        langBtn.innerHTML = '<i class="fas fa-globe"></i> Русский';
        showNotification('Сайт переключен на английский язык', 'info');
    } else {
        langBtn.innerHTML = '<i class="fas fa-globe"></i> English';
        showNotification('Сайт переключен на русский язык', 'info');
    }
}

function performSearch(query) {
    showNotification(`Поиск: "${query}" - найдено 24 результата`, 'info');
    document.getElementById('search-form').classList.remove('active');
    document.getElementById('search-input').value = '';
}

function updateStockPrice() {
    // Генерируем случайное изменение цены
    const change = (Math.random() - 0.5) * 2;
    const price = 198.45 + change;
    const changeElement = document.querySelector('.stock-change');
    
    changeElement.textContent = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
    changeElement.className = `stock-change ${change >= 0 ? 'positive' : 'negative'}`;
    
    document.querySelector('.stock-price').textContent = `${price.toFixed(2)} ₽`;
}

function hideNotification() {
    document.getElementById('notification').classList.remove('show');
}

// Демо-данные для инициализации
window.demoLogin = function() {
    document.getElementById('username').value = 'demo';
    document.getElementById('password').value = 'demo123';
    loginUser('demo', 'demo123');
};

// ============================================
// УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ
// ============================================

// Получение элементов модальных окон
const loginModal = document.getElementById('login-modal');
const accountModal = document.getElementById('account-modal');

// Формы
const loginFormElement = document.getElementById('login-form-element');
const registerFormElement = document.getElementById('register-form-element');
const forgotFormElement = document.getElementById('forgot-form-element');

// Контейнеры форм
const loginFormDiv = document.getElementById('login-form');
const registerFormDiv = document.getElementById('register-form');
const forgotFormDiv = document.getElementById('forgot-form');

// Переключение между формами
document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.style.display = 'none';
    registerFormDiv.style.display = 'block';
    forgotFormDiv.style.display = 'none';
});

document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.style.display = 'block';
    registerFormDiv.style.display = 'none';
    forgotFormDiv.style.display = 'none';
});

document.getElementById('show-forgot')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.style.display = 'none';
    registerFormDiv.style.display = 'none';
    forgotFormDiv.style.display = 'block';
});

document.getElementById('show-login-from-forgot')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormDiv.style.display = 'block';
    registerFormDiv.style.display = 'none';
    forgotFormDiv.style.display = 'none';
});

// Закрытие модальных окон
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        accountModal.style.display = 'none';
    });
});

// Закрытие при клике вне модального окна
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === accountModal) {
        accountModal.style.display = 'none';
    }
});

// ============================================
// РЕГИСТРАЦИЯ
// ============================================

registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm').value;

    // Валидация на фронте
    if (password !== confirmPassword) {
        alert('❌ Пароли не совпадают');
        return;
    }

    if (password.length < 8) {
        alert('❌ Пароль должен быть не менее 8 символов');
        return;
    }

    try {
        console.log('📤 Отправка запроса на регистрацию...');
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();
        console.log('📥 Ответ сервера:', data);

        if (data.success) {
            alert('✅ Регистрация успешна! Теперь вы можете войти.');
            
            // Очистка формы
            registerFormElement.reset();
            
            // Переключение на форму входа
            loginFormDiv.style.display = 'block';
            registerFormDiv.style.display = 'none';
            
            // Автозаполнение email в форме входа
            document.getElementById('username').value = email;
        } else {
            alert(`❌ Ошибка регистрации: ${data.message}`);
        }

    } catch (error) {
        console.error('❌ Ошибка при регистрации:', error);
        alert('❌ Ошибка соединения с сервером. Проверьте, запущен ли сервер.');
    }
});

// ============================================
// ВХОД (АВТОРИЗАЦИЯ)
// ============================================

loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('❌ Заполните все поля');
        return;
    }

    try {
        console.log('📤 Отправка запроса на вход...');
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();
        console.log('📥 Ответ сервера:', data);

        if (data.success) {
            // Сохранение токена и данных пользователя
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', data.user.full_name || 'Пользователь');
            localStorage.setItem('userId', data.user.user_id);

            alert('✅ Вход выполнен успешно!');
            
            // Закрытие модального окна входа
            loginModal.style.display = 'none';
            
            // Загрузка профиля и открытие личного кабинета
            await loadUserProfile();
            accountModal.style.display = 'flex';
            
            // Очистка формы
            loginFormElement.reset();
            
        } else {
            alert(`❌ Ошибка входа: ${data.message}`);
        }

    } catch (error) {
        console.error('❌ Ошибка при входе:', error);
        alert('❌ Ошибка соединения с сервером. Проверьте, запущен ли сервер.');
    }
});

// ============================================
// ЗАГРУЗКА ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ
// ============================================

async function loadUserProfile() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.log('❌ Токен не найден');
        return false;
    }

    try {
        console.log('📤 Загрузка профиля пользователя...');
        
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('📥 Данные профиля:', data);

        if (data.success) {
            // Обновление данных в модальном окне
            document.getElementById('user-name').textContent = data.user.full_name || data.user.email;
            
            // Обновление профиля
            const profileInfo = document.querySelector('.profile-info h4');
            if (profileInfo) {
                profileInfo.textContent = data.user.full_name || data.user.email;
            }
            
            const profileEmail = document.querySelector('.profile-info p');
            if (profileEmail) {
                profileEmail.textContent = data.user.email;
            }
            
            // Дата регистрации
            const memberSince = document.querySelector('.member-since');
            if (memberSince && data.user.created_at) {
                const date = new Date(data.user.created_at);
                const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                               'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                memberSince.textContent = `Участник с ${months[date.getMonth()]} ${date.getFullYear()}`;
            }
            
            // Заполнение формы профиля
            if (data.user.full_name) {
                const nameParts = data.user.full_name.split(' ');
                const firstNameInput = document.getElementById('first-name');
                const lastNameInput = document.getElementById('last-name');
                
                if (firstNameInput && nameParts[0]) {
                    firstNameInput.value = nameParts[0];
                }
                if (lastNameInput && nameParts[1]) {
                    lastNameInput.value = nameParts[1];
                }
            }
            
            const phoneInput = document.getElementById('phone');
            if (phoneInput && data.user.phone) {
                phoneInput.value = data.user.phone;
            }
            
            return true;
        } else {
            console.log('❌ Ошибка загрузки профиля:', data.message);
            
            // Если токен недействителен, очищаем и выходим
            if (response.status === 401) {
                localStorage.clear();
                alert('❌ Сессия истекла. Войдите снова.');
            }
            return false;
        }

    } catch (error) {
        console.error('❌ Ошибка при загрузке профиля:', error);
        return false;
    }
}

// ============================================
// ВЫХОД (LOGOUT)
// ============================================

document.getElementById('logout-btn')?.addEventListener('click', async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Если токена нет, просто очищаем и закрываем
        localStorage.clear();
        accountModal.style.display = 'none';
        return;
    }

    try {
        console.log('📤 Выход из системы...');
        
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('📥 Ответ сервера:', data);

        if (data.success) {
            alert('✅ Вы вышли из системы');
        }

    } catch (error) {
        console.error('❌ Ошибка при выходе:', error);
    } finally {
        // В любом случае очищаем localStorage и закрываем модалку
        localStorage.clear();
        accountModal.style.display = 'none';
        
        // Сброс формы входа
        loginFormElement.reset();
    }
});

// ============================================
// ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ЗАГРУЗКЕ
// ============================================

window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        console.log('🔍 Найден токен, проверка авторизации...');
        const isValid = await loadUserProfile();
        
        if (!isValid) {
            console.log('❌ Токен недействителен, требуется повторный вход');
            localStorage.clear();
        } else {
            console.log('✅ Пользователь авторизован');
        }
    }
});

// ============================================
// ОТКРЫТИЕ МОДАЛЬНЫХ ОКОН ПО КЛИКУ
// ============================================

// Если у вас есть кнопка "Войти" в хедере
document.querySelector('[data-modal="login"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    
    if (token) {
        // Если пользователь авторизован, открываем личный кабинет
        loadUserProfile();
        accountModal.style.display = 'flex';
    } else {
        // Если не авторизован, открываем форму входа
        loginModal.style.display = 'flex';
    }
});

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ТАБОВ В ЛИЧНОМ КАБИНЕТЕ
// ============================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Удаление активного класса у всех кнопок и контента
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Добавление активного класса
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId)?.classList.add('active');
    });
});

// ============================================
// СОХРАНЕНИЕ ИЗМЕНЕНИЙ ПРОФИЛЯ
// ============================================

document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const phone = document.getElementById('phone').value;
    
    // Здесь можно добавить запрос на обновление профиля
    alert('✅ Изменения сохранены (функция обновления профиля - в разработке)');
    
    console.log('Обновленные данные:', {
        firstName,
        lastName,
        phone
    });
});

console.log('✅ Скрипт авторизации загружен');
