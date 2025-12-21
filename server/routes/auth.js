const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db/connection');

// ============ РЕГИСТРАЦИЯ ============
router.post('/register', async (req, res) => {
    const { email, password, full_name, phone } = req.body;

    try {
        // Валидация входных данных
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email и пароль обязательны' 
            });
        }

        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: 'Пароль должен быть не менее 8 символов' 
            });
        }

        // Проверка, существует ли пользователь
        const [existingUsers] = await db.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Пользователь с таким email уже существует' 
            });
        }

        // Хэширование пароля (10 раундов)
        const password_hash = await bcrypt.hash(password, 10);

        // Вставка пользователя в таблицу users
        const [result] = await db.query(
            'INSERT INTO users (email, password_hash, is_active) VALUES (?, ?, TRUE)',
            [email, password_hash]
        );

        const user_id = result.insertId;

        // Если указаны ФИО или телефон, добавляем в user_profiles
        if (full_name || phone) {
            await db.query(
                'INSERT INTO user_profiles (user_id, full_name, phone) VALUES (?, ?, ?)',
                [user_id, full_name || null, phone || null]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                user_id,
                email,
                full_name: full_name || null,
                phone: phone || null
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера при регистрации' 
        });
    }
});

// ============ ВХОД (LOGIN) ============
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email и пароль обязательны' 
            });
        }

        // Поиск пользователя
        const [users] = await db.query(
            'SELECT user_id, email, password_hash, is_active FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Неверный email или пароль' 
            });
        }

        const user = users[0];

        // Проверка активности аккаунта
        if (!user.is_active) {
            return res.status(403).json({ 
                success: false, 
                message: 'Аккаунт деактивирован' 
            });
        }

        // Сравнение пароля
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Неверный email или пароль' 
            });
        }

        // Генерация токена сессии
        const session_token = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // +1 день

        // Сохранение сессии
        await db.query(
            `INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) 
             VALUES (?, ?, ?, ?, ?)`,
            [user.user_id, session_token, req.ip, req.headers['user-agent'] || '', expires_at]
        );

        // Обновление времени последнего входа
        await db.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
            [user.user_id]
        );

        // Получение профиля пользователя
        const [profiles] = await db.query(
            'SELECT full_name, phone FROM user_profiles WHERE user_id = ?',
            [user.user_id]
        );

        const profile = profiles[0] || {};

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            token: session_token,
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: profile.full_name || null,
                phone: profile.phone || null
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера при входе' 
        });
    }
});

// ============ MIDDLEWARE ПРОВЕРКИ ТОКЕНА ============
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Токен не предоставлен' 
        });
    }

    try {
        // Поиск сессии
        const [sessions] = await db.query(
            `SELECT s.user_id, s.expires_at, u.email, u.is_active, p.full_name, p.phone
             FROM user_sessions s
             JOIN users u ON s.user_id = u.user_id
             LEFT JOIN user_profiles p ON u.user_id = p.user_id
             WHERE s.session_token = ?`,
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Недействительный токен' 
            });
        }

        const session = sessions[0];

        // Проверка срока действия
        if (new Date(session.expires_at) < new Date()) {
            return res.status(401).json({ 
                success: false, 
                message: 'Токен истёк' 
            });
        }

        // Проверка активности пользователя
        if (!session.is_active) {
            return res.status(403).json({ 
                success: false, 
                message: 'Аккаунт деактивирован' 
            });
        }

        // Добавление данных пользователя в req
        req.user = {
            user_id: session.user_id,
            email: session.email,
            full_name: session.full_name,
            phone: session.phone
        };

        next();

    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка проверки токена' 
        });
    }
}

// ============ ПОЛУЧЕНИЕ ПРОФИЛЯ ============
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.user_id, u.email, u.created_at, u.last_login, p.full_name, p.phone
             FROM users u
             LEFT JOIN user_profiles p ON u.user_id = p.user_id
             WHERE u.user_id = ?`,
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Пользователь не найден' 
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка получения данных' 
        });
    }
});

// ============ ВЫХОД (LOGOUT) ============
router.post('/logout', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(400).json({ 
            success: false, 
            message: 'Токен не предоставлен' 
        });
    }

    try {
        // Удаление сессии
        await db.query(
            'DELETE FROM user_sessions WHERE session_token = ?',
            [token]
        );

        res.json({
            success: true,
            message: 'Выход выполнен успешно'
        });

    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка при выходе' 
        });
    }
});

module.exports = router;
