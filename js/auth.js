// 3D Authentication Logic (Connected to Flask + MySQL)
const API_URL = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const pass = document.getElementById('signupPass').value;

            try {
                const response = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password: pass })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Account created successfully! Please sign in.");
                    window.location.reload();
                } else {
                    alert(data.error || "Signup failed");
                }
            } catch (error) {
                console.error("Signup error:", error);
                alert("Could not connect to the authentication server. Ensure Flask is running.");
            }
        });
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPass').value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: pass })
                });

                const data = await response.json();

                if (response.ok) {
                    // Set session locally after successful server auth
                    localStorage.setItem('currentUser', JSON.stringify({
                        name: data.user.name,
                        email: data.user.email,
                        loginTime: Date.now()
                    }));

                    window.location.href = 'index.html';
                } else {
                    alert(data.error || "Invalid credentials");
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("Could not connect to the authentication server. Ensure Flask is running.");
            }
        });
    }
});

// Auth Check Utility (To be injected into pages)
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const isAuthPage = window.location.pathname.includes('auth.html');

    if (!user && !isAuthPage) {
        window.location.href = 'auth.html';
    } else if (user && isAuthPage) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}
