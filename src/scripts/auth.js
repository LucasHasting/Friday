//localStorage is defined in ./file_handling.js - make sure it comes first!

// Show message to user
function showMessage(message, type = 'info') {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        messagesDiv.innerHTML = '';
    }, 5000);
}

// Logout User
function logout() {        
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');    

    window.location.href = "/";
}

//LOGIN PAGE
if(window.location.href.indexOf("/login") != -1){

    // CREATE - Register new user
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (response.ok) {
                showMessage(`✅ Account created successfully! You can now login.`, 'success');
                document.getElementById('registerForm').reset();
            } else {
                showMessage(`❌ Registration failed: ${result.error}`, 'danger');
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }
    });

    // Login user
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                // Store token in localStorage
                localStorage.setItem('jwtToken', result.token);
                localStorage.setItem('username', result.username);
                window.location.href = "/";
            } else {
                showMessage(`❌ Login failed: ${result.error}`, 'danger');
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }
    });
}

//ACCOUNT PAGE
else if(window.location.href.indexOf("/account") != -1){
    // Logout user
    document.getElementById('Logout').addEventListener('submit', async (e) => {
        e.preventDefault();

        logout();
    });

    // Update user
    document.getElementById('Update').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('UpdatePassword').value;
        const new_password = document.getElementById('UpdateNewPassword').value;
        const token = localStorage.getItem('jwtToken');
        const username = localStorage.getItem('username');
        
        try {
            const response = await fetch('/api/users/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, new_password })
            });

            const result = await response.json();

            if (response.ok) {
                logout();
            } else {
                showMessage(`❌ Update failed: ${result.error}`, 'danger');
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }

    });

    // Delete user
    document.getElementById('Delete').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtToken');
        const username = localStorage.getItem('username');

        try {
            const response = await fetch('/api/users/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username })
            });

            const result = await response.json();

            if (response.ok) {
                logout();
            } else {
                showMessage(`❌ Delete failed: ${result.error}`, 'danger');
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }
    });
}