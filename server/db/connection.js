const mysql = require('mysql2/promise');
require('dotenv').config();

// Создание пула соединений для эффективной работы с БД
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Проверка подключения
pool.getConnection()
    .then(connection => {
        console.log('✅ Успешное подключение к базе данных MySQL');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Ошибка подключения к БД:', err.message);
        console.error('Проверьте параметры в .env файле');
    });

module.exports = pool;
