document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');

    // Проверка наличия токена
    if (!token) {
        alert('Вы не авторизованы');
        window.location.href = '/pages/login.html';
        return;
    }

    try {
        // Получение данных пользователя
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            // Отображение данных пользователя
            document.getElementById('userEmail').textContent = data.user.email;
            document.getElementById('userName').textContent = data.user.full_name || 'Не указано';
            document.getElementById('userPhone').textContent = data.user.phone || 'Не указано';
            document.getElementById('userCreated').textContent = new Date(data.user.created_at).toLocaleDateString('ru-RU');
        } else {
            alert('Ошибка загрузки данных');
            localStorage.removeItem('authToken');
            window.location.href = '/pages/login.html';
        }

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка соединения с сервером');
    }

    // Обработчик выхода
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                alert('Вы вышли из системы');
                window.location.href = '/pages/login.html';
            }

        } catch (error) {
            console.error('Ошибка:', error);
            // Удаляем токен даже при ошибке
            localStorage.removeItem('authToken');
            window.location.href = '/pages/login.html';
        }
    });
});
