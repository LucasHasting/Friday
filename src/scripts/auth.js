//localStorage is defined in ./file_handling.js - make sure it comes first!

//function used for modular exponentation - used to RSA encryption
function modExp(base, exponent, modulus) {
  if (modulus === 1n) return 0; 
  let result = 1n;
  base %= modulus; 

  while (exponent > 0n) {
    if (exponent % 2n === 1n) { 
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus; 
    exponent = BigInt(exponent / 2n); 
  }
  return result;
}

//function used to encrypt a character using RSA encryption
function encrypt_character(c){
    //public key
    let n = 2222694138841018691n;  
    let e = 1837001105716858171n;
    let step = 20;

    //encrypt chacater
    let s = (modExp(BigInt(c.charCodeAt(0)), e, n)).toString(); 
    
    //pad 0's - makes it easier to decrypt, 20 character chunks -> 1 character
    while(s.length < step){ s = '0' + s; }
    return s;
}

//encrypt a JSON object using RSA encryption
function encrypt_json(data){
    //parse data in JSON format
    data = JSON.parse(JSON.stringify(data));
    let encrypted = {};

    //for everything in the object
    Object.keys(data).forEach(key => {        
        let new_data = "";
        let new_key = "";

        //encrypt key
        for (let char of key) {
            new_key += encrypt_character(char);
        }

        //encrypt value
        for (let char of data[key]) {
            new_data += encrypt_character(char);
        }
        
        //add the encrypted data
        encrypted[new_key] = new_data;
    });
    return encrypted;
}

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
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(encrypt_json({ 
                    username: username, 
                    password: password, 
                    email: email 
                }))
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
                body: JSON.stringify(encrypt_json({ 
                    username: username, 
                    password: password 
                }))
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

    // Send OTP
    document.getElementById('OTPForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmailOTP').value;

        try {
            const response = await fetch('/api/users/OTP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(encrypt_json({ 
                    email: email, 
                }))
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                // Store token in localStorage
                localStorage.setItem('email', result.email);
            } else {
                showMessage(`❌ Login failed: ${result.error}`, 'danger');
            }
        } catch (error) {
            showMessage(`❌ Network error: ${error.message}`, 'danger');
        }
    });

    // Login user - OTP
    document.getElementById('OTPLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const OTP = document.getElementById('OTP').value;

        try {
            const response = await fetch('/api/users/OTP/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(encrypt_json({ 
                    email: localStorage.getItem("email"),
                    OTP: OTP, 
                }))
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
                body: JSON.stringify(encrypt_json({ username: username, password: password, new_password: new_password }))
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
                body: JSON.stringify(encrypt_json({ username: username }))
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