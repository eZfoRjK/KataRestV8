document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user')
        .then(response => response.json())
        .then(user => populateUserTable(user))
        .catch(error => console.error('Error fetching user data:', error));
});

function populateUserTable(user) {
    const userTableBody = document.getElementById('user-table-body');

    // const roles = Array.isArray(user.roles) ? user.roles : [];
    const roles = user.roles || [];

    const userRow = `<tr>
           <td>${user.id}</td>
           <td>${user.name}</td>
           <td>${user.lastName}</td>
           <td>${user.age}</td>
           <td>${user.login}</td>
           <td>${roles.map(role => `
                            <span class="badge bg-primary">${role.role}</span>`).join(' ')}
           </td>
       </tr>`;

    userTableBody.innerHTML = userRow;
}
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user')
        .then(response => response.json())
        .then(user => populateUserTable(user))
        .catch(error => console.error('Error fetching user data:', error));
});