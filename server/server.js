const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Раздача статических файлов из корня проекта
app.use(express.static(path.join(__dirname, '..')));

// Подключение роутера авторизации
app.use('/api/auth', authRoutes);

// Главная страница (редирект на логин)
app.get('/', (req, res) => {
    res.redirect('/pages/login.html');
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Маршрут не найден' 
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📄 Страница логина: http://localhost:${PORT}/pages/login.html`);
});
