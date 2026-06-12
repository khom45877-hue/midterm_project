// Authentication Utility Functions

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current logged-in user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Register a new user
function registerUser(email, password, confirmPassword, fullName) {
    // Validation
    if (!email || !password || !confirmPassword || !fullName) {
        return { success: false, message: 'All fields are required' };
    }

    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
    }

    if (password !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
    }

    if (!validateEmail(email)) {
        return { success: false, message: 'Invalid email format' };
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        email,
        password: hashPassword(password),
        fullName,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    return { success: true, message: 'Registration successful! Please login.' };
}

// Login user
function loginUser(email, password) {
    if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);

    if (!user) {
        return { success: false, message: 'Email not found' };
    }

    if (!verifyPassword(password, user.password)) {
        return { success: false, message: 'Incorrect password' };
    }

    // Set current user (don't store password in session)
    const sessionUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    return { success: true, message: 'Login successful!' };
}

// Logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
}

// Simple password hashing (basic - use bcrypt for production)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hashed_' + Math.abs(hash).toString(16);
}

// Verify password
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number
function validatePhone(phone) {
    const re = /^[0-9]{7,15}$/;
    return re.test(phone.replace(/\D/g, ''));
}

// Require login - redirect if not logged in
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'index.hmtl';
    }
}

// Auto-fill user info in checkout if logged in
function autofillCheckoutForm() {
    const user = getCurrentUser();
    if (user) {
        const fullNameInput = document.querySelector('input[type="text"]:first-of-type');
        if (fullNameInput) fullNameInput.value = user.fullName;

        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) emailInput.value = user.email;
    }
}
