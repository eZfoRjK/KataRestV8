document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

//TABLE
function loadUsers() {
    fetch('/api/admin/users')
        .then(response => response.json())
        .then(users => {
            let usersTableBody = document.getElementById('usersTableBody');
            usersTableBody.innerHTML = '';
            users.forEach(user => {

                let roles = user.roles.map(role => role.role).join(', ');
                let row = `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.login}</td>
                        <td>${user.name}</td>
                        <td>${user.lastName}</td>
                        <td>${user.age}</td>
                        <td>${roles}</td>
                        <td class="d-flex justify-content-between">
                            <button class="btn btn-danger btn-sm delete-user-button" data-id="${user.id}">Delete</button>
                            <button class="btn btn-warning btn-sm edit-user-button" data-id="${user.id}">Edit</button>
                        </td>
                        
                    </tr>
                `;
                usersTableBody.innerHTML += row;
            });

            // Привязка событий на кнопки
            attachEventListeners();
        })
        .catch(error => console.error('Error fetching users:', error));
}

//NEW
document.addEventListener('DOMContentLoaded', () => {
    loadUsers(); // Загрузить пользователей в таблу
    document.querySelector('#newUser form').addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(event) {
    event.preventDefault();

    let user = {
        login: document.getElementById('login').value,
        name: document.getElementById('name').value,
        lastName: document.getElementById('lastName').value,
        age: parseInt(document.getElementById('age').value),
        password: document.getElementById('password').value,
        roles: Array.from(document.getElementById('roles').selectedOptions).map(option => {
            return {id: parseInt(option.value)};
        })
    };

    addUser(user);
}

function addUser(user) {
    fetch('/api/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error adding user');
            }
            return response.json();
        })
        .then(newUser => {
            loadUsers(); // если успешно добавлен, то обновляем таблицу
            document.getElementById('addUserForm').reset(); // Очистить
        })
        .catch(error => console.error('Error adding user:', error));
}

//EDIT
document.addEventListener('DOMContentLoaded', () => {
    // привязка событий на кнопки
    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('edit-user-button')) {
            const userId = event.target.getAttribute('data-id');
            fetch(`/api/admin/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    // Заполняем поля модального окна данными пользователя
                    document.getElementById('editUserId').value = user.id;
                    document.getElementById('editUserName').value = user.name;
                    document.getElementById('editUserLastName').value = user.lastName;
                    document.getElementById('editUserLogin').value = user.login;
                    document.getElementById('editUserAge').value = user.age;
                    document.getElementById('editUserPassword').value = '';

                    const roleSelect = document.getElementById('editUserRoles');
                    Array.from(roleSelect.options).forEach(option => {
                        option.selected = user.roles.some(role => role.id === parseInt(option.value));
                    });

                    // модальное окно
                    const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
                    editModal.show();
                })
                .catch(error => console.error('Ошибка при получении данных пользователя:', error));
        }
    });

    // сохранения изменений
    document.getElementById('saveEditButton').addEventListener('click', function () {
        const userId = document.getElementById('editUserId').value;
        const updatedUser = {
            id: userId,
            name: document.getElementById('editUserName').value,
            lastName: document.getElementById('editUserLastName').value,
            login: document.getElementById('editUserLogin').value,
            age: parseInt(document.getElementById('editUserAge').value),
            password: document.getElementById('editUserPassword').value,
            roles: Array.from(document.getElementById('editUserRoles').selectedOptions).map(option => {
                return {id: parseInt(option.value)};
            })
        };

        fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при обновлении пользователя');
                }
                loadUsers();
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                editModal.hide(); // Закрыт окно
            })
            .catch(error => console.error('Ошибка при обновлении пользователя:', error));
    });
});

//DELETE
document.addEventListener('DOMContentLoaded', () => {
    // привязка событий
    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('delete-user-button')) {
            const userId = event.target.getAttribute('data-id');
            fetch(`/api/admin/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    // заполнение
                    document.getElementById('deleteUserId').value = user.id;
                    document.getElementById('deleteUserName').value = user.name;
                    document.getElementById('deleteUserLastName').value = user.lastName;
                    document.getElementById('deleteUserLogin').value = user.login;

                    // модальное окно
                    const deleteModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
                    deleteModal.show();
                })
                .catch(error => console.error('Ошибка при получении данных пользователя:', error));
        }
    });

    // удаление
    document.getElementById('confirmDeleteButton').addEventListener('click', function () {
        const userId = document.getElementById('deleteUserId').value;

        fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при удалении пользователя');
                }
                loadUsers(); // Перезагрузить таблицу пользователей
                const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
                deleteModal.hide(); // Закрыть модальное окно
            })
            .catch(error => console.error('Ошибка при удалении пользователя:', error));
    });
});



