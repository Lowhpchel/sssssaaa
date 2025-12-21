document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;

        // Валидация на фронте
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        if (password.length < 8) {
            alert('Пароль должен быть не менее 8 символов');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    phone
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Регистрация успешна! Переход на страницу входа...');
                window.location.href = '/pages/login.html';
            } else {
                alert(`Ошибка: ${data.message}`);
            }

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    });
});
