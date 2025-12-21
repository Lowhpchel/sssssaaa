document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Сохранение токена в localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userEmail', data.user.email);

                alert('Вход выполнен успешно!');
                window.location.href = '/pages/profile.html';
            } else {
                alert(`Ошибка: ${data.message}`);
            }

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    });
});
